import LoadingLink from "@/components/navigation/LoadingLink";

export default function AccountBioCard({ bio }: { bio: string }) {
  const trimmed = (bio || "").trim();
  const preview =
    trimmed.length > 0 ? trimmed : "Add a short bio (max 150 characters).";

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-s font-bold ">
          About me
        </div>

        <LoadingLink
          href="/account/profile/edit#bio"
          className="inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 gold-border hover:bg-amber-600/60 active:scale-95 active:opacity-80"
          aria-label="Edit bio"
          title="Edit bio"
        >
          +
        </LoadingLink>
      </div>

      <p
        className={[
          "mt-3 text-sm leading-6",
          trimmed ? "" : "",
        ].join(" ")}
      >
        {preview.length > 160 ? preview.slice(0, 160) + "…" : preview}
      </p>

      <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Max 150 characters (required to post).
      </div>
    </div>
  );
}