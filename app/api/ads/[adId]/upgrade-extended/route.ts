import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXTENDED_COST = 600;
const EXTENDED_DAYS = 20;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ adId: string }> | { adId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { adId } =
    params && "then" in (params as any)
      ? await (params as Promise<{ adId: string }>)
      : (params as { adId: string });

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    select: {
      id: true,
      ownerId: true,
      title: true,
      durationDays: true,
      expiresAt: true,
      status: true,
    },
  });

  if (!ad || ad.ownerId !== userId) {
    return NextResponse.json({ error: "Ad not found." }, { status: 404 });
  }

  if (ad.durationDays >= EXTENDED_DAYS) {
    return NextResponse.json(
      { error: "This ad is already extended.", code: "ALREADY_EXTENDED" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      wallet: {
        select: {
          id: true,
          credits: true,
        },
      },
    },
  });

  if (!user?.wallet) {
    return NextResponse.json(
      { error: "Wallet not found.", code: "WALLET_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (user.wallet.credits < EXTENDED_COST) {
    return NextResponse.json(
      {
        error: `You need ${EXTENDED_COST} credits to extend this ad, but your wallet has ${user.wallet.credits} credits.`,
        code: "INSUFFICIENT_CREDITS",
        requiredCredits: EXTENDED_COST,
        walletCredits: user.wallet.credits,
      },
      { status: 402 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const walletUpdate = await tx.wallet.updateMany({
        where: {
          id: user.wallet!.id,
          credits: {
            gte: EXTENDED_COST,
          },
        },
        data: {
          credits: {
            decrement: EXTENDED_COST,
          },
        },
      });

      if (walletUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: user.wallet!.id },
        select: {
          id: true,
          credits: true,
        },
      });

      if (!updatedWallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const nextExpiresAt = new Date(
        Math.max(
          ad.expiresAt ? new Date(ad.expiresAt).getTime() : Date.now(),
          Date.now()
        ) +
          10 * 24 * 60 * 60 * 1000
      );

      await tx.ad.update({
        where: { id: ad.id },
        data: {
          durationDays: EXTENDED_DAYS,
          expiresAt: nextExpiresAt,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          userId,
          type: "EXTENDED_UPGRADE",
          amount: -EXTENDED_COST,
          credits: EXTENDED_COST,
          balanceAfter: updatedWallet.credits,
          status: "COMPLETED",
          description: `Extended upgrade: ${ad.title}`,
          reference: `extended_upgrade_${ad.id}`,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "Insufficient credits to extend this ad.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Wallet not found.",
          code: "WALLET_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    console.error("Extended upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to extend ad." },
      { status: 500 }
    );
  }
}