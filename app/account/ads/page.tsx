"use client";

import CityHeader from "@/components/CityHeader";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AccountAd = {
  id: string;
  title: string;
  status: "ACTIVE" | "EXPIRED";
  featured: boolean;
  countrySlug: string;
  stateSlug: string;
  citySlug: string;
  categorySlug: string;
  displayName: string | null;
  age: number | null;
  priceText: string | null;
  locationText: string | null;
  imageUrls: string[];
  createdAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  durationDays?: number | null;
};

type AdsResponse = {
  active: AccountAd[];
  expired: AccountAd[];
  error?: string;
};

export default function AccountAdsPage() {
  const [activeAds, setActiveAds] = useState<AccountAd[]>([]);
  const [expiredAds, setExpiredAds] = useState<AccountAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyAdId, setBusyAdId] = useState<string | null>(null);

  async function loadAds() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/account/ads", {
        method: "GET",
        cache: "no-store",
      });

      const data: AdsResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load ads.");
      }

      setActiveAds(Array.isArray(data.active) ? data.active : []);
      setExpiredAds(Array.isArray(data.expired) ? data.expired : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  async function handleDelete(adId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ad? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setBusyAdId(adId);

      const res = await fetch("/api/account/ad/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete ad.");
      }

      setActiveAds((prev) => prev.filter((ad) => ad.id !== adId));
      setExpiredAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete ad.");
    } finally {
      setBusyAdId(null);
    }
  }

  async function handleRenew(adId: string) {
    const confirmed = window.confirm(
      "Renew this ad and charge your wallet using the same pricing flow?"
    );

    if (!confirmed) return;

    try {
      setBusyAdId(adId);

      const res = await fetch(`/api/ads/${adId}/renew`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to renew ad.");
      }

      await loadAds();
      window.alert("Ad renewed successfully.");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to renew ad.");
    } finally {
      setBusyAdId(null);
    }
  }

  async function handleUpgradeFeatured(adId: string) {
    const confirmed = window.confirm(
      "Upgrade this ad to featured and charge your wallet?"
    );

    if (!confirmed) return;

    try {
      setBusyAdId(adId);

      const res = await fetch(`/api/ads/${adId}/upgrade-featured`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to upgrade ad.");
      }

      await loadAds();
      window.alert("Ad upgraded to featured successfully.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to upgrade ad."
      );
    } finally {
      setBusyAdId(null);
    }
  }

  async function handleUpgradeExtended(adId: string) {
    const confirmed = window.confirm(
      "Extend this ad and charge your wallet?"
    );

    if (!confirmed) return;

    try {
      setBusyAdId(adId);

      const res = await fetch(`/api/ads/${adId}/upgrade-extended`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to extend ad.");
      }

      await loadAds();
      window.alert("Ad extended successfully.");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to extend ad.");
    } finally {
      setBusyAdId(null);
    }
  }

  const hasAds = useMemo(() => {
    return activeAds.length > 0 || expiredAds.length > 0;
  }, [activeAds, expiredAds]);

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8 flex-1">
        <div className="mb-8 flex items-center justify-between gap-4 py-3">
          <div>
            <h1 className="text-2xl font-bold">
              Manage Ads
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              View, edit, renew, and delete your ads.
            </p>
          </div>

          <Link
            href="/post"
            className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:dark:bg-zinc-800 dark:bg-zinc-600 dark:text-zinc-200"
          >
            Post New Ad
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-600 dark:text-zinc-200">
            Loading your ads...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-700/70 p-6 text-sm dark:border-red-900/40">
            {error}
          </div>
        ) : !hasAds ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold">
              No ads yet
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You have not posted any ads yet.
            </p>

            <div className="mt-4">
              <Link
                href="/post"
                className="inline-flex items-center rounded-xl bg-zinc-600 px-4 py-2 text-sm font-medium transition hover:opacity-90 dark:text-zinc-200"
              >
                Post Your First Ad
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <AdsSection
              title="Active Ads"
              emptyText="You have no active ads."
              ads={activeAds}
              busyAdId={busyAdId}
              onDelete={handleDelete}
              onUpgradeFeatured={handleUpgradeFeatured}
              onUpgradeExtended={handleUpgradeExtended}
              editHref={(id) => `/post/${id}/edit`}
            />

            <AdsSection
              title="Expired Ads"
              emptyText="You have no expired ads."
              ads={expiredAds}
              busyAdId={busyAdId}
              onDelete={handleDelete}
              onRenew={handleRenew}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function AdsSection({
  title,
  emptyText,
  ads,
  busyAdId,
  onDelete,
  onRenew,
  onUpgradeFeatured,
  onUpgradeExtended,
  editHref,
}: {
  title: string;
  emptyText: string;
  ads: AccountAd[];
  busyAdId: string | null;
  onDelete: (adId: string) => void;
  onRenew?: (adId: string) => void;
  onUpgradeFeatured?: (adId: string) => void;
  onUpgradeExtended?: (adId: string) => void;
  editHref?: (adId: string) => string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {ads.length} {ads.length === 1 ? "ad" : "ads"}
        </span>
      </div>

      {ads.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-700 dark:text-zinc-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              busy={busyAdId === ad.id}
              onDelete={onDelete}
              onRenew={onRenew}
              onUpgradeFeatured={onUpgradeFeatured}
              onUpgradeExtended={onUpgradeExtended}
              editHref={editHref?.(ad.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AdCard({
  ad,
  busy,
  onDelete,
  onRenew,
  onUpgradeFeatured,
  onUpgradeExtended,
  editHref,
}: {
  ad: AccountAd;
  busy: boolean;
  onDelete: (adId: string) => void;
  onRenew?: (adId: string) => void;
  onUpgradeFeatured?: (adId: string) => void;
  onUpgradeExtended?: (adId: string) => void;
  editHref?: string;
}) {
  const imageUrl = ad.imageUrls?.[0] || "";
  const statusLabel = ad.status === "ACTIVE" ? "Active" : "Expired";
  const alreadyExtended =
    typeof ad.durationDays === "number" ? ad.durationDays >= 20 : false;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-700">
      <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {ad.title}
            </h3>

            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {ad.citySlug}, {ad.stateSlug}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                ad.status === "ACTIVE"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {statusLabel}
            </span>

            {ad.featured ? (
              <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Featured
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            <span className="font-medium text-zinc-800 dark:text-zinc-100">
              Category:
            </span>{" "}
            {ad.categorySlug}
          </p>

          {ad.locationText ? (
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                Location:
              </span>{" "}
              {ad.locationText}
            </p>
          ) : null}

          {ad.priceText ? (
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                Price:
              </span>{" "}
              {ad.priceText}
            </p>
          ) : null}

          {ad.expiresAt ? (
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                Expires:
              </span>{" "}
              {formatDate(ad.expiresAt)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ad.status === "ACTIVE" && editHref ? (
            <Link
              href={editHref}
              className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Edit
            </Link>
          ) : null}

          {ad.status === "ACTIVE" && !ad.featured && onUpgradeFeatured ? (
            <button
              type="button"
              onClick={() => onUpgradeFeatured(ad.id)}
              disabled={busy}
              className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {busy ? "Working..." : "Feature Ad"}
            </button>
          ) : null}

          {ad.status === "ACTIVE" && !alreadyExtended && onUpgradeExtended ? (
            <button
              type="button"
              onClick={() => onUpgradeExtended(ad.id)}
              disabled={busy}
              className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {busy ? "Working..." : "Extend Ad"}
            </button>
          ) : null}

          {ad.status === "EXPIRED" && onRenew ? (
            <button
              type="button"
              onClick={() => onRenew(ad.id)}
              disabled={busy}
              className="inline-flex items-center rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {busy ? "Renewing..." : "Renew Ad"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onDelete(ad.id)}
            disabled={busy}
            className="inline-flex items-center rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-900 transition hover:bg-red-700/50 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-600/90 dark:text-red-600 dark:hover:bg-red-950/90"
          >
            {busy ? "Working..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}