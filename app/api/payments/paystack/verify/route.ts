import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string | null;
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

function getWalletReturnUrl(req: NextRequest, status: "success" | "failed") {
  const url = new URL("/account/wallet", req.url);
  url.searchParams.set("payment", status);
  return url;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", "/account/wallet");
      return NextResponse.redirect(loginUrl);
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "missing-reference");
      return NextResponse.redirect(failedUrl);
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "payment-config");
      return NextResponse.redirect(failedUrl);
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const paystackData = (await paystackRes.json()) as PaystackVerifyResponse;

    if (!paystackRes.ok || !paystackData?.status || !paystackData?.data) {
      console.error("Paystack verify failed:", paystackData);

      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "verify-failed");
      return NextResponse.redirect(failedUrl);
    }

    const verifiedTx = paystackData.data;

    if (verifiedTx.status !== "success") {
      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "payment-not-successful");
      return NextResponse.redirect(failedUrl);
    }

    const metadata = verifiedTx.metadata ?? {};
    const paymentType = metadata.paymentType;
    const userId = metadata.userId;
    const walletId = metadata.walletId;
    const credits = Number(metadata.credits || 0);
    const amountNaira = Number(metadata.amountNaira || 0);

    if (
      paymentType !== "wallet_funding" ||
      !userId ||
      !walletId ||
      !Number.isFinite(credits) ||
      credits <= 0 ||
      !Number.isFinite(amountNaira) ||
      amountNaira <= 0
    ) {
      console.error("Invalid Paystack metadata:", verifiedTx.metadata);

      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "invalid-metadata");
      return NextResponse.redirect(failedUrl);
    }

    if (userId !== session.user.id) {
      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "user-mismatch");
      return NextResponse.redirect(failedUrl);
    }

    const existingTx = await prisma.walletTransaction.findUnique({
      where: { reference },
      select: {
        id: true,
        status: true,
      },
    });

    if (existingTx?.status === "COMPLETED") {
      const successUrl = getWalletReturnUrl(req, "success");
      successUrl.searchParams.set("reference", reference);
      successUrl.searchParams.set("credits", String(credits));
      return NextResponse.redirect(successUrl);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        wallet: {
          select: {
            id: true,
            credits: true,
          },
        },
      },
    });

    if (!user?.wallet?.id || user.wallet.id !== walletId) {
      const failedUrl = getWalletReturnUrl(req, "failed");
      failedUrl.searchParams.set("error", "wallet-mismatch");
      return NextResponse.redirect(failedUrl);
    }

    await prisma.$transaction(async (txDb) => {
      const duplicate = await txDb.walletTransaction.findUnique({
        where: { reference },
        select: {
          id: true,
          status: true,
        },
      });

      if (duplicate?.status === "COMPLETED") {
        return;
      }

      const updatedWallet = await txDb.wallet.update({
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

      if (duplicate) {
        await txDb.walletTransaction.update({
          where: { id: duplicate.id },
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
            providerReference: verifiedTx.reference,
            metadata: verifiedTx as any,
          },
        });
      } else {
        await txDb.walletTransaction.create({
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
            providerReference: verifiedTx.reference,
            metadata: verifiedTx as any,
          },
        });
      }
    });

    const successUrl = getWalletReturnUrl(req, "success");
    successUrl.searchParams.set("reference", reference);
    successUrl.searchParams.set("credits", String(credits));
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Paystack verify route error:", error);

    const failedUrl = new URL("/account/wallet", req.url);
    failedUrl.searchParams.set("payment", "failed");
    failedUrl.searchParams.set("error", "server-error");
    return NextResponse.redirect(failedUrl);
  }
}