"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark ? "/assets/logo-white.png" : "/assets/logo.png";

  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center gap-3">
        <Image src={logoSrc} alt="VelvetLynk" width={56} height={56} priority />

        <div className="leading-none">
          <div className="text-3xl font-semibold tracking-tight">
            <span className="gold-text">Velvet</span>{" "}
            <span className="text-red-600">Lynk</span>
          </div>

          <div className="text-xs tracking-[0.28em] text-zinc-500 dark:text-zinc-500">
            NIGERIA
          </div>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 ">
        Welcome to VelvetLynk, a modern and secure platform designed for adults
        seeking private and verified connections. Discover real people, trusted
        listings, and discreet encounters in your city.
      </p>
    </div>
  );
}