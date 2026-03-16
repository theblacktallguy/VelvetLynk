import Link from "next/link";

type Props = {
  userSlug: string;
};

export default function ProfileSafetyCard({ userSlug }: Props) {
  return (
    <div className="card mt-6 p-4">
      <div className="text-s font-bold">
        Safety & Reporting
      </div>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-900 dark:text-zinc-400">
        <li>Never send money upfront or share sensitive banking details.</li>
        <li>Be cautious of rushed requests, pressure tactics, or impersonation.</li>
        <li>If something feels suspicious, stop and report it.</li>
      </ul>

      <div className="mt-4 flex items-center justify-end">
        <Link
          href={`/report/profile/${userSlug}`}
          className="rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          Report this profile
        </Link>
      </div>
    </div>
  );
}