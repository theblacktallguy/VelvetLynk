"use client";

import LoadingLink from "@/components/navigation/LoadingLink";

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
        <LoadingLink
          href="/account/settings"
          className="rounded-lg border px-3 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          Open settings
        </LoadingLink>
      </div>
    </div>
  );
}