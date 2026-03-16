import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type PaystackWebhookEvent = {
  event: string;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    channel?: string;
    gateway_response?: string;
    metadata?: {
      paymentType?: string;
      userId?: string;
      walletId?: string;
      credits?: number;
      amountNaira?: number;
      packageLabel?: string;
    } | null;
    customer?: {
      email?: string;
    } | null;
  };
};

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const computedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (!safeEqual(signature, computedSignature)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaystackWebhookEvent;

    if (event.event !== "charge.success" || !event.data) {
      return NextResponse.json({ ok: true });
    }

    const payment = event.data;
    const reference = payment.reference;
    const metadata = payment.metadata ?? {};

    const paymentType = metadata.paymentType;
    const userId = metadata.userId;
    const walletId = metadata.walletId;
    const credits = Number(metadata.credits || 0);
    const amountNaira = Number(metadata.amountNaira || 0);

    if (
      payment.status !== "success" ||
      !reference ||
      paymentType !== "wallet_funding" ||
      !userId ||
      !walletId ||
      !Number.isFinite(credits) ||
      credits <= 0 ||
      !Number.isFinite(amountNaira) ||
      amountNaira <= 0
    ) {
      console.error("Invalid Paystack webhook payload:", event);
      return NextResponse.json({ ok: true });
    }

    await prisma.$transaction(async (tx) => {
      const existingTx = await tx.walletTransaction.findUnique({
        where: { reference },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingTx?.status === "COMPLETED") {
        return;
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
        select: {
          id: true,
          userId: true,
          credits: true,
        },
      });

      if (!wallet || wallet.userId !== userId) {
        console.error("Webhook wallet/user mismatch:", {
          reference,
          walletId,
          userId,
        });
        return;
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          credits: {
            increment: credits,
          },
        },
        select: {
          credits: true,
        },
      });

      if (existingTx) {
        await tx.walletTransaction.update({
          where: { id: existingTx.id },
          data: {
            walletId,
            userId,
            type: "CREDIT_PURCHASE",
            status: "COMPLETED",
            amount: amountNaira,
            credits,
            balanceAfter: updatedWallet.credits,
            description: `Purchased ${credits} credits via Paystack`,
            provider: "PAYSTACK",
            providerReference: reference,
            metadata: payment as any,
          },
        });
      } else {
        await tx.walletTransaction.create({
          data: {
            walletId,
            userId,
            type: "CREDIT_PURCHASE",
            status: "COMPLETED",
            amount: amountNaira,
            credits,
            balanceAfter: updatedWallet.credits,
            description: `Purchased ${credits} credits via Paystack`,
            reference,
            provider: "PAYSTACK",
            providerReference: reference,
            metadata: payment as any,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}