"use client";

import { useRef, useState } from "react";

const TOTAL_MAX = 5;
const GALLERY_MAX = 4;

export default function PhotoManager({
  initialAvatarUrl,
  initialPhotoUrls,
}: {
  initialAvatarUrl: string;
  initialPhotoUrls: string[];
}) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const photosInputRef = useRef<HTMLInputElement | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [photos, setPhotos] = useState<string[]>(initialPhotoUrls);
  const [busy, setBusy] = useState(false);

  async function uploadFiles(files: File[]) {
    if (!files.length) return [];

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/upload/profile-photos", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error ?? "Upload failed");
      return [];
    }

    return Array.isArray(data?.urls) ? data.urls : [];
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    setBusy(true);
    try {
      const newUrls = await uploadFiles(files.slice(0, 1));
      if (newUrls[0]) {
        setAvatarUrl(newUrls[0]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = GALLERY_MAX - photos.length;
    const toUpload = files.slice(0, Math.max(0, remaining));
    if (toUpload.length === 0) return;

    setBusy(true);
    try {
      const newUrls = await uploadFiles(toUpload);
      if (!newUrls.length) return;

      const next = [...photos, ...newUrls].slice(0, GALLERY_MAX);
      setPhotos(next);
    } finally {
      setBusy(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  function removeAvatar() {
    setAvatarUrl("");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800  p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">Photos</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Upload up to {TOTAL_MAX} photos total. Your profile picture is separate from the other photos.
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Profile photo
          </div>

          <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 overflow-hidden dark:border-zinc-800 p-3">
            <div className="flex items-start gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                    No profile photo
                  </div>
                )}
              </div>

              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                This image is used as your main profile picture.
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={busy}
                className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
              >
                {busy ? "Uploading..." : avatarUrl ? "Change profile photo" : "Add profile photo"}
              </button>

              {avatarUrl ? (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-[11px] font-semibold underline hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickAvatar}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Other photos
              </div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Add up to {GALLERY_MAX} more photos.
              </div>
            </div>

            <button
              type="button"
              onClick={() => photosInputRef.current?.click()}
              disabled={busy || photos.length >= GALLERY_MAX}
              className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
            >
              {photos.length >= GALLERY_MAX ? "Max reached" : busy ? "Uploading..." : "Add photos"}
            </button>

            <input
              ref={photosInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickPhotos}
            />
          </div>

          {photos.length === 0 ? (
            <div className="mt-3 text-sm">No photos yet.</div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((url) => (
                <div
                  key={url}
                  className="rounded-2xl border border-zinc-200 overflow-hidden dark:border-zinc-800"
                >
                  <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="photo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="text-[11px] font-semibold underline hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-zinc-600 dark:text-zinc-400">
        {(avatarUrl ? 1 : 0) + photos.length}/{TOTAL_MAX} used
      </div>

      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <input type="hidden" name="photoUrls" value={photos.join("\n")} />
    </div>
  );
}