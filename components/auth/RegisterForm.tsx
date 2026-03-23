"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";

function slugifyUsername(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-700"
      aria-hidden
    />
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const callbackUrl = useMemo(
    () => sp.get("callbackUrl") || "/account?welcome=1",
    [sp]
  );

  const referralSlug = useMemo(() => {
    const ref = sp.get("ref")?.trim().toLowerCase() || "";
    return slugifyUsername(ref);
  }, [sp]);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-[rgba(212,175,55,0.25)]";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const u = slugifyUsername(username);

    if (!fullName.trim()) return setErr("Please enter your full name.");
    if (!u || u.length < 3) return setErr("Username must be at least 3 characters.");
    if (!email.trim()) return setErr("Please enter your email.");
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setErr("Passwords do not match.");

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName,
        username: u,
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        referralSlug: referralSlug || null,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setErr(data?.error || "Registration failed.");
      return;
    }

    setOk("Account created. Signing you in...");

    const r = await signIn("credentials", {
      redirect: false,
      callbackUrl,
      identifier: email.trim().toLowerCase(),
      password,
    });

    if (r?.error) {
      setLoading(false);
      router.replace(`/login?callbackUrl=${encodeURIComponent("/account/profile")}`);
      return;
    }

    router.replace("/account");
  }

  return (
    <div className="card p-5 relative">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm">
          Build your profile, get verified, and post ads.
        </p>
      </div>

      {referralSlug ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 px-3 py-2 text-sm bg-amber-400/40">
          You were invited by <span className="font-semibold">@{referralSlug}</span>.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-s font-semibold">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Grace Elester"
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-s font-semibold">Username (profile link)</label>
          <input
            value={username}
            onChange={(e) => setUsername(slugifyUsername(e.target.value))}
            className={inputClass}
            placeholder="e.g. grace-elester"
            autoComplete="username"
            disabled={loading}
          />
          <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Lowercase letters, numbers, hyphens only.
          </div>
        </div>

        <div>
          <label className="mb-1 block text-s font-semibold">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="e.g. grace@example.com"
            type="email"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-s font-semibold">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Minimum 8 characters"
            type="password"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-s font-semibold">Confirm password</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Re-enter password"
            type="password"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        {err ? (
          <div className="rounded-lg border border-red-500/30 bg-red-600 px-3 py-2 text-sm text-white">
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-600 px-3 py-2 text-sm text-white">
            {ok}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60 disabled:opacity-60"
        >
          {loading ? <Spinner /> : null}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}