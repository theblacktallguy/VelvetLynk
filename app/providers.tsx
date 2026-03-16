"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import InactivityLogout from "@/components/InactivityLogout";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InactivityLogout />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}