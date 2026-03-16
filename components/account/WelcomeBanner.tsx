"use client";

import { useEffect, useState } from "react";

export default function WelcomeBanner({
  fullName,
  show,
}: {
  fullName?: string;
  show: boolean;
}) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);

    if (!show) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3500); // 3.5 seconds

    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-50 flex items-center justify-center p-4 bg-emerald-600 text-white shadow-lg rounded-b-xl animate-slide-down">
      <div className="text-lg font-semibold">
        Welcome back{fullName ? `, ${fullName}` : ""}!
      </div>
    </div>
  );
}