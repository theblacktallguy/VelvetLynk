"use client";

import Link from "next/link";

type Item = { label: string; done: boolean };

export default function ProfileCompletionCard({
  percent,
  items,
  ctaHref,
  ctaLabel,
}: {
  percent: number; // 0 - 100
  items: Item[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const safe = Math.max(0, Math.min(100, percent));

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">
            Profile completion
          </div>
          <div className="mt-1 text-xs">
            Complete required items to unlock posting.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-green-800">{safe}%</div>

          {ctaHref && ctaLabel ? (
            <Link
              href={ctaHref}
              className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full"
            style={{
              width: `${safe}%`,
              background: "rgba(18, 163, 13, 1)",
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-sm">
            <span
              className={[
                "inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold",
                it.done
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500",
              ].join(" ")}
            >
              {it.done ? "✓" : "•"}
            </span>
            <span
              className={
                it.done
                  ? "text-zinc-800 dark:text-zinc-400"
                  : ""
              }
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}