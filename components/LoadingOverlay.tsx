"use client";

export default function LoadingOverlay({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-white/70 backdrop-blur
                    dark:bg-zinc-950/60">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm
                      dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        {label}
      </div>
    </div>
  );
}