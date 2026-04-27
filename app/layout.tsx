import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Providers from "./providers";
import Footer from "@/components/Footer";
import SessionRevocationGuard from "@/components/auth/SessionRevocationGuard";
import { RouteLoadingProvider } from "@/components/navigation/RouteLoadingProvider";
import RouteLoadingOverlay from "@/components/navigation/RouteLoadingOverlay";

export const metadata: Metadata = {
  title: "VelvetLynk",
  description:
    "VelvetLynk is a modern and secure platform designed for adults seeking private and verified connections across Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#0b0f1a] text-white">
        <Providers>
          <Suspense fallback={null}>
            <RouteLoadingProvider>
              <SessionRevocationGuard />
              <RouteLoadingOverlay />
              <div className="flex-1">{children}</div>
              <Footer />
            </RouteLoadingProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}