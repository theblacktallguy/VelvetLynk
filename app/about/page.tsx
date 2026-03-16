import CityHeader from "@/components/CityHeader";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col ">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-8">
          <header className="space-y-2 py-3">
            <h1 className="text-3xl font-bold ">
              About SecretLink
            </h1>
            <p className="text-sm ">
              SecretLink is a location-first platform built to help adults discover connections,
              browse profiles and listings, and communicate with clarity and confidence. We focus on
              a clean browsing experience, strong reporting tools, and transparent policies.
            </p>
          </header>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-semibold ">
              Why we built it
            </h2>
            <p className="text-sm ">
              The internet offers countless ways to meet people—speed dating, online matching, social apps,
              and community forums. But users often struggle with the same problems:
              low-quality listings, unclear expectations, poor safety guidance, and limited accountability.
            </p>
            <p className="text-sm ">
              SecretLink was designed to improve those fundamentals: better structure, clearer categories,
              profiles that encourage completeness, and a reporting system that can scale as the platform grows.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="text-sm font-semibold ">Clarity</div>
              <p className="text-sm ">
                Browsing is organized by country, state, city, and category—so users can find what they want faster.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="text-sm font-semibold ">Safety</div>
              <p className="text-sm ">
                We publish safety guidance, support reporting, and build verification features to reduce fraud and abuse.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="text-sm font-semibold ">Accountability</div>
              <p className="text-sm ">
                We enforce content rules, investigate reports, and remove harmful content to protect users and trust.
              </p>
            </div>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-semibold ">
              Project history
            </h2>
            <p className="text-sm ">
              SecretLink started as a focused prototype: location pages, category browsing, ad details, and public
              profiles. The early goal was to build a stable foundation—routing, taxonomy, authentication, and a
              database schema that can grow into a full platform.
            </p>
            <p className="text-sm ">
              From there, we added account dashboards, profile editing, and the first version of real photo uploads.
              Our approach is iterative: ship the core experience, then expand carefully with moderation,
              verification, and payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold ">
              The team
            </h2>
            <p className="text-sm ">
              SecretLink is built by a small, product-focused team. We prioritize:
            </p>
            <ul className="list-disc pl-5 text-sm  space-y-1">
              <li>Fast iteration with careful attention to reliability and security</li>
              <li>Clear, readable UI in both light and dark modes</li>
              <li>Pragmatic privacy choices and transparent policies</li>
              <li>Safety tooling that can scale (reporting, moderation, verification)</li>
            </ul>
            <p className="text-xs ">
              As the platform grows, we’ll expand support and moderation capacity to maintain quality and trust.
            </p>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-semibold ">
              What’s next (roadmap)
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                <div className="text-sm font-semibold ">Near-term</div>
                <ul className="list-disc pl-5 text-sm  space-y-1">
                  <li>Post Ad flow + ad management</li>
                  <li>DB-powered listings (latest/featured)</li>
                  <li>Report + moderation workflow</li>
                  <li>Verification page foundation</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                <div className="text-sm font-semibold ">Mid-term</div>
                <ul className="list-disc pl-5 text-sm  space-y-1">
                  <li>Messaging system</li>
                  <li>Wallet/credits + deposits</li>
                  <li>Premium placements / promoted listings</li>
                  <li>Safety tooling improvements (rate limits, automated flags)</li>
                </ul>
              </div>
            </div>
            <p className="text-xs ">
              Note: Roadmap items may change based on user feedback, safety needs, and platform growth.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm font-semibold ">
              Transparency
            </div>
            <p className="mt-1 text-sm ">
              We’re committed to improving safety, privacy, and the overall experience. If you have feedback,
              we encourage you to reach out via the Contact page.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}