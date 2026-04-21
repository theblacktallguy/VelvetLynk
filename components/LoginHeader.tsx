"use client";

import Image from "next/image";
import LoadingLink from "@/components/navigation/LoadingLink";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteLoading } from "@/components/navigation/RouteLoadingProvider";
import { useSession } from "next-auth/react";

export default function LoginHeader() {
  const router = useRouter();
  const { startLoading } = useRouteLoading();
  const { status } = useSession(); // safe to keep if you’ll later customize header by auth status
  const isAuthed = status === "authenticated"; // currently unused, fine to remove if you want

  const [isDark, setIsDark] = useState(false);

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
    router.back();
  };

  return (
    <div className="relative">
      <div className="relative flex items-center justify-center">
        {/* Back (left) */}
        <button
          type="button"
          onClick={() => {
            startLoading();
            router.push("/");
          }}
          className="absolute left-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-95 active:opacity-80"
          aria-label="Go to homepage"
        >
          ←
        </button>
        {/* Logo -> homepage */}
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

            <div className="text-[10px] tracking-[0.28em] text-zinc-500 dark:text-zinc-500">
              NIGERIA
            </div>
          </div>
        </LoadingLink>
      </div>
    </div>
  );
}