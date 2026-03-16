"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ResendVerificationButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    try {
      setStatus("loading");
      setMessage("");

      const res = await fetch("/api/auth/verify-email/send", {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "Failed to send verification email.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "Verification email sent.");
    } catch {
      setStatus("error");
      setMessage("Failed to send verification email.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)] disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Resend verification email"}
      </button>

      {message ? (
        <div
          className={[
            "text-sm",
            status === "success"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400",
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}