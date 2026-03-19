"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <footer className="mt-auto border-t">
      {/* Top row: links (scroll) + toggle (fixed) */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          {/* Links: one line, scrollable on mobile */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-x-4 whitespace-nowrap text-sm \">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/safety" className="hover:underline">
                Safety
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
          </div>

          {/* Toggle: never wraps */}
          <div className="shrink-0 flex items-center gap-3">
            <span className="text-sm ">
              Dark mode
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-300",
                "gold-border",
                "bg-zinc-200 dark:bg-zinc-800",
                "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
              ].join(" ")}
              aria-label="Toggle dark mode"
            >
              <span
                className={[
                  "inline-block h-4 w-4 transform rounded-full shadow-md transition-all duration-300",
                  mounted && isDark
                    ? "translate-x-6 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.45)]"
                    : "translate-x-1 bg-white",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: centered copyright */}
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 text-xs text-center text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} VelvetLynk. All rights reserved.
      </div>
    </footer>
  );
}