"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export default function InactivityLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        signOut({
          callbackUrl: "/login?reason=inactive",
        });
      }, IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status]);

  return null;
}