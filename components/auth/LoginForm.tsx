"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

type LoginFormProps = {
  callbackUrl?: string;
};

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-700"
      aria-hidden
    />
  );
}

export default function LoginForm({ callbackUrl = "/account" }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";

  async function doCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);

    await signIn("credentials", {
      redirect: true,
      callbackUrl,
      identifier: identifier.trim(),
      password,
    });

    setLoading(false);
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        <form onSubmit={doCredentials} className="space-y-3">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/50 px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Email or username</label>
            <input
              className={inputClass}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="e.g. nina@example.com or ninaluxe"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Password</label>
            <input
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Your password"
              type="password"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-[rgb(212,175,55)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            {loading ? "Signing you in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}