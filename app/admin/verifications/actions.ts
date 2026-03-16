"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  sendLevelTwoApprovedEmail,
  sendLevelTwoRejectedEmail,
} from "@/lib/verification-status-mail";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/verifications");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      userSlug: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/admin/verifications");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    (user.email && adminEmails.includes(user.email.toLowerCase())) ||
    user.userSlug === "admin";

  if (!isAdmin) {
    redirect("/account");
  }

  return user;
}

function toOptionalString(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function approveVerificationRequest(formData: FormData) {
  await requireAdmin();

  const requestId = toOptionalString(formData.get("requestId"));
  if (!requestId) {
    redirect("/admin/verifications?error=missing_request");
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      userId: true,
      status: true,
      user: {
        select: {
          email: true,
          userSlug: true,
        },
      },
    },
  });

  if (!request) {
    redirect("/admin/verifications?error=not_found");
  }

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewNote: null,
      },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: {
        verified: true,
      },
    }),
  ]);

  if (request.user.email) {
    try {
      await sendLevelTwoApprovedEmail({
        to: request.user.email,
        userSlug: request.user.userSlug,
      });
    } catch (error) {
      console.error("Failed to send verification approval email:", error);
    }
  }

  redirect("/admin/verifications?success=approved");
}

export async function rejectVerificationRequest(formData: FormData) {
  await requireAdmin();

  const requestId = toOptionalString(formData.get("requestId"));
  const reviewNote = toOptionalString(formData.get("reviewNote"));

  if (!requestId) {
    redirect("/admin/verifications?error=missing_request");
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
          userSlug: true,
        },
      },
    },
  });

  if (!request) {
    redirect("/admin/verifications?error=not_found");
  }

  const finalReviewNote = reviewNote ?? "Verification was rejected.";

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewNote: finalReviewNote,
      },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: {
        verified: false,
      },
    }),
  ]);

  if (request.user.email) {
    try {
      await sendLevelTwoRejectedEmail({
        to: request.user.email,
        userSlug: request.user.userSlug,
        reviewNote: finalReviewNote,
      });
    } catch (error) {
      console.error("Failed to send verification rejection email:", error);
    }
  }

  redirect("/admin/verifications?success=rejected");
}