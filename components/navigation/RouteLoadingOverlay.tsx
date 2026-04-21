// components/navigation/RouteLoadingOverlay.tsx
"use client";

import { useRouteLoading } from "./RouteLoadingProvider";

export default function RouteLoadingOverlay() {
  const { isLoading } = useRouteLoading();

  return (
    <div
      className={[
        "pointer-events-none fixed inset-0 z-[9999] transition-all duration-200",
        isLoading
          ? "visible opacity-100"
          : "invisible opacity-0",
      ].join(" ")}
      aria-hidden={!isLoading}
    >
      {/* Soft dim/blur overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Center spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border border-white/15 bg-black/55 px-5 py-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-medium text-white">
              Loading...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}