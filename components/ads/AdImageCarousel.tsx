"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdImageCarousel({
  images,
  alt = "Ad photo",
}: {
  images: string[];
  alt?: string;
}) {
  const safeImages = useMemo(() => (images ?? []).slice(0, 3), [images]);
  const [index, setIndex] = useState(0);

  if (safeImages.length === 0) return null;

  const canNav = safeImages.length > 1;
  const current = safeImages[index]!;
  const prev = () =>
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setIndex((i) => (i + 1) % safeImages.length);

  return (
    <div className="mt-4">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={current}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
          />
        </div>

        {canNav ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/90"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-800 dark:text-zinc-100" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 shadow-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/90"
            >
              <ChevronRight className="h-4 w-4 text-zinc-800 dark:text-zinc-100" />
            </button>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="mt-2 flex justify-center gap-2">
          {safeImages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={[
                "relative h-12 w-12 overflow-hidden rounded-lg border",
                i === index
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800",
              ].join(" ")}
              aria-label={`Show image ${i + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}