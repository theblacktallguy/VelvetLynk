"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const MAX_PHOTOS = 5;
const MAX_GALLERY_PHOTOS = 4;

const RESERVED_SLUGS = new Set([
  "admin",
  "support",
  "account",
  "login",
  "register",
  "ng",
  "post",
  "ad",
  "api",
  "profile",
  "terms",
  "privacy",
  "safety",
  "contact",
]);

function toOptionalString(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPhotoUrls(v: FormDataEntryValue | null): string[] {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return [];
  return s
    .split(/\r?\n|,/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function saveProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/profile/edit");

  const userId = session.user.id;

  const requestedSlugRaw = toOptionalString(formData.get("userSlug"));
  const requestedSlug = requestedSlugRaw ? normalizeSlug(requestedSlugRaw) : null;

  if (requestedSlug) {
    if (
      requestedSlug.length < 3 ||
      requestedSlug.length > 30 ||
      RESERVED_SLUGS.has(requestedSlug)
    ) {
      redirect("/account/profile/edit?error=bad_username");
    }

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { userSlug: true },
    });

    if (current && current.userSlug !== requestedSlug) {
      const existing = await prisma.user.findUnique({
        where: { userSlug: requestedSlug },
        select: { id: true },
      });

      if (existing) redirect("/account/profile/edit?error=username_taken");

      await prisma.user.update({
        where: { id: userId },
        data: { userSlug: requestedSlug },
      });
    }
  }

  const bio = toOptionalString(formData.get("bio"));
  const safeBio = bio ? bio.slice(0, 150) : null;

  const phone = toOptionalString(formData.get("phone"));
  const email = toOptionalString(formData.get("email"));
  const whatsapp = toOptionalString(formData.get("whatsapp"));
  const snapchat = toOptionalString(formData.get("snapchat"));
  const instagram = toOptionalString(formData.get("instagram"));
  const website = toOptionalString(formData.get("website"));
  const city = toOptionalString(formData.get("city"));
  const state = toOptionalString(formData.get("state"));

  const avatarUrl = toOptionalString(formData.get("avatarUrl"));

  const submittedPhotoUrls = toPhotoUrls(formData.get("photoUrls"))
    .filter((url) => url && url !== avatarUrl)
    .slice(0, MAX_GALLERY_PHOTOS);

  const totalUsed = (avatarUrl ? 1 : 0) + submittedPhotoUrls.length;
  if (totalUsed > MAX_PHOTOS) {
    redirect("/account/profile/edit?error=photo_limit");
  }

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      bio: safeBio,
      phone,
      email,
      whatsapp,
      snapchat,
      instagram,
      website,
      city,
      state,
      avatarUrl,
      photoUrls: submittedPhotoUrls,
    },
    update: {
      bio: safeBio,
      phone,
      email,
      whatsapp,
      snapchat,
      instagram,
      website,
      city,
      state,
      avatarUrl,
      photoUrls: submittedPhotoUrls,
    },
  });

  redirect("/account");
}