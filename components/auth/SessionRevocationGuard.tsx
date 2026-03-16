"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionRevocationGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    if (session?.user?.sessionRevoked) {
      signOut({
        callbackUrl: "/login?reason=session-expired",
      });
    }
  }, [session, status]);

  return null;
}