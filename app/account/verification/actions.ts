"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function toOptionalString(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function submitVerificationRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/verification");
  }

  const userId = session.user.id;

  const selfieImageUrl = toOptionalString(formData.get("selfieImageUrl"));
  const proofImageUrl = toOptionalString(formData.get("proofImageUrl"));
  const note = toOptionalString(formData.get("note"));

  if (!selfieImageUrl || !proofImageUrl) {
    redirect("/account/verification?error=missing_images");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      verified: true,
      emailVerified: true,
      verificationRequests: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/verification");
  }

  if (!user.emailVerified) {
    redirect("/account/verification?error=email_not_verified");
  }

  if (user.verified) {
    redirect("/account/verification?success=already_verified");
  }

  if (user.verificationRequests.length > 0) {
    redirect("/account/verification?error=already_pending");
  }

  await prisma.verificationRequest.create({
    data: {
      userId,
      selfieImageUrl,
      proofImageUrl,
      note,
      status: "PENDING",
    },
  });

  redirect("/account/verification?success=submitted");
}