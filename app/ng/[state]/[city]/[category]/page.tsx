import CityHeader from "@/components/CityHeader";
import AdCard, { type Ad as AdCardAd } from "@/components/ads/AdCard";
import NoAds from "@/components/ads/NoAds";
import LoadingLink from "@/components/navigation/LoadingLink";;
import AgeGate from "@/components/AgeGate";
import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";
import { CATEGORIES } from "@/lib/categories";

type Params = {
  state?: string;
  city?: string;
  category?: string;
};

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const stateSlug = p.state ?? "";
  const citySlug = p.city ?? "";
  const categorySlug = p.category ?? "";

  if (!stateSlug || !citySlug || !categorySlug) {
    return (
      <main className="min-h-screen">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-10">
          <div className="mt-6 card p-4">
            <div className="text-sm font-semibold text-red-600">
              Missing route params
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Expected URL format:
              <span className="font-mono"> /ng/[state]/[city]/[category]</span>
              <br />
              Example:
              <span className="font-mono"> /ng/lagos/ikeja/female-escorts</span>
            </div>
          </div>
        </section>

        <AgeGate />
      </main>
    );
  }

  const stateName = titleCaseFromSlug(stateSlug);
  const cityName = titleCaseFromSlug(citySlug);

  const categoryLabel =
    CATEGORIES.find((c) => c.slug === categorySlug)?.label ??
    titleCaseFromSlug(categorySlug);

  const now = new Date();

  const all = await prisma.ad.findMany({
    where: {
      countrySlug: "ng",
      stateSlug,
      citySlug,
      categorySlug,
      status: AdStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      featured: true,
      createdAt: true,
      stateSlug: true,
      citySlug: true,
      imageUrls: true,
      owner: {
        select: {
          userSlug: true,
          verified: true,
          profile: {
            select: {
              city: true,
              state: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

    const toCard = (a: any): AdCardAd => ({
    id: a.id,
    username: a.owner?.userSlug ?? "user",
    userSlug: a.owner?.userSlug ?? "",
    verified: Boolean(a.owner?.verified),
    postedAt: a.createdAt.toISOString(),
    title: a.title,
    state: a.owner?.profile?.state ?? titleCaseFromSlug(a.stateSlug),
    city: a.owner?.profile?.city ?? titleCaseFromSlug(a.citySlug),
    hasImage: (a.imageUrls?.length ?? 0) > 0,
    featured: Boolean(a.featured),
    avatarUrl: a.owner?.profile?.avatarUrl ?? undefined,
  });

  const featured = all.filter((a) => Boolean(a.featured)).map(toCard);
  const latest = all.filter((a) => !Boolean(a.featured)).map(toCard);
  const hasAny = featured.length + latest.length > 0;

  return (
    <main className="min-h-screen">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10">
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">
            {categoryLabel} in{" "}
            <span className="gold-text">
              {cityName}, {stateName}
            </span>
          </h1>

          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            <LoadingLink
              href="/ng"
              className="text-inherit transition-all duration-200 hover:underline active:opacity-70"
            >
              Nigeria
            </LoadingLink>{" "}
            <span className="mx-1">{">"}</span>
            <LoadingLink
              href={`/ng/${stateSlug}/${citySlug}`}
              className="text-inherit transition-all duration-200 hover:underline active:opacity-70"
            >
              {stateName} {" > "} {cityName}
            </LoadingLink>{" "}
            <span className="mx-1">{">"}</span>
            <span className="font-semibold gold-text">{categoryLabel}</span>
          </p>

          <div className="mt-6">
            {!hasAny ? (
              <NoAds />
            ) : (
              <div className="space-y-6">
                {featured.length > 0 ? (
                  <div className="card p-4">
                    <div className="mb-3 text-sm font-bold ">
                      Featured
                    </div>
                    <div className="space-y-3">
                      {featured.map((ad) => (
                        <AdCard key={ad.id} ad={ad} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {latest.length > 0 ? (
                  <div className="card p-4">
                    <div className="mb-3 text-sm font-bold">
                      Latest
                    </div>
                    <div className="space-y-3">
                      {latest.map((ad) => (
                        <AdCard key={ad.id} ad={ad} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <AgeGate />
    </main>
  );
}