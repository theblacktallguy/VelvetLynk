"use client";

import { useSearchParams } from "next/navigation";
import LoginHeader from "@/components/LoginHeader";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterClient() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/account";
  return (
    <main className="flex min-h-screen flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <LoginHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left */}
          <RegisterForm />

          {/* Right */}
          <div className="card p-5" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
            <div className="text-sm font-semibold">Already have an account?</div>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-500">
              Sign in to manage your profile, post ads, and buy VelvetLynk credits.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
            >
              Go to login
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}