"use client";

import Link from "next/link";

export default function VerificationCard({ verified }: { verified: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">Verification</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {verified
              ? "Your profile is verified and your trust badge is active."
              : "Complete verification to unlock your badge and receive 2,000 bonus credits after approval."}
          </div>
        </div>

        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[9px] font-semibold",
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

      {!verified && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm bg-amber-400/40 text-zinc-900">
          <div className="font-semibold">Verification Reward</div>
          <div className="mt-1 text-xs sm:text-sm">
            Get verified and receive <span className="font-bold">2,000 bonus credits</span> in your wallet once your verification is approved.
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/account/verification"
          className="inline-flex rounded-lg border px-3 py-2 text-sm gold-border hover:bg-amber-600/60"
        >
          {verified ? "View verification" : "Get verified"}
        </Link>
      </div>
    </div>
  );
}