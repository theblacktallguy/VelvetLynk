import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BASE_COST = 650;
const FEATURED_COST = 1000;
const EXTENDED_COST = 600;

const EXTENDED_DAYS = 20;

function getTotalCost(featured: boolean, expiresDays: number) {
  let total = BASE_COST;
  if (featured) total += FEATURED_COST;
  if (expiresDays === EXTENDED_DAYS) total += EXTENDED_COST;
  return total;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { adId } = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    select: {
      id: true,
      ownerId: true,
      featured: true,
      durationDays: true,
      title: true,
    },
  });

  if (!ad || ad.ownerId !== userId) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  const renewalCost = getTotalCost(ad.featured, ad.durationDays);

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

  if (!user?.wallet || user.wallet.credits < renewalCost) {
    return NextResponse.json(
      {
        error: "Insufficient credits to renew this ad.",
        requiredCredits: renewalCost,
        walletCredits: user?.wallet?.credits ?? 0,
      },
      { status: 402 }
    );
  }

  const expiresDays = ad.durationDays;

  const newExpiresAt = new Date(
    Date.now() + expiresDays * 24 * 60 * 60 * 1000
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          credits: {
            decrement: renewalCost,
          },
        },
      });

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: user.wallet!.id },
        select: { credits: true },
      });

      await tx.ad.update({
        where: { id: ad.id },
        data: {
          status: "ACTIVE",
          publishedAt: new Date(),
          expiresAt: newExpiresAt,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          userId,
          type: "AD_RENEW",
          amount: -renewalCost,
          credits: renewalCost,
          balanceAfter: updatedWallet!.credits,
          status: "COMPLETED",
          description: `Renewed ad: ${ad.title}`,
          reference: `ad_renew_${ad.id}_${Date.now()}`,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Renew ad error:", error);
    return NextResponse.json({ error: "Failed to renew ad." }, { status: 500 });
  }
}