"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type Ad = {
  id: string;
  username: string;
  userSlug: string;
  verified: boolean;
  postedAt: string;
  title: string;
  state: string;
  city: string;
  hasImage: boolean;
  featured?: boolean;
  avatarUrl?: string;
};

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-end gap-1 font-semibold",
        verified ? "text-blue-500" : "text-zinc-400",
      ].join(" ")}
      title={verified ? "Verified" : "Not Verified"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.4 2.4L18 4l-.4 3.6L20 10l-2.4 2.4L18 16l-3.6-.4L12 18l-2.4-2.4L6 16l.4-3.6L4 10l2.4-2.4L6 4l3.6.4L12 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12.2l1.7 1.7 3.6-3.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {verified ? "Verified" : "Not Verified"}
    </span>
  );
}

function PhotoIcon() {
  return (
    <span
      className="shrink-0 text-zinc-500 dark:text-zinc-400"
      title="Includes photos"
      aria-label="Includes photos"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 7l1.2-2h3.6L15 7h3a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8a3 3 0 013-3h3z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 17a4 4 0 100-8 4 4 0 000 8z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

export default function AdCard({ ad }: { ad: Ad }) {
  const router = useRouter();

  const adUrl = `/ad/${ad.id}`;
  const profileUrl = `/profile/${ad.userSlug}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(adUrl)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(adUrl);
      }}
      className={[
        "cursor-pointer rounded-xl border p-3 transition outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]",
        ad.featured
          ? "border-[rgba(212,175,55,0.70)] bg-[rgba(212,175,55,0.12)]"
          : "hover:bg-[rgba(212,175,55,0.10)] dark:hover:bg-[rgba(212,175,55,0.12)]",
      ].join(" ")}
    >
      <div className="flex gap-3">
        {/* Avatar → profile */}
        <Link
          href={profileUrl}
          onClick={(e) => e.stopPropagation()}
          className="block h-11 w-11 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
          aria-label={`Open profile: ${ad.username}`}
        >
          <img
            src={ad.avatarUrl || "/assets/avatar.jpg"}
            alt={ad.username}
            className="h-full w-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Username → profile */}
            <Link
              href={`/profile/${ad.userSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="min-w-0"
            >
              <div className="truncate text-sm font-semibold">
                @{ad.username}
              </div>
            </Link>

            {ad.featured && (
              <span className="ml-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold gold-border gold-text">
                FEATURED
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-start justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{ad.postedAt}</span>

            <span className="text-right">
              <VerificationBadge verified={ad.verified} />
              <span className="block">
                {ad.city}, {ad.state}
              </span>
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span className="text-sm font-medium">{ad.title}</span>

            {/* Photo icon → ad details */}
            {ad.hasImage ? (
              <Link href={adUrl} onClick={(e) => e.stopPropagation()}>
                <PhotoIcon />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}