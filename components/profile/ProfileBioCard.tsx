type Props = {
  bio?: string;
  state?: string;
  city?: string;
  memberSince?: string;
  lastActive?: string;
};

export default function ProfileBioCard({
  bio,
  state,
  city,
  memberSince,
  lastActive,
}: Props) {
  return (
    <div className="card mt-6 w-full max-w-full min-w-0 overflow-hidden p-4">
      <div className="text-s font-bold">
        Bio
      </div>

      <p className="mt-2 break-words text-sm leading-6">
        {bio?.trim() ? bio : "No bio added yet."}
      </p>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border p-3">
          <div className="text-xs font-semibold">
            Location
          </div>
          <div className="mt-1 break-words text-sm text-zinc-800 dark:text-zinc-400">
            {city && state ? `${city}, ${state}` : "—"}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border p-3">
          <div className="text-xs font-semibold">
            Account
          </div>
          <div className="mt-1 break-words text-sm text-zinc-800 dark:text-zinc-400">
            {memberSince ? `Member since ${memberSince}` : "Member since —"}
            {lastActive ? ` • Last active ${lastActive}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}