import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Footer from "@/components/Footer";
import SessionRevocationGuard from "@/components/auth/SessionRevocationGuard";

export const metadata: Metadata = {
  title: "SecretLink",
  description:
    "SecretLink is a modern and secure platform designed for adults seeking private and verified connections across Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <SessionRevocationGuard />

          <div className="flex-1">{children}</div>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}