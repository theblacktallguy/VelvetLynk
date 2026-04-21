// app/login/LoginClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import LoginHeader from "@/components/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoadingLink from "@/components/navigation/LoadingLink";

export default function LoginClient() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/account?welcome=1";
  const error = sp.get("error");

  return (
    <main className="flex min-h-screen flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <LoginHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Login */}
          <div className="card p-5">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold">Sign in</h1>
              <p className="mt-1 text-sm ">
                Access your dashboard, manage ads, and verify your profile.
              </p>
            </div>

            {error === "CredentialsSignin" ? (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/50 px-3 py-2 text-sm">
                Incorrect username/email or password.
              </div>
            ) : null}

            {/* If your LoginForm supports it, pass callbackUrl */}
            <LoginForm callbackUrl={callbackUrl} />

            <div className="mt-4 text-xs ">
              By continuing, you agree to our{" "}
              <LoadingLink
                href="/terms"
                className="transition-all duration-200 hover:underline active:opacity-70"
              >
                Terms
              </LoadingLink>{" "}
              and{" "}
              <LoadingLink
                href="/privacy"
                className="transition-all duration-200 hover:underline active:opacity-70"
              >
                Privacy Policy
              </LoadingLink>
              .
            </div>
          </div>

          {/* Right: Value prop */}
          <div className="card p-5" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
            <div className="text-sm font-semibold">New to VelvetLynk?</div>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-500">
              Create an account to post ads, build a verified profile, and manage
              your VelvetLynk credits.
            </p>

            <LoadingLink
              href="/register"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
            >
              Create account
            </LoadingLink>
          </div>
        </div>
      </section>

      
    </main>
  );
}