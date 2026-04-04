import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AdStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BASE_COST = 650;
const FEATURED_COST = 1000;
const EXTENDED_COST = 600;

const BASE_DAYS = 10;
const EXTENDED_DAYS = 20;

function getTotalCost(featured: boolean, durationDays: number) {
  let total = BASE_COST;
  if (featured) total += FEATURED_COST;
  if (durationDays === EXTENDED_DAYS) total += EXTENDED_COST;
  return total;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.adId !== "string" || !body.adId.trim()) {
      return NextResponse.json({ error: "Ad ID is required." }, { status: 400 });
    }

    const adId = body.adId.trim();

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        ownerId: true,
        status: true,
        featured: true,
        durationDays: true,
        expiresAt: true,
      },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    if (ad.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const isExpired =
      ad.status === AdStatus.EXPIRED ||
      (ad.expiresAt ? ad.expiresAt.getTime() < now.getTime() : false);

    if (!isExpired) {
      return NextResponse.json(
        { error: "Only expired ads can be renewed." },
        { status: 400 }
      );
    }

    const durationDays =
      ad.durationDays === EXTENDED_DAYS ? EXTENDED_DAYS : BASE_DAYS;

    const totalCost = getTotalCost(ad.featured, durationDays);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        wallet: {
          select: {
            id: true,
            credits: true,
          },
        },
      },
    });

    if (!user?.wallet || user.wallet.credits < totalCost) {
      return NextResponse.json(
        {
          error: `You need ${totalCost} credits to renew this ad, but your wallet has ${user?.wallet?.credits ?? 0} credits.`,
          code: "INSUFFICIENT_CREDITS",
          requiredCredits: totalCost,
          walletCredits: user?.wallet?.credits ?? 0,
        },
        { status: 402 }
      );
    }

    const newPublishedAt = new Date();
    const newExpiresAt = new Date(
      newPublishedAt.getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    await prisma.$transaction(async (tx) => {
      const walletUpdate = await tx.wallet.updateMany({
        where: {
          userId: user.id,
          credits: {
            gte: totalCost,
          },
        },
        data: {
          credits: {
            decrement: totalCost,
          },
        },
      });

      if (walletUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          credits: true,
          userId: true,
        },
      });

      if (!updatedWallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      await tx.ad.update({
        where: {
          id: ad.id,
        },
        data: {
          status: AdStatus.ACTIVE,
          publishedAt: newPublishedAt,
          expiresAt: newExpiresAt,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          userId: updatedWallet.userId,
          type: "AD_RENEW",
          amount: -totalCost,
          credits: 0,
          balanceAfter: updatedWallet.credits,
          status: "COMPLETED",
          description: "Renewed expired ad",
          reference: ad.id,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      adId: ad.id,
      totalCost,
      expiresAt: newExpiresAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "Insufficient credits to renew this ad.",
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

    console.error("PATCH /api/account/ad/renew error:", error);
    return NextResponse.json({ error: "Failed to renew ad." }, { status: 500 });
  }
}