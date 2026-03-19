"use client";

import { useState } from "react";
import { submitVerificationRequest } from "../actions";

export default function LevelTwoVerificationForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [selfieImageUrl, setSelfieImageUrl] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");

  async function uploadFiles(files: FileList | null, kind: "selfie" | "proof") {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;

    const file = selected[0];
    const fd = new FormData();
    fd.append("files", file);

    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/verification-photos", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Upload failed.");
        return;
      }

      const url = Array.isArray(data?.urls) ? data.urls[0] : "";
      if (!url) {
        setMsg("Upload failed.");
        return;
      }

      if (kind === "selfie") setSelfieImageUrl(url);
      if (kind === "proof") setProofImageUrl(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submitVerificationRequest} className="space-y-5">
      <input type="hidden" name="selfieImageUrl" value={selfieImageUrl} />
      <input type="hidden" name="proofImageUrl" value={proofImageUrl} />

      <div>
        <label className="block text-sm font-semibold py-3">
          Selfie photo
        </label>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Upload a clear selfie of your face.
        </p>

        <label className="mt-3 rounded-xl inline-flex cursor-pointer border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)] disabled:opacity-60">
          {busy ? "Uploading..." : selfieImageUrl ? "Replace selfie" : "Upload selfie"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => uploadFiles(e.target.files, "selfie")}
          />
        </label>

        {selfieImageUrl ? (
          <div className="mt-3 rounded-xl border p-3 text-xs break-all">
            Uploaded: {selfieImageUrl}
          </div>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-semibold py-3">
          Proof photo
        </label>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Upload a photo of yourself holding a paper that shows your VelvetLynk username and today’s date.
        </p>

        <label className="mt-3 inline-flex cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)]">
          {busy ? "Uploading..." : proofImageUrl ? "Replace proof photo" : "Upload proof photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => uploadFiles(e.target.files, "proof")}
          />
        </label>

        {proofImageUrl ? (
          <div className="mt-3 rounded-xl border p-3 text-xs break-all">
            Uploaded: {proofImageUrl}
          </div>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-semibold py-3">
          Note (optional)
        </label>
        <textarea
          name="note"
          rows={3}
          className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
          placeholder="Anything you want the reviewer to know..."
        />
      </div>

      {msg ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {msg}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy || !selfieImageUrl || !proofImageUrl}
        className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(55, 212, 76, 0.43)] disabled:opacity-60"
      >
        Submit verification
      </button>
    </form>
  );
}