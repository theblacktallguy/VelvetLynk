"use client";

import Image from "next/image";
import LoadingLink from "@/components/navigation/LoadingLink";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteLoading } from "@/components/navigation/RouteLoadingProvider";
import { useSession, signOut } from "next-auth/react";

type CityHeaderProps = {
  fallbackHref?: string;
};

export default function CityHeader({ fallbackHref }: CityHeaderProps) {
  const router = useRouter();
  const { startLoading } = useRouteLoading();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  useEffect(() => {
    const root = document.documentElement;

    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const logoSrc = useMemo(
    () => (isDark ? "/assets/logo-white.png" : "/assets/logo.png"),
    [isDark]
  );

  const goBack = () => {
    if (typeof window === "undefined") {
      startLoading();
      router.push(fallbackHref || "/ng");
      return;
    }

    // If this page did not specify a fallback, behave like a normal back button.
    if (!fallbackHref) {
      if (window.history.length > 1) {
        startLoading();
        router.back();
      } else {
        startLoading();
        router.push("/ng");
      }
      return;
    }

    const referrer = document.referrer;

    if (!referrer) {
      startLoading();
      router.push(fallbackHref);
      return;
    }

    try {
      const refUrl = new URL(referrer);
      const sameOrigin = refUrl.origin === window.location.origin;
      const blockedPaths = ["/login", "/signup", "/register", "/forgot-password"];

      const isBlocked = blockedPaths.some((path) =>
        refUrl.pathname.startsWith(path)
      );

      if (sameOrigin && !isBlocked && window.history.length > 1) {
        router.back();
        return;
      }

      startLoading();
      router.push(fallbackHref);
      } catch {
        startLoading();
        router.push(fallbackHref);
      }
  };

  return (
    <div className="relative z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={goBack}
        className="absolute left-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm hover:bg-[rgba(212,175,55,0.12)]"
        aria-label="Go back"
      >
        ←
      </button>

      <LoadingLink
        href="/ng"
        className="flex items-center gap-3 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <Image
          src={logoSrc}
          alt="VelvetLynk"
          width={44}
          height={44}
          priority
          className="w-11 h-11"
        />

        <div className="leading-none text-center">
          <div className="text-2xl font-semibold tracking-tight">
            <span className="gold-text">Velvet</span>
            <span className="text-red-600">Lynk</span>
          </div>

          <div className="text-[10px] tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
            NIGERIA
          </div>
        </div>
      </LoadingLink>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm hover:bg-[rgba(212,175,55,0.12)]"
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[100] w-56 card overflow-hidden shadow-lg">
          <nav className="flex flex-col text-sm">
            <LoadingLink
              href="/ng"
              onClick={() => setOpen(false)}
              className="px-3 py-2 transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-[0.98] active:opacity-80"
            >
              Home
            </LoadingLink>

            <LoadingLink
              href="/post"
              onClick={() => setOpen(false)}
              className="px-3 py-2 transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-[0.98] active:opacity-80"
            >
              Post Ad
            </LoadingLink>

            <LoadingLink
              href="/account"
              onClick={() => setOpen(false)}
              className="px-3 py-2 transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-[0.98] active:opacity-80"
            >
              My Account
            </LoadingLink>

            {status === "loading" ? (
              <div className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                Checking session…
              </div>
            ) : isAuthed ? (
              <button
                type="button"
                className="text-left px-3 py-2 hover:bg-[rgba(212,175,55,0.12)]"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
              >
                Logout
              </button>
            ) : (
              <LoadingLink
                href="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-2 transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-[0.98] active:opacity-80"
              >
                Login
              </LoadingLink>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}