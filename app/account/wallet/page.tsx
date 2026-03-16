import CityHeader from "@/components/CityHeader";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AutoDismissBanner from "@/components/AutoDismissBanner";


const MIN_POST_COST = 650;
const FEATURED_COST = 1000;
const EXTENDED_COST = 600;

type SearchParams = {
  payment?: string;
  credits?: string;
  error?: string;
  reference?: string;
};

function formatAmount(amount: number) {
  if (amount > 0) return `+${amount}`;
  return `${amount}`;
}

function formatType(type: string) {
  switch (type) {
    case "CREDIT_PURCHASE":
      return "Credit purchase";
    case "AD_POST":
      return "Ad posted";
    case "AD_RENEW":
      return "Ad renewed";
    case "FEATURED_UPGRADE":
      return "Featured upgrade";
    case "EXTENDED_UPGRADE":
      return "Extended upgrade";
    case "ADMIN_ADJUSTMENT":
      return "Admin adjustment";
    default:
      return type.replace(/_/g, " ");
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getWalletMessage(payment: string, creditsAdded: number, error: string) {
  if (payment === "success") {
    return {
      tone: "success" as const,
      title: "Payment successful",
      message:
        creditsAdded > 0
          ? `${creditsAdded} credits have been added to your wallet.`
          : "Your wallet has been funded successfully.",
    };
  }

  if (payment === "failed") {
    let message = "We could not complete your wallet funding.";

    if (error === "missing-reference") {
      message = "Payment reference was missing.";
    } else if (error === "payment-config") {
      message = "Payment is not configured correctly.";
    } else if (error === "verify-failed") {
      message = "We could not verify your payment.";
    } else if (error === "payment-not-successful") {
      message = "The payment was not successful.";
    } else if (error === "invalid-metadata") {
      message = "Payment data was invalid.";
    } else if (error === "user-mismatch") {
      message = "This payment does not belong to the current user.";
    } else if (error === "wallet-mismatch") {
      message = "This payment does not match your wallet.";
    } else if (error === "server-error") {
      message = "Something went wrong while confirming your payment.";
    }

    return {
      tone: "error" as const,
      title: "Payment failed",
      message,
    };
  }

  return null;
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/wallet");
  }

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const payment = sp?.payment || "";
  const creditsAdded = Number(sp?.credits || 0);
  const error = sp?.error || "";
  const walletMessage = getWalletMessage(payment, creditsAdded, error);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      wallet: {
        select: {
          id: true,
          credits: true,
          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
            select: {
              id: true,
              type: true,
              amount: true,
              balanceAfter: true,
              status: true,
              description: true,
              reference: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/wallet");
  }

  const balance = user.wallet?.credits ?? 0;
  const transactions = user.wallet?.transactions ?? [];
  const lowBalance = balance < MIN_POST_COST;

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="space-y-6">
          {walletMessage ? (
            <AutoDismissBanner duration={10000}>
              <div
                className={
                  walletMessage.tone === "success"
                    ? "rounded-xl border border-emerald-500/30 bg-emerald-700 p-4"
                    : "rounded-xl border border-red-500/30 bg-red-700 p-4"
                }
              >
              <div
                className={
                  walletMessage.tone === "success"
                    ? "text-sm font-semibold text-zinc-200 text-center"
                    : "text-sm font-semibold text-zinc-200 text-center"
                }
              >
                {walletMessage.title}
              </div>
              <div
                className={
                  walletMessage.tone === "success"
                    ? "mt-1 text-sm text-zinc-200 text-center"
                    : "mt-1 text-sm text-zinc-200 text-center"
                }
              >
                {walletMessage.message}
              </div>
              </div>
            </AutoDismissBanner>
          ) : null}

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Wallet & Credits</h1>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  Manage your credits, review wallet activity, and buy credits for posting and renewing ads.
                </p>
              </div>

              <div className="flex flex-wrap justify-between">
                <a
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Back to Account
                </a>
                <a
                  href="/account/wallet/deposit"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Buy Credits
                </a>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-s font-bold">Current Balance</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Credits are used to post ads, renew expired ads, and pay for featured or extended options.
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Available credits</div>
                <div className="mt-1 text-3xl font-bold gold-text">
                  {balance}
                </div>
              </div>
            </div>

            {lowBalance ? (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-600/40 dark:bg-amber-500/10 text-zinc-500">
                Your balance is below the minimum needed to post a standard ad. Buy credits to continue posting.
              </div>
            ) : null}
          </div>

          <div className="p-5">
            <div className="text-s font-bold">How Credits Work</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Standard ad</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  {MIN_POST_COST} credits
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Featured option</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  +{FEATURED_COST} credits
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Extended option</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  +{EXTENDED_COST} credits
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Renew expired ad</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  Same pricing as the original ad setup
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-s font-bold">Transaction History</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  All credit purchases and wallet usage will appear here.
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                No wallet activity yet. Buy credits to get started, then your posting and renewal history will appear here.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="card w-full min-w-[720px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Amount</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Description</th>
                      <th className="px-3 py-2 font-semibold">Balance After</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="rounded-lg "
                      >
                        <td className="px-3 py-3 text-sm font-medium">
                          {formatType(tx.type)}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold">
                          {formatAmount(tx.amount)}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {formatStatus(tx.status)}
                        </td>
                        <td className="px-3 py-3 text-sm text-zinc-700 dark:text-zinc-400">
                          {tx.description || "—"}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {typeof tx.balanceAfter === "number" ? tx.balanceAfter : "—"}
                        </td>
                        <td className="px-3 py-3 text-sm text-zinc-700 dark:text-zinc-400">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}