"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

type LightboxProps = {
  open: boolean;
  images: string[];
  index: number;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({
  open,
  images,
  index,
  title,
  subtitle,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);

  const safeIndex = useMemo(() => {
    if (!images.length) return 0;
    return Math.max(0, Math.min(index, images.length - 1));
  }, [images.length, index]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  const src = images[safeIndex];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === overlayRef.current) onClose();
      }}
      onTouchStart={(e) => {
        startX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0]?.clientX ?? null;
        if (startX.current == null || endX == null) return;
        const dx = endX - startX.current;
        // swipe threshold
        if (dx > 40) onPrev();
        if (dx < -40) onNext();
        startX.current = null;
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-4">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <div className="truncate text-sm font-semibold text-white">
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div className="truncate text-xs text-white/70">{subtitle}</div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Main image */}
        <div className="mt-4 flex flex-1 items-center justify-center">
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black/30">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
              {src ? (
                <Image
                  src={src}
                  alt="Preview"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
              ) : null}
            </div>

            {/* Controls */}
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}

            {/* Counter */}
            <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              {safeIndex + 1}/{images.length}
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-white/70">
          Tip: use ← → keys, swipe, or buttons.
        </div>
      </div>
    </div>
  );
}