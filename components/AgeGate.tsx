"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  // If true, gate is enabled (you can later disable per-route)
  enabled?: boolean;
  // Where to send users if they reject
  rejectTo?: string;
};

const KEY = "sl_age_ok";

export default function AgeGate({ enabled = true, rejectTo = "/ng" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    try {
      const ok = localStorage.getItem(KEY);
      if (ok !== "1") setOpen(true);
    } catch {
      // If storage blocked, still show
      setOpen(true);
    }
  }, [enabled]);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
      localStorage.setItem("sl_age_ok_at", String(Date.now()));
    } catch {}
    setOpen(false);
  }

  function reject() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("sl_age_ok_at");
    } catch {}
    router.push(rejectTo);
  }

  if (!enabled || !open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={reject}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/60 p-6 shadow-sm">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-white py-3">
            Age verification & content rules
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Please confirm you understand our platform rules before continuing.
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Content */}
        <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

          <p>
            VelvetLynk is a private adult platform intended strictly for individuals
            <span className="font-semibold text-zinc-900 dark:text-white"> 18 years or older</span>.
            This platform may contain adult-oriented material that could be inappropriate
            for minors. If you are under the legal age in your jurisdiction, you must
            leave this site immediately.
          </p>

          <p>
            By continuing, you confirm that you are an adult accessing the platform
            voluntarily and that you agree to comply with all applicable laws and
            VelvetLynk platform rules.
          </p>

          <p>
            Fraud, impersonation, harassment, scams, illegal services, human
            exploitation and drug-related activity are strictly prohibited.
            Accounts violating these rules will be permanently removed and may
            be reported where required.
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This website uses cookies and similar technologies to support login,
            security, personalization and essential platform functionality.
          </p>

        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          
          <button
            type="button"
            onClick={reject}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-400 transition"
          >
            I Reject
          </button>

          <button
            type="button"
            onClick={accept}
            className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60 transition"
          >
            I Accept
          </button>

        </div>

      </div>
    </div>
  );
}