"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email, we sent a reset link.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || GENERIC_SUCCESS_MESSAGE);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ backgroundColor: "rgba(169, 149, 86, 0.1)" }}>
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Forgot password</h1>
          <p className="mt-2 text-sm ">
            Enter the email address linked to your VelvetLynk account and we’ll
            send you a password reset link.
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-4">
            <div className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              style={{ backgroundColor: "rgba(17, 172, 48, 0.94)" }}
            >
              {message}
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Back to login
            </Link>

            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setMessage("");
              }}
              className="w-full text-sm text-zinc-600 underline underline-offset-4 dark:text-zinc-400"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium py-3"
              >
                Your email address?
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-zinc-500"
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && message ? (
              <div className="rounded-xl border border-red-200 bg-red-500 p-3 text-sm dark:border-red-900/60 dark:bg-red-500 text-white dark:text-zinc-900">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {status === "loading" ? "Sending reset link..." : "Send reset link"}
            </button>

            <div className="text-center text-sm ">
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