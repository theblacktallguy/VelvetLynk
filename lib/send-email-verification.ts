import { prisma } from "@/lib/prisma";
import {
  generateEmailVerificationToken,
  getEmailVerificationExpiry,
  hashEmailVerificationToken,
} from "@/lib/email-verification";
import { sendEmailVerificationEmail } from "@/lib/email-verification-mail";

export async function sendVerificationEmailForUser(params: {
  userId: string;
  email: string;
}) {
  const rawToken = generateEmailVerificationToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = getEmailVerificationExpiry();

  await prisma.emailVerificationToken.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt,
    },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL;

  if (!appUrl) {
    throw new Error("Missing app URL configuration.");
  }

  const verifyUrl = `${appUrl.replace(/\/+$/, "")}/verify-email?token=${encodeURIComponent(rawToken)}`;

  await sendEmailVerificationEmail({
    to: params.email,
    verifyUrl,
  });
}