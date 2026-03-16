"use client";

import Link from "next/link";

export default function SettingsSecurityCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="text-s font-bold">
        Settings & security
      </div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Manage password, email verification, security settings, and account controls.
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/account/settings"
          className="rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
        >
          Open settings
        </Link>
      </div>
    </div>
  );
}