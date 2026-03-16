// app/register/page.tsx
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-10">Loading…</div>}>
      <RegisterClient />
    </Suspense>
  );
}