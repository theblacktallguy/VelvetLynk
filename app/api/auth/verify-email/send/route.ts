import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmailForUser } from "@/lib/send-email-verification";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "User email not found.", code: "EMAIL_NOT_FOUND" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { ok: true, message: "Your email is already verified." },
        { status: 200 }
      );
    }

    await sendVerificationEmailForUser({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      message: "Verification email sent.",
    });
  } catch (error) {
    console.error("Send verify email error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email." },
      { status: 500 }
    );
  }
}