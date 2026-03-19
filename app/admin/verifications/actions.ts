"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  sendLevelTwoApprovedEmail,
  sendLevelTwoRejectedEmail,
  sendVerificationBonusCreditedEmail,
} from "@/lib/verification-status-mail";

const VERIFICATION_BONUS_CREDITS = 2000;
const REFERRAL_VERIFICATION_CREDITS = 300;

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
          id: true,
          email: true,
          userSlug: true,
          verified: true,
          verificationBonusClaimed: true,
          referralBonusClaimed: true,
          referredById: true,
          wallet: {
            select: {
              id: true,
              credits: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    redirect("/admin/verifications?error=not_found");
  }

  let verificationBonusGranted = false;

  await prisma.$transaction(async (tx) => {
    await tx.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewNote: null,
      },
    });

    const approvedUser = await tx.user.update({
      where: { id: request.userId },
      data: {
        verified: true,
      },
      select: {
        id: true,
        email: true,
        userSlug: true,
        verificationBonusClaimed: true,
        referralBonusClaimed: true,
        referredById: true,
        wallet: {
          select: {
            id: true,
            credits: true,
          },
        },
      },
    });

    const verificationBonusClaim = await tx.user.updateMany({
      where: {
        id: approvedUser.id,
        verificationBonusClaimed: false,
      },
      data: {
        verificationBonusClaimed: true,
        verificationBonusClaimedAt: new Date(),
      },
    });

    if (verificationBonusClaim.count === 1) {
      const wallet = approvedUser.wallet
        ? approvedUser.wallet
        : await tx.wallet.create({
            data: {
              userId: approvedUser.id,
              credits: 0,
            },
            select: {
              id: true,
              credits: true,
            },
          });

      const newBalance = wallet.credits + VERIFICATION_BONUS_CREDITS;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          credits: {
            increment: VERIFICATION_BONUS_CREDITS,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: approvedUser.id,
          type: "VERIFICATION_BONUS",
          amount: 0,
          credits: VERIFICATION_BONUS_CREDITS,
          balanceAfter: newBalance,
          status: "COMPLETED",
          description: "Level 2 verification reward bonus",
          reference: `verification_bonus_${approvedUser.id}`,
          provider: "SYSTEM",
          metadata: {
            source: "LEVEL_TWO_VERIFICATION_APPROVAL",
            verificationRequestId: request.id,
          },
        },
      });

      verificationBonusGranted = true;
    }

    // 2) Give the verified referrer the first-stage 300 referral bonus once
    if (approvedUser.referredById) {
      const referral = await tx.referral.findUnique({
        where: {
          referredUserId: approvedUser.id,
        },
        select: {
          id: true,
          referrerId: true,
          verificationRewardClaimed: true,
        },
      });

      if (referral && !referral.verificationRewardClaimed) {
        const referrer = await tx.user.findUnique({
          where: { id: referral.referrerId },
          select: {
            id: true,
            verified: true,
            wallet: {
              select: {
                id: true,
                credits: true,
              },
            },
          },
        });

        if (referrer?.verified) {
          const verificationReferralClaim = await tx.referral.updateMany({
            where: {
              id: referral.id,
              verificationRewardClaimed: false,
            },
            data: {
              verificationRewardClaimed: true,
              verificationRewardClaimedAt: new Date(),
            },
          });

          if (verificationReferralClaim.count === 1) {
            const referrerWallet = referrer.wallet
              ? referrer.wallet
              : await tx.wallet.create({
                  data: {
                    userId: referrer.id,
                    credits: 0,
                  },
                  select: {
                    id: true,
                    credits: true,
                  },
                });

            const referrerNewBalance =
              referrerWallet.credits + REFERRAL_VERIFICATION_CREDITS;

            await tx.wallet.update({
              where: { id: referrerWallet.id },
              data: {
                credits: {
                  increment: REFERRAL_VERIFICATION_CREDITS,
                },
              },
            });

            await tx.walletTransaction.create({
              data: {
                walletId: referrerWallet.id,
                userId: referrer.id,
                type: "REFERRAL_BONUS",
                amount: 0,
                credits: REFERRAL_VERIFICATION_CREDITS,
                balanceAfter: referrerNewBalance,
                status: "COMPLETED",
                description: `Referral reward: @${approvedUser.userSlug} completed Level 2 verification`,
                reference: `referral_verification_bonus_${approvedUser.id}`,
                provider: "SYSTEM",
                metadata: {
                  source: "REFERRAL_VERIFICATION_STAGE",
                  referralId: referral.id,
                  referredUserId: approvedUser.id,
                  referredUserSlug: approvedUser.userSlug,
                  verificationRequestId: request.id,
                  stage: "VERIFICATION",
                  stageCredits: REFERRAL_VERIFICATION_CREDITS,
                  remainingStageCredits: 700,
                  totalReferralCredits: 1000,
                },
              },
            });
          }
        }
      }
    }
  });

  if (request.user.email) {
    try {
      await sendLevelTwoApprovedEmail({
        to: request.user.email,
        userSlug: request.user.userSlug,
      });
    } catch (error) {
      console.error("Failed to send verification approval email:", error);
    }

    if (verificationBonusGranted) {
      try {
        await sendVerificationBonusCreditedEmail({
          to: request.user.email,
          userSlug: request.user.userSlug,
          credits: VERIFICATION_BONUS_CREDITS,
        });
      } catch (error) {
        console.error("Failed to send verification bonus email:", error);
      }
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