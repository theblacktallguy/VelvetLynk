import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { rateLimitExceeded } from "@/lib/rate-limit-response";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

const BASE_COST = 650;
const FEATURED_COST = 1000;
const EXTENDED_COST = 600;

const BASE_DAYS = 10;
const EXTENDED_DAYS = 20;

function hasAnyContact(p: any, fallbackEmail?: string | null) {
  return Boolean(
    p?.phone ||
      p?.email ||
      p?.whatsapp ||
      p?.snapchat ||
      p?.instagram ||
      p?.website ||
      fallbackEmail
  );
}

function countAdContacts(data: {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  snapchat?: string | null;
}) {
  return [data.phone, data.email, data.whatsapp, data.snapchat].filter((v) =>
    Boolean(v?.trim())
  ).length;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: unknown) {
  const v = typeof value === "string" ? value.trim() : "";
  return v || null;
}

function getTotalCost(featured: boolean, expiresDays: number) {
  let total = BASE_COST;
  if (featured) total += FEATURED_COST;
  if (expiresDays === EXTENDED_DAYS) total += EXTENDED_COST;
  return total;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(req);

  const rl = await enforceRateLimit({
    action: "post_ad",
    key: `user:${session.user.id}:ip:${ip}`,
    limit: 8,
    windowMs: 24 * 60 * 60 * 1000, // 8 per day
  });

  if (!rl.allowed) {
    return rateLimitExceeded(rl.resetAt);
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const {
    stateSlug,
    citySlug,
    categorySlug,
    title,
    body: adBody,
    sex,
    age,
    orientation,
    locationText,
    imageUrls,
    featured,
    expiresDays,
    phone,
    email,
    whatsapp,
    snapchat,
    instagram,
    website,
  } = body;

  const cleanStateSlug = normalizeString(stateSlug);
  const cleanCitySlug = normalizeString(citySlug);
  const cleanCategorySlug = normalizeString(categorySlug);
  const cleanTitle = normalizeString(title);
  const cleanBody = normalizeString(adBody);
  const cleanSex = normalizeString(sex);
  const cleanOrientation = normalizeString(orientation);
  const cleanLocationText = normalizeString(locationText);

  const cleanPhone = normalizeOptionalString(phone);
  const cleanEmail = normalizeOptionalString(email);
  const cleanWhatsapp = normalizeOptionalString(whatsapp);
  const cleanSnapchat = normalizeOptionalString(snapchat);

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls
        .map((url: unknown) => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean)
    : [];

  const numericAge = Number(age);
  const isFeatured = Boolean(featured);
  const numericExpiresDays = Number(expiresDays || BASE_DAYS);

  if (!cleanStateSlug || !cleanCitySlug || !cleanCategorySlug) {
    return NextResponse.json({ error: "Missing routing fields" }, { status: 400 });
  }

  if (!cleanTitle) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (cleanTitle.length > 200) {
    return NextResponse.json(
      { error: "Title must be 200 characters or less." },
      { status: 400 }
    );
  }

  if (!cleanBody) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  if (!cleanSex) {
    return NextResponse.json({ error: "Sex is required." }, { status: 400 });
  }

  if (!Number.isFinite(numericAge) || numericAge < 18) {
    return NextResponse.json({ error: "Age is required (18+)." }, { status: 400 });
  }

  if (!cleanOrientation) {
    return NextResponse.json(
      { error: "Please select sexual orientation." },
      { status: 400 }
    );
  }

  if (!cleanLocationText) {
    return NextResponse.json({ error: "Location text is required." }, { status: 400 });
  }

  if (
    !Array.isArray(cleanImageUrls) ||
    cleanImageUrls.length < MIN_PHOTOS ||
    cleanImageUrls.length > MAX_PHOTOS
  ) {
    return NextResponse.json({ error: "Photos must be 3–5" }, { status: 400 });
  }

  if (
    numericExpiresDays !== BASE_DAYS &&
    numericExpiresDays !== EXTENDED_DAYS
  ) {
    return NextResponse.json({ error: "Invalid ad duration." }, { status: 400 });
  }

  const adContactCount = countAdContacts({
    phone: cleanPhone,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    snapchat: cleanSnapchat,
  });

  if (adContactCount < 2) {
    return NextResponse.json(
      { error: "Please add at least 2 contact methods." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      userSlug: true,
      email: true,
      emailVerified: true,
      referredById: true,

      // 🔴 ADD THIS (required for 700 logic)
      referralFirstAdBonusClaimed: true,

      wallet: {
        select: {
          id: true,
          credits: true,
        },
      },
      profile: {
        select: {
          bio: true,
          photoUrls: true,
          state: true,
          city: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          instagram: true,
          website: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.email || !user.emailVerified) {
    return NextResponse.json(
      {
        error: "Please verify your email address before posting an ad.",
        code: "EMAIL_NOT_VERIFIED",
      },
      { status: 403 }
    );
  }

  const p = user.profile;
  const photoCount = p?.photoUrls?.length ?? 0;

  const profileOk =
    Boolean(p?.bio?.trim()) &&
    photoCount >= MIN_PHOTOS &&
    photoCount <= MAX_PHOTOS &&
    Boolean(p?.state?.trim() && p?.city?.trim()) &&
    hasAnyContact(p, user.email);

  if (!profileOk) {
    return NextResponse.json(
      {
        error: "Profile incomplete",
        code: "PROFILE_INCOMPLETE",
        requirements: {
          bio: Boolean(p?.bio?.trim()),
          photos: photoCount,
          hasAnyContact: hasAnyContact(p, user.email),
          location: Boolean(p?.state?.trim() && p?.city?.trim()),
        },
      },
      { status: 403 }
    );
  }

  const totalCost = getTotalCost(isFeatured, numericExpiresDays);

  if (!user.wallet || user.wallet.credits < totalCost) {
    return NextResponse.json(
      {
        error: `You need ${totalCost} credits to publish this ad, but your wallet has ${user.wallet?.credits ?? 0} credits.`,
        code: "INSUFFICIENT_CREDITS",
        requiredCredits: totalCost,
        walletCredits: user.wallet?.credits ?? 0,
      },
      { status: 402 }
    );
  }

  const expiresAt = new Date(
    Date.now() + numericExpiresDays * 24 * 60 * 60 * 1000
  );

  try {
    const result = await prisma.$transaction(async (tx) => {
      const walletUpdate = await tx.wallet.updateMany({
        where: {
          userId: user.id,
          credits: {
            gte: totalCost,
          },
        },
        data: {
          credits: {
            decrement: totalCost,
          },
        },
      });

      if (walletUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          credits: true,
        },
      });

      if (!updatedWallet) {
        throw new Error("WALLET_NOT_FOUND");
      }


      const ad = await tx.ad.create({
        data: {
          ownerId: user.id,
          countrySlug: "ng",
          stateSlug: cleanStateSlug,
          citySlug: cleanCitySlug,
          categorySlug: cleanCategorySlug,
          title: cleanTitle,
          body: cleanBody,
          sex: cleanSex,
          age: Math.trunc(numericAge),
          orientation: cleanOrientation,
          locationText: cleanLocationText,
          imageUrls: cleanImageUrls,
          phone: cleanPhone,
          email: cleanEmail,
          whatsapp: cleanWhatsapp,
          snapchat: cleanSnapchat,
          status: AdStatus.ACTIVE,
          featured: isFeatured,
          durationDays: numericExpiresDays,
          publishedAt: new Date(),
          expiresAt,
        },
        select: { id: true, title: true },
      });

      const existingAdCount = await tx.ad.count({
        where: { ownerId: user.id },
      });

      // 700 referral bonus payout trigger (first ad only)
      if (user.referredById && existingAdCount === 1) {
        const referral = await tx.referral.findUnique({
          where: {
            referredUserId: user.id,
          },
          select: {
            id: true,
            referrerId: true,
            firstAdRewardClaimed: true,
          },
        });

        if (referral && !referral.firstAdRewardClaimed) {
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
            const firstAdReferralClaim = await tx.referral.updateMany({
              where: {
                id: referral.id,
                firstAdRewardClaimed: false,
              },
              data: {
                firstAdRewardClaimed: true,
                firstAdRewardClaimedAt: new Date(),
              },
            });

            if (firstAdReferralClaim.count === 1) {
              const referralBonus = 700;

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

              const newBalance = referrerWallet.credits + referralBonus;

              await tx.wallet.update({
                where: { id: referrerWallet.id },
                data: {
                  credits: {
                    increment: referralBonus,
                  },
                },
              });

              await tx.walletTransaction.create({
                data: {
                  walletId: referrerWallet.id,
                  userId: referrer.id,
                  type: "REFERRAL_BONUS",
                  amount: 0,
                  credits: referralBonus,
                  balanceAfter: newBalance,
                  status: "COMPLETED",
                  description: `Referral reward: @${user.userSlug} posted first ad`,
                  reference: `referral_first_ad_bonus_${user.id}`,
                  provider: "SYSTEM",
                  metadata: {
                    source: "REFERRAL_FIRST_AD_STAGE",
                    referralId: referral.id,
                    referredUserId: user.id,
                    referredUserSlug: user.userSlug,
                    stage: "FIRST_AD",
                    stageCredits: 700,
                    verificationStageCredits: 300,
                    totalReferralCredits: 1000,
                  },
                },
              });
            }
          }
        }
      }

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          userId: user.id,
          type: "AD_POST",
          amount: -totalCost,
          credits: totalCost,
          balanceAfter: updatedWallet.credits,
          status: "COMPLETED",
          description: `Posted ad: ${ad.title}`,
          reference: `ad_post_${ad.id}`,
        },
      });

      return ad;
    });

    if (!result) {
      return NextResponse.json({ error: "Failed to publish ad." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      adId: result.id,
      totalCost,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          error: "Insufficient credits to publish this ad.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Wallet not found.",
          code: "WALLET_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    console.error("Create ad error:", error);
    return NextResponse.json({ error: "Failed to publish ad." }, { status: 500 });
  }
}