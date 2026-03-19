import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generatePasswordResetToken,
  getPasswordResetTokenExpiry,
  hashPasswordResetToken,
} from "@/lib/tokens";
import { resend } from "@/lib/resend";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email, we sent a reset link.";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildResetPasswordEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin-bottom: 12px;">Reset your VelvetLynk password</h2>
      <p>We received a request to reset your password.</p>
      <p>
        <a
          href="${resetUrl}"
          style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px;"
        >
          Reset Password
        </a>
      </p>
      <p>This link expires in 30 minutes and can only be used once.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    // Always return the same response shape to avoid account enumeration.
    if (!user || !user.email || !user.passwordHash) {
      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = getPasswordResetTokenExpiry();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL;

    if (!appUrl) {
      console.error("Missing APP URL env for password reset email.");
      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    const resetUrl = `${appUrl.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: user.email,
      subject: "Reset your VelvetLynk password",
      html: buildResetPasswordEmailHtml(resetUrl),
    });

    return NextResponse.json(
      { message: GENERIC_SUCCESS_MESSAGE },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}