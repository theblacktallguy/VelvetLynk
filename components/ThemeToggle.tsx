"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      aria-label="Toggle theme"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}