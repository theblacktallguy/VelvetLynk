import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CREDIT_PACKAGES = [
  { credits: 1000, amountNaira: 1000, label: "Starter" },
  { credits: 3000, amountNaira: 3000, label: "Standard" },
  { credits: 5000, amountNaira: 5000, label: "Pro" },
  { credits: 10000, amountNaira: 10000, label: "Premium" },
] as const;

function getBaseUrl(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (host) {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/account/wallet/deposit", req.url)
      );
    }

    const formData = await req.formData();

    const credits = Number(formData.get("credits") || 0);
    const amountNaira = Number(formData.get("amountNaira") || 0);

    if (!Number.isFinite(credits) || !Number.isFinite(amountNaira)) {
      return NextResponse.redirect(
        new URL(
          "/account/wallet/deposit?error=invalid-package",
          req.url
        )
      );
    }

    const selectedPackage =
      CREDIT_PACKAGES.find(
        (pkg) =>
          pkg.credits === credits && pkg.amountNaira === amountNaira
      ) ?? null;

    if (!selectedPackage) {
      return NextResponse.redirect(
        new URL(
          "/account/wallet/deposit?error=invalid-package",
          req.url
        )
      );
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

    if (!user?.email) {
      return NextResponse.redirect(
        new URL("/account/wallet/deposit?error=no-email", req.url)
      );
    }

    let walletId = user.wallet?.id;

    if (!walletId) {
      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          credits: 0,
        },
        select: {
          id: true,
        },
      });

      walletId = wallet.id;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.redirect(
        new URL(
          "/account/wallet/deposit?error=payment-config",
          req.url
        )
      );
    }

    const baseUrl = getBaseUrl(req);

    const callbackUrl = `${baseUrl}/api/payments/paystack/verify`;

    const reference = `wallet_${user.id}_${Date.now()}`;

    const payload = {
      email: user.email,
      amount: selectedPackage.amountNaira * 100, // kobo
      currency: "NGN",
      callback_url: callbackUrl,
      reference,
      metadata: {
        paymentType: "wallet_funding",
        userId: user.id,
        walletId,
        credits: selectedPackage.credits,
        amountNaira: selectedPackage.amountNaira,
        packageLabel: selectedPackage.label,
      },
    };

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData?.status || !paystackData?.data?.authorization_url) {
      console.error("Paystack initialize failed:", paystackData);

      return NextResponse.redirect(
        new URL(
          "/account/wallet/deposit?error=initialize-failed",
          req.url
        )
      );
    }

    return NextResponse.redirect(paystackData.data.authorization_url);
  } catch (error) {
    console.error("Paystack initialize route error:", error);

    return NextResponse.redirect(
      new URL(
        "/account/wallet/deposit?error=server-error",
        req.url
      )
    );
  }
}