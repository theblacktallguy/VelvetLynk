"use client";

import { useMemo, useState } from "react";
import AdCard, { Ad } from "@/components/ads/AdCard";
import NoAds from "@/components/ads/NoAds";

type Props = {
  activeAds: Ad[];
  expiredAds: Ad[];
};

export default function ProfileAdsSection({ activeAds, expiredAds }: Props) {
  const [tab, setTab] = useState<"active" | "expired">("active");

  const ads = useMemo(() => {
    return tab === "active" ? activeAds : expiredAds;
  }, [tab, activeAds, expiredAds]);

  return (
    <div className="mt-6 card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-s font-bold">
          Ads
        </div>

        <div className="flex items-center gap-2 rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={[
              "rounded-lg px-3 py-1 text-xs font-semibold transition",
              tab === "active"
                ? "bg-[rgba(212,175,55,0.14)] gold-text"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900",
            ].join(" ")}
          >
            Active ({activeAds.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("expired")}
            className={[
              "rounded-lg px-3 py-1 text-xs font-semibold transition",
              tab === "expired"
                ? "bg-[rgba(212,175,55,0.14)] gold-text"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900",
            ].join(" ")}
          >
            Expired ({expiredAds.length})
          </button>
        </div>
      </div>

      <div className="mt-4">
        {ads.length === 0 ? (
          <NoAds />
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}