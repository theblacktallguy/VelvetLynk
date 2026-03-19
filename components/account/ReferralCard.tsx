"use client";


type ReferralCardProps = {
  verified: boolean;
  userSlug: string;
  referralCount: number;
  verificationRewardsCount: number;
  firstAdRewardsCount: number;
};

export default function ReferralCard({
  verified,
  userSlug,
  referralCount,
  verificationRewardsCount,
  firstAdRewardsCount,
}: ReferralCardProps) {
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${userSlug}`;

  const totalEarnedCredits =
    verificationRewardsCount * 300 + firstAdRewardsCount * 700;

  async function copyReferralLink() {
    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      await navigator.clipboard.writeText(`${base}/register?ref=${userSlug}`);
    } catch (error) {
      console.error("Failed to copy referral link:", error);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">Referral Program</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Invite new users and earn 300 credits when they complete verification, plus 700 more after their first ad.
          </div>
        </div>

        <span
          className={[
            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            verified
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
          ].join(" ")}
        >
          {verified ? "Unlocked" : "Locked"}
        </span>
      </div>

      {!verified ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="font-semibold">Verification required</div>
          <div className="mt-1 text-xs sm:text-sm">
            Complete verification to unlock your referral link and start earning referral rewards.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-400 px-3 py-3 ">
            <div className="text-sm font-semibold uppercase tracking-wide">
              Your referral link
            </div>
            <div className="mt-2 break-all text-sm text-zinc-800 dark:text-zinc-100">
              {`/register?ref=${userSlug}`}
            </div>

            <button
              type="button"
              onClick={copyReferralLink}
              className="mt-3 inline-flex rounded-lg border px-3 py-2 text-sm gold-border hover:bg-amber-600/60"
            >
              Copy referral link
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Total referrals
              </div>
              <div className="mt-1 text-lg font-bold">{referralCount}</div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Credits earned
              </div>
              <div className="mt-1 text-lg font-bold">{totalEarnedCredits}</div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Verification rewards
              </div>
              <div className="mt-1 text-lg font-bold">{verificationRewardsCount}</div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                First ad rewards
              </div>
              <div className="mt-1 text-lg font-bold">{firstAdRewardsCount}</div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
