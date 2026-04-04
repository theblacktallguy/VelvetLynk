// app/reset-password/page.tsx
"use client";

import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen px-4 py-10" style={{ backgroundColor: "rgba(169, 149, 86, 0.1)" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}