"use client";

import Link from "next/link";

export default function VerificationCard({ verified }: { verified: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">
            Verification
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Increase trust and ranking with a verification badge.
          </div>
        </div>

        <span
          className={[
            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            verified
              ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-2 w-2 rounded-full",
              verified ? "bg-blue-500" : "bg-zinc-400",
            ].join(" ")}
          />
          {verified ? "Verified" : "Not Verified"}
        </span>
      </div>

      <div className="mt-4">
        <Link
          href="/account/verification"
          className="inline-flex rounded-lg border px-3 py-2 text-sm gold-border hover:bg-amber-600/60"
        >
          {verified ? "Manage verification" : "Get verified"}
        </Link>
      </div>
    </div>
  );
}