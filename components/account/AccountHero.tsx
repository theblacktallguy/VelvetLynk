"use client";

import Image from "next/image";
import LoadingLink from "@/components/navigation/LoadingLink";
import { useMemo, useState } from "react";
import Lightbox from "@/components/common/Lightbox";

export type AccountHeroProps = {
  userSlug: string;
  verified: boolean;
  avatarSrc: string;
  photos: string[];
};

function VerifiedPill({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        verified
          ? "border-blue-500/30 text-blue-600 dark:text-blue-400"
          : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-2 w-2 rounded-full",
          verified ? "bg-blue-500" : "bg-zinc-400",
        ].join(" ")}
      />
      {verified ? "Verified" : "Not Verified"}
    </span>
  );
}

function VerifiedIcon({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        verified ? "text-blue-500" : "text-zinc-400",
      ].join(" ")}
      title={verified ? "Verified" : "Not Verified"}
      aria-label={verified ? "Verified" : "Not Verified"}
    >
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

export default function AccountHero({
  userSlug,
  verified,
  avatarSrc,
  photos,
}: AccountHeroProps) {
  const thumbs = photos.slice(0, 4);

  // Lightbox state
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const gallery = useMemo(() => {
    // Use profile photos first; if empty, fall back to avatar
    const clean = photos.filter(Boolean);
    return clean.length ? clean : [avatarSrc].filter(Boolean);
  }, [photos, avatarSrc]);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const prev = () => setIdx((v) => (v - 1 + gallery.length) % gallery.length);
  const next = () => setIdx((v) => (v + 1) % gallery.length);

  return (
    <>
      <div className="card p-4 sm:p-6">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold ">
                @{userSlug}
              </div>
              <VerifiedIcon verified={verified} />
            </div>

            <div className="mt-2">
              <VerifiedPill verified={verified} />
            </div>
          </div>

          <LoadingLink
            href="/account/profile/edit"
            className="shrink-0 rounded-lg border px-3 py-1 text-sm font-semibold transition-all duration-200 gold-border hover:bg-amber-600/60 active:scale-95 active:opacity-80"
          >
            Edit Profile
          </LoadingLink>
        </div>

        {/* Center avatar + plus */}
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="group relative h-24 w-24 rounded-full border gold-border bg-zinc-100 dark:bg-zinc-900"
            aria-label="Open photo preview"
            title="Open photo preview"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <Image
                src={avatarSrc}
                alt="Profile picture"
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </span>

            <LoadingLink
              href="/account/profile/edit#photos"
              onClick={(e) => e.stopPropagation()}
              className="absolute -right-1 -bottom-1 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white text-zinc-900 shadow-sm transition-all duration-200 gold-border active:scale-95 active:opacity-80 dark:bg-zinc-950 dark:text-zinc-100 group-hover:bg-[rgba(212,175,55,0.10)]"
              aria-label="Edit profile photos"
              title="Edit profile photos"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </LoadingLink>
          </button>

          {/* Thumbnails row */}
          <div className="mt-5 grid w-full max-w-md grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => {
              const src = thumbs[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => openAt(i)}
                  className="relative aspect-square overflow-hidden rounded-lg border bg-zinc-100 dark:bg-zinc-900 gold-border"
                  aria-label={`Open photo ${i + 1}`}
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={`Profile photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, 120px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      Empty
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Photos: minimum 3 • maximum 5
          </div>
        </div>
      </div>

      <Lightbox
        open={open}
        images={gallery}
        index={idx}
        title={`@${userSlug}`}
        subtitle={verified ? "Verified profile" : "Not verified"}
        onClose={() => setOpen(false)}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}