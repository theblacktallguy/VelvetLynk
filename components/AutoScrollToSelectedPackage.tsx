"use client";

import { useEffect } from "react";

export default function AutoScrollToSelectedPackage({
  active,
  targetId,
}: {
  active: boolean;
  targetId: string;
}) {
  useEffect(() => {
    if (!active) return;

    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(targetId);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      attempts += 1;

      if (attempts < 10) {
        setTimeout(tryScroll, 120);
      }
    };

    tryScroll();
  }, [active, targetId]);

  return null;
}