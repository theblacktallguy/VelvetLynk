"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("This reset link is invalid or incomplete.");
      return;
    }

    if (!password || !confirmPassword) {
      setStatus("error");
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 " style={{ backgroundColor: "rgba(169, 149, 86, 0.1)" }}>
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
        <div className="mb-6 ">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm ">
            Enter your new password below. This reset link can only be used once.
          </p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-500 p-3 text-sm dark:border-red-900/60 dark:bg-red-500 text-white dark:text-zinc-900">
              This reset link is invalid or incomplete.
            </div>

            <Link
              href="/forgot-password"
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Request a new reset link
            </Link>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4">
            <div className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              style={{ backgroundColor: "rgba(17, 172, 48, 0.94)" }}
            >
              {message}
            </div>

            <p className="text-sm">
              Your previous sessions have been invalidated. Please sign in again with your new password.
            </p>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium "
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-150 dark:placeholder:text-zinc-400 dark:focus:border-zinc-500"
                disabled={status === "loading"}
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Must be at least 8 characters and include at least one letter and one number.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-150 dark:placeholder:text-zinc-400 dark:focus:border-zinc-500"
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && message ? (
              <div className="rounded-xl border border-red-200 bg-red-500 p-3 text-sm text-white dark:text-zinc-900 dark:border-red-900/60 dark:bg-red-500 ">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              style={{ backgroundColor: "rgba(17, 172, 48, 0.94)" }}
            >
              {status === "loading" ? "Updating password..." : "Update password"}
            </button>

            <div className="text-center text-sm">
              <Link href="/login" className="underline underline-offset-4">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}