"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  images: string[]; // requires min 3 later (backend)
  fullName: string;
  username: string;
  verified: boolean;
};

function CheckIcon({ variant }: { variant: "verified" | "unverified" }) {
  const cls = variant === "verified" ? "text-blue-500" : "text-zinc-400";
  return (
    <span className={cls} aria-hidden="true" title={variant === "verified" ? "Verified" : "Unverified"}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.4 2.4L18 4l-.4 3.6L20 10l-2.4 2.4L18 16l-3.6-.4L12 18l-2.4-2.4L6 16l.4-3.6L4 10l2.4-2.4L6 4l3.6.4L12 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12.2l1.7 1.7 3.6-3.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ProfileCarousel({
  images,
  fullName,
  username,
  verified,
}: Props) {
  const safeImages = useMemo(() => (images?.length ? images : ["/assets/placeholder-profile.jpg"]), [images]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  const current = safeImages[idx] ?? safeImages[0];

  function prev() {
    setIdx((v) => (v - 1 + safeImages.length) % safeImages.length);
  }
  function next() {
    setIdx((v) => (v + 1) % safeImages.length);
  }

  const badgeText = verified ? "Verified" : "Unverified";
  const badgeCls = verified ? "bg-blue-600/90 text-white" : "bg-zinc-700/70 text-white";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Image */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block h-[420px] w-full cursor-zoom-in sm:h-[520px]"
          aria-label="Open image preview"
        >
          <Image
            src={current}
            alt={`${fullName} profile photo`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 1024px"
          />
        </button>

        {/* Top-right badge */}
        <div className="pointer-events-none absolute right-3 top-3">
          <div className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${badgeCls}`}>
            {badgeText}
          </div>
        </div>

        {/* Bottom-left identity overlay (stays while sliding) */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3">
          <div className="inline-block rounded-xl bg-black/55 px-3 py-2 text-white backdrop-blur-sm">
            <div className="flex items-center gap-2 text-base font-semibold leading-none">
              <span>{fullName}</span>
              <CheckIcon variant={verified ? "verified" : "unverified"} />
            </div>
            <div className="mt-1 text-xs text-white/90">@{username}</div>
          </div>
        </div>

        {/* Counter */}
        <div className="pointer-events-none absolute bottom-3 right-3 hidden sm:block">
          <div className="rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white">
            {idx + 1}/{safeImages.length}
          </div>
        </div>

        {/* Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 p-2 text-sm shadow hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/70 dark:hover:bg-zinc-950"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 p-2 text-sm shadow hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/70 dark:hover:bg-zinc-950"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Fullscreen preview */}
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border bg-black">
            <div className="relative h-[70vh] w-full">
              <Image
                src={current}
                alt={`${fullName} preview`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black"
              aria-label="Close preview"
            >
              Close
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-black"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-black"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}