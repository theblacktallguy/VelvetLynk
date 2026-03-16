"use client";

import Link from "next/link";

type AdSummary = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "REMOVED";
  postedAt: string;
};

export default function AdsManager({
  activeCount,
  expiredCount,
  recent,
}: {
  activeCount: number;
  expiredCount: number;
  recent: AdSummary[];
}) {
  return (
    <div className="card w-full max-w-full min-w-0 overflow-hidden p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-s font-bold">
            My Ads
          </div>
          <div className="mt-1 break-words text-xs text-zinc-500 dark:text-zinc-400">
            Recent posts and quick stats.
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/post"
            className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
          >
            Post Ad
          </Link>
          <Link
            href="/account/ads"
            className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
          >
            Manage
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border p-3">
          <div className="text-xs font-semibold">
            Active ads
          </div>
          <div className="mt-1 text-2xl font-semibold text-zinc-800 dark:text-zinc-400">
            {activeCount}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border p-3">
          <div className="text-xs font-semibold">
            Expired ads
          </div>
          <div className="mt-1 text-2xl font-semibold text-zinc-800 dark:text-zinc-400">
            {expiredCount}
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <div className="text-xs font-semibold">
          Recent posts
        </div>

        {recent.length === 0 ? (
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No ads yet. Post your first one.
          </div>
        ) : (
          <div className="mt-2 divide-y divide-zinc-200 overflow-hidden rounded-xl border dark:divide-zinc-800 dark:border-zinc-800">
            {recent.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex min-w-0 items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-400">
                    {a.title}
                  </div>
                  <div className="mt-0.5 break-all text-xs text-zinc-500 dark:text-zinc-400">
                    {a.postedAt}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      a.status === "ACTIVE"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
                    ].join(" ")}
                  >
                    {a.status}
                  </span>

                  <Link
                    href={`/ad/${encodeURIComponent(a.id)}`}
                    className="shrink-0 text-xs underline "
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}