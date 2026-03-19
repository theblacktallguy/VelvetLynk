import CityHeader from "@/components/CityHeader";
import ProfileCarousel from "@/components/profile/ProfileCarousel";
import ProfileBioCard from "@/components/profile/ProfileBioCard";
import ProfileContactCard from "@/components/profile/ProfileContactCard";
import ProfileAdsSection from "@/components/profile/ProfileAdsSection";
import ProfileSafetyCard from "@/components/profile/ProfileSafetyCard";
import type { Ad } from "@/components/ads/AdCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";

type Params = { userSlug?: string };

function titleCaseFromSlug(slug: string | undefined) {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatMemberSince(date: Date) {
  return date.getFullYear().toString();
}

function formatLastActive(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const userSlug = p.userSlug;

  if (!userSlug) {
    return (
      <main className="min-h-screen flex flex-col">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
          <div className="card p-4">
            <div className="text-sm font-semibold text-red-600">
              Missing profile userSlug
            </div>
          </div>
        </section>
      </main>
    );
  }

    const dbUser = await prisma.user.findUnique({
    where: { userSlug },
    select: {
      userSlug: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          bio: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          instagram: true,
          website: true,
          state: true,
          city: true,
          photoUrls: true,
          avatarUrl: true,
          updatedAt: true,
        },
      },
      ads: {
        where: {
          status: AdStatus.ACTIVE,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
          imageUrls: true,
        },
      },
    },
  });

  if (!dbUser) {
    return (
      <main className="min-h-screen flex flex-col">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
          <div className="card p-4">
            <div className="text-sm font-semibold">Profile not found</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This profile does not exist or is no longer available.
            </div>
          </div>
        </section>
      </main>
    );
  }

  const now = new Date();

  const profile = {
    userSlug: dbUser.userSlug,
    fullName:
      titleCaseFromSlug(dbUser.userSlug.replace(/_/g, "-")) || "VelvetLynk User",
    username: dbUser.userSlug,
    verified: dbUser.verified,
    city: dbUser.profile?.city ?? "",
    state: dbUser.profile?.state ?? "",
    bio: dbUser.profile?.bio ?? "",
    phone: dbUser.profile?.phone ?? "",
    email: dbUser.profile?.email ?? "",
    whatsapp: dbUser.profile?.whatsapp ?? "",
    socials: {
      whatsapp: dbUser.profile?.whatsapp
        ? `https://wa.me/${dbUser.profile.whatsapp.replace(/[^\d]/g, "")}`
        : "",
      instagram: dbUser.profile?.instagram
        ? `https://instagram.com/${dbUser.profile.instagram.replace(/^@/, "")}`
        : "",
      snapchat: dbUser.profile?.snapchat
        ? `https://www.snapchat.com/add/${dbUser.profile.snapchat.replace(/^@/, "")}`
        : "",
      telegram: "",
    },
    images:
      dbUser.profile?.photoUrls?.length
        ? dbUser.profile.photoUrls.filter(
            (url) => url && url !== (dbUser.profile?.avatarUrl ?? "")
          )
        : dbUser.profile?.avatarUrl
          ? []
          : [],
  };

  const activeAds: Ad[] = dbUser.ads
    .filter((ad) => !ad.expiresAt || ad.expiresAt > now)
    .map((ad) => ({
      id: ad.id,
      username: profile.username,
      userSlug: profile.userSlug,
      verified: profile.verified,
      postedAt: ad.createdAt.toISOString(),
      title: ad.title,
      state: profile.state,
      city: profile.city,
      hasImage: (ad.imageUrls?.length ?? 0) > 0,
      featured: Boolean(ad.featured),
      avatarUrl: dbUser.profile?.avatarUrl ?? undefined,
    }));

  const expiredAds: Ad[] = dbUser.ads
    .filter((ad) => ad.expiresAt && ad.expiresAt <= now)
    .map((ad) => ({
      id: ad.id,
      username: profile.username,
      userSlug: profile.userSlug,
      verified: profile.verified,
      postedAt: ad.createdAt.toISOString(),
      title: ad.title,
      state: profile.state,
      city: profile.city,
      hasImage: (ad.imageUrls?.length ?? 0) > 0,
      featured: Boolean(ad.featured),
      avatarUrl: dbUser.profile?.avatarUrl ?? undefined,
    }));

      const activityDates = [
    dbUser.updatedAt,
    dbUser.profile?.updatedAt,
    ...dbUser.ads.flatMap((ad) => [ad.createdAt, ad.updatedAt]),
  ].filter(Boolean) as Date[];

  const latestActivityAt =
    activityDates.length > 0
      ? new Date(Math.max(...activityDates.map((d) => d.getTime())))
      : dbUser.createdAt;

  const memberSince = formatMemberSince(dbUser.createdAt);
  const lastActive = formatLastActive(latestActivityAt);

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10 flex-1">
        <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-400">
          <Link className="text-inherit hover:underline" href="/ng">
            Nigeria
          </Link>{" "}
          <span className="mx-1">{">"}</span>
          <Link
            className="text-inherit hover:underline"
            href={`/ng/${profile.state.toLowerCase()}`}
          >
            {profile.state}
          </Link>{" "}
          <span className="mx-1">{">"}</span>
          <Link
            className="text-inherit hover:underline"
            href={`/ng/${profile.state.toLowerCase()}/${profile.city.toLowerCase()}`}
          >
            {profile.city}
          </Link>{" "}
          <span className="mx-1">{">"}</span>
          <span className="text-inherit">Profile</span>{" "}
          <span className="mx-1">{">"}</span>
          <span className="font-semibold gold-text">@{profile.username}</span>
        </div>

        <div className="mt-4">
          <ProfileCarousel
            images={profile.images}
            fullName={profile.fullName}
            username={profile.username}
            verified={profile.verified}
          />
        </div>

        <ProfileBioCard
          bio={profile.bio}
          city={profile.city}
          state={profile.state}
          memberSince={memberSince}
          lastActive={lastActive}
        />

        <ProfileContactCard
          phone={profile.phone}
          email={profile.email}
          whatsapp={profile.whatsapp}
          socials={profile.socials}
        />

        <ProfileAdsSection activeAds={activeAds} expiredAds={expiredAds} />

        <ProfileSafetyCard userSlug={profile.userSlug} />
      </section>
    </main>
  );
}