import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FEATURED_COST = 1000;

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
      featured: true,
      status: true,
    },
  });

  if (!ad || ad.ownerId !== userId) {
    return NextResponse.json({ error: "Ad not found." }, { status: 404 });
  }

  if (ad.featured) {
    return NextResponse.json(
      { error: "This ad is already featured.", code: "ALREADY_FEATURED" },
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

  if (user.wallet.credits < FEATURED_COST) {
    return NextResponse.json(
      {
        error: `You need ${FEATURED_COST} credits to feature this ad, but your wallet has ${user.wallet.credits} credits.`,
        code: "INSUFFICIENT_CREDITS",
        requiredCredits: FEATURED_COST,
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
            gte: FEATURED_COST,
          },
        },
        data: {
          credits: {
            decrement: FEATURED_COST,
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

      await tx.ad.update({
        where: { id: ad.id },
        data: {
          featured: true,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          userId,
          type: "FEATURED_UPGRADE",
          amount: -FEATURED_COST,
          credits: FEATURED_COST,
          balanceAfter: updatedWallet.credits,
          status: "COMPLETED",
          description: `Featured upgrade: ${ad.title}`,
          reference: `featured_upgrade_${ad.id}`,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "Insufficient credits to feature this ad.",
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

    console.error("Featured upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to feature ad." },
      { status: 500 }
    );
  }
}