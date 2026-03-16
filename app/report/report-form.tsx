"use client";

import { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

const reasons = [
  { v: "SPAM", label: "Spam" },
  { v: "FAKE", label: "Fake / misleading ad" },
  { v: "UNDERAGE", label: "Possible underage content" },
  { v: "HARASSMENT", label: "Harassment / threats" },
  { v: "SCAM", label: "Scam / fraud" },
  { v: "EXPLICIT_CONTENT", label: "Explicit / disallowed content" },
  { v: "WRONG_CATEGORY", label: "Wrong category" },
  { v: "DUPLICATE", label: "Duplicate ad" },
  { v: "OTHER", label: "Other" },
] as const;

export default function ReportForm({ adId }: { adId: string }) {
  const [reason, setReason] = useState<(typeof reasons)[number]["v"]>("SCAM");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function submit() {
    setMsg(null);
    setIsError(false);

    if (!adId) {
      setMsg("Missing adId. Please open Report from the ad page.");
      setIsError(true);
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId,
          reason,
          details,
          reporterEmail: email || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error ?? "Failed to submit report.");
        setIsError(true);
        return;
      }

      setMsg("Thanks — your report has been submitted.");
      setIsError(false);
      setDetails("");
      setEmail("");
    } catch {
      setMsg("Network error. Please try again.");
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative space-y-4">
      {busy ? <LoadingOverlay label="Submitting report…" /> : null}

      {msg ? (
        <div
          className={
            isError
              ? "rounded-xl border border-red-500/40 bg-red-700/70 px-3 py-2 text-sm text-white-700 "
              : "rounded-xl border border-emerald-500/40 bg-emerald-700/70 px-3 py-2 text-sm text-white"
          }
        >
          {msg}
        </div>
      ) : null}

      <div>
        <label className="block text-s font-semibold">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as any)}
          disabled={busy}
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/40 disabled:opacity-60"
        >
          {reasons.map((r) => (
            <option key={r.v} value={r.v}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-s font-semibold">Details (optional)</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
          rows={5}
          disabled={busy}
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 disabled:opacity-60"
          placeholder="Explain what happened. Include any relevant info."
        />
        <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          {details.length}/2000
        </div>
      </div>

      <div>
        <label className="block text-s font-semibold">Your email (optional)</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)] disabled:opacity-60"
      >
        Submit report
      </button>
    </div>
  );
}