"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AutoDismissBanner({
  children,
  duration = 10000,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("payment");
      params.delete("credits");
      params.delete("error");
      params.delete("reference");

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, pathname, router, searchParams]);

  if (!visible) return null;

  return <>{children}</>;
}