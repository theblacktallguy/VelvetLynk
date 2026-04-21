import LoadingLink from "@/components/navigation/LoadingLink";
import CityHeader from "@/components/CityHeader";
import AgeGate from "@/components/AgeGate";
import CategorySeo from "@/components/CategorySeo";

type Params = { state?: string; city?: string };

const CATEGORIES = [
  "Female Escorts",
  "Male Escorts",
  "Female Massage",
  "Male Massage",
  "Males for Couples",
  "Females for Couples",
  "Casual Dating",
  "Platonic Dating",
  "Friendships",
  "Missed Connections",
  "Gay",
  "Lesbian",
];

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\/]+/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function titleCaseFromSlug(slug: string | undefined) {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function CityPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const stateSlug = p.state;
  const citySlug = p.city;

  if (!stateSlug || !citySlug) {
    return (
      <main className="min-h-screen">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="card p-4">
            <div className="text-sm font-semibold text-red-600">
              Missing route params
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Expected URL format:
              <span className="font-mono"> /ng/[state]/[city]</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const stateName = titleCaseFromSlug(stateSlug);
  const cityName = titleCaseFromSlug(citySlug);

  return (
    <main className="min-h-screen">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10">
        {/* Clickable breadcrumbs */}
        <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-400">
          <LoadingLink
            href="/ng"
            className="transition-all duration-200 hover:underline active:opacity-70"
          >
            Nigeria
          </LoadingLink>{" "}
          <span className="mx-1">{">"}</span>
          <span className="font-semibold gold-text">{stateName}</span>{" "}
          <span className="mx-1">{">"}</span>
          <span className="font-semibold gold-text">{cityName}</span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold">
          Welcome to{" "}
          <span className="gold-text">
            {cityName}, {stateName}
          </span>
        </h1>

        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
          Select a category to view listings in this city.
        </p>

        <div className="mt-6 card p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((name) => {
              const categorySlug = slugify(name);
              return (
                <LoadingLink
                  key={categorySlug}
                  href={`/ng/${stateSlug}/${citySlug}/${categorySlug}`}
                  className="rounded-lg border px-3 py-3 text-sm transition-all duration-200 gold-border hover:bg-[rgba(212,175,55,0.10)] active:scale-[0.98] active:opacity-80"
                >
                  {name}
                </LoadingLink>
              );
            })}
          </div>
        </div>
      </section>

      <CategorySeo city={cityName} state={stateName} />

      <AgeGate />

    </main>
  );
}