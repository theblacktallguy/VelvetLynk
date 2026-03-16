import CityHeader from "@/components/CityHeader";
import Link from "next/link";
import ContactSection from "@/components/ads/ContactSection";
import AdImageCarousel from "@/components/ads/AdImageCarousel";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";

type Params = { id?: string };

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams =
    params && "then" in (params as any)
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const ad = await prisma.ad.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      title: true,
      body: true,
      imageUrls: true,
      citySlug: true,
      stateSlug: true,
      categorySlug: true,
      status: true,
    },
  });

  if (!ad) {
    return {
      title: "Ad not found",
      description: "This ad could not be found.",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://secretlink.com";

  const title = ad.title;
  const description =
    ad.body?.trim().slice(0, 160) ||
    `${ad.categorySlug} ad in ${ad.citySlug}, ${ad.stateSlug}`;

  const firstImage = ad.imageUrls?.[0] || null;
  const imageUrl = firstImage
    ? firstImage.startsWith("http")
      ? firstImage
      : `${siteUrl}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
    : `${siteUrl}/assets/og-default.jpg`;

  const canonicalUrl = `${siteUrl}/ad/${ad.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function AdPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const id = p.id;
  const now = new Date();

  const ad = id
    ? await prisma.ad.findFirst({
        where: {
          id,
          status: AdStatus.ACTIVE,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
          stateSlug: true,
          citySlug: true,
          categorySlug: true,
          sex: true,
          age: true,
          orientation: true,
          locationText: true,
          imageUrls: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          owner: {
            select: {
              userSlug: true,
              profile: {
                select: {
                  state: true,
                  city: true,
                },
              },
            },
          },
        },
      })
    : null;

  if (!id || !ad) {
    return (
      <main className="min-h-screen">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="card p-4">
            <div className="text-sm font-semibold">Ad not found</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-500">
              This ad may have expired or been removed.
            </div>

            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Requested id:{" "}
              <span className="font-mono">{String(id ?? "")}</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const profileUrl = `/profile/${ad.owner.userSlug}`;

  const stateLabel =
    ad.owner.profile?.state ?? titleCaseFromSlug(ad.stateSlug);

  const cityLabel =
    ad.owner.profile?.city ?? titleCaseFromSlug(ad.citySlug);

  const categoryLabel = titleCaseFromSlug(ad.categorySlug);

  const postedAt = ad.createdAt.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const images = ad.imageUrls ?? [];

  const details = {
    sex: ad.sex ?? "—",
    age: ad.age ?? "—",
    orientation: ad.orientation ?? "—",
    location: ad.locationText ?? "—",
  };

  const contact = {
    phone: ad.phone ?? undefined,
    email: ad.email ?? undefined,
    whatsapp: ad.whatsapp ?? undefined,
    snapchat: ad.snapchat ?? undefined,
  };

  return (
    <main className="min-h-screen">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10">
        <div className="mt-6 text-2xl font-semibold ">
          {cityLabel}, {stateLabel}
        </div>

        <div className="mt-3 text-sm ">
          <Link href="/ng" className="hover:underline">
            Nigeria
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/ng/${ad.stateSlug}/${ad.citySlug}`}
            className="hover:underline"
          >
            {stateLabel} &gt; {cityLabel}
          </Link>{" "}
          &gt;{" "}
          <span className="font-semibold gold-text">{categoryLabel}</span>
        </div>

        <div className="mt-4 card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center text-xs text-zinc-500 dark:text-zinc-500">
              {postedAt}
            </div>

            <Link
              href={profileUrl}
              className="shrink-0 rounded-md border px-2 py-1 text-xs gold-border hover:bg-[rgba(212,175,55,0.10)]"
            >
              View Profile
            </Link>
          </div>

          <h1 className="mt-2 break-words text-lg font-semibold ">
            {ad.title}
          </h1>

          <div className="mt-3 flex justify-center">
            <div className="w-full max-w-3xl">
              <AdImageCarousel images={images} />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-2">
              <div className="border-b border-r border-zinc-200 p-3 text-xs font-semibold dark:border-zinc-800">
                Sex
              </div>
              <div className="border-b border-zinc-200 p-3 text-sm dark:border-zinc-800 ">
                {details.sex}
              </div>

              <div className="border-b border-r border-zinc-200 p-3 text-xs font-semibold dark:border-zinc-800">
                Age
              </div>
              <div className="border-b border-zinc-200 p-3 text-sm dark:border-zinc-800 ">
                {details.age}
              </div>

              <div className="border-b border-r border-zinc-200 p-3 text-xs font-semibold dark:border-zinc-800">
                Sexual Orientation
              </div>
              <div className="border-b border-zinc-200 p-3 text-sm  dark:border-zinc-800 ">
                {details.orientation}
              </div>

              <div className="border-r border-zinc-200 p-3 text-xs font-semibold dark:border-zinc-800">
                Location
              </div>
              <div className="p-3 text-sm ">
                {details.location}
              </div>
            </div>
          </div>

          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 ">
            {ad.body}
          </div>

          <ContactSection contact={contact} />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
            <span>Post ID: {ad.id}</span>
            <span>Posted: {postedAt}</span>

            <Link
              href={`/report?adId=${encodeURIComponent(ad.id)}`}
              className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Report Ad
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}