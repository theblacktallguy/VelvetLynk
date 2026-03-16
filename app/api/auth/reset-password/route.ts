import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashPasswordResetToken } from "@/lib/tokens";

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return "Password must contain at least one letter and one number.";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json(
        { message: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { message: "Password and confirm password are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return NextResponse.json(
        { message: passwordError },
        { status: 400 }
      );
    }

    const tokenHash = hashPasswordResetToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { message: "This reset link has already been used." },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: newPasswordHash,
          sessionVersion: {
            increment: 1,
          },
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: {
            not: resetToken.id,
          },
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}