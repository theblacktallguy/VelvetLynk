"use client";

import LoadingLink from "@/components/navigation/LoadingLink";

export default function SupportCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="text-s font-bold">
        Support
      </div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Get help, contact support, and review your ticket history.
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <LoadingLink
          href="/contact"
          className="rounded-lg border px-3 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          Contact Support
        </LoadingLink>

        <LoadingLink
          href="/account/support"
          className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          View Tickets
        </LoadingLink>
      </div>
    </div>
  );
}