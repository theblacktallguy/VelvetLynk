"use client";

import LoadingLink from "@/components/navigation/LoadingLink";

export default function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-s font-bold">
            Wallet & Credits
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Use credits to post ads and boost placements.
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Balance</div>
          <div className="mt-1 text-2xl font-bold gold-text">
            {Number.isFinite(balance) ? balance : 0} credits
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <LoadingLink
          href="/account/wallet"
          className="rounded-lg border px-4 py-2 text-sm gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          View Wallet
        </LoadingLink>

        <LoadingLink
          href="/account/wallet/deposit"
          className="rounded-lg border px-4 py-2 text-sm gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
        >
          Add Credits
        </LoadingLink>
      </div>
    </div>
  );
}