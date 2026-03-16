"use client";

import Link from "next/link";

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
        <Link
          href="/contact"
          className="rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
        >
          Contact Support
        </Link>
        <Link
          href="/account/support"
          className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-amber-600/60"
        >
          View Tickets
        </Link>
      </div>
    </div>
  );
}