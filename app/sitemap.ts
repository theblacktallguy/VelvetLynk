import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://secretlink.com";

  const now = new Date();

  const ads = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const profiles = await prisma.user.findMany({
    where: {
      profile: {
        isNot: null,
      },
    },
    select: {
      userSlug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const adEntries: MetadataRoute.Sitemap = ads.map((ad) => ({
    url: `${siteUrl}/ad/${ad.id}`,
    lastModified: ad.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const profileEntries: MetadataRoute.Sitemap = profiles
    .filter((user) => Boolean(user.userSlug))
    .map((user) => ({
      url: `${siteUrl}/profile/${user.userSlug}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/ng`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...adEntries,
    ...profileEntries,
  ];
}