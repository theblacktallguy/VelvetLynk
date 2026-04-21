"use client";

import LoadingLink from "@/components/navigation/LoadingLink";
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
        <LoadingLink
          href="/login"
          className="rounded-lg border px-3 py-2 transition-all duration-200 gold-border hover:bg-amber-600/60 hover:text-zinc-900 active:scale-95 active:opacity-80"
        >
          Login/Signup
        </LoadingLink>
        ) : (
        <LoadingLink
          href={accountHref}
          className="rounded-lg border px-3 py-2 transition-all duration-200 gold-border hover:bg-amber-600/60 hover:text-zinc-900 active:scale-95 active:opacity-80"
        >
          My Account
        </LoadingLink>
        )}

        <LoadingLink
          href={postHref}
          className="rounded-lg border px-3 py-2 font-medium transition-all duration-200 gold-border hover:bg-amber-600/60 hover:text-zinc-900 active:scale-95 active:opacity-80"
        >
          Post Ad
        </LoadingLink>
    </div>
  );
}