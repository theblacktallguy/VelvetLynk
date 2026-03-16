"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function TopLinks() {
  const { data: session, status } = useSession();

  const isAuthed = status === "authenticated";
  const userSlug =
    (session?.user as any)?.userSlug || (session?.user as any)?.username;

  const accountHref = isAuthed ? "/account" : "/login";
  const postHref = isAuthed ? "/post" : "/login";

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      {!isAuthed ? (
        <Link
          href="/login"
          className="rounded-lg border px-3 py-2 transition-colors gold-border hover:bg-amber-600/60 hover:text-zinc-900"
        >
          Login/Signup
        </Link>
      ) : (
        <Link
          href={accountHref}
          className="rounded-lg border px-3 py-2 transition-colors gold-border hover:bg-amber-600/60 hover:text-zinc-900"
        >
          My Account
        </Link>
      )}

      <Link
        href={postHref}
        className="rounded-lg border px-3 py-2 font-medium transition-colors gold-border hover:bg-amber-600/60 hover:text-zinc-900"
      >
        Post Ad
      </Link>
    </div>
  );
}