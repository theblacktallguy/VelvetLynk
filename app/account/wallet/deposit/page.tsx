import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AutoScrollToSelectedPackage from "@/components/AutoScrollToSelectedPackage";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  credits?: string;
};

const CREDIT_PACKAGES = [
  { credits: 1000, amountNaira: 1000, label: "Starter" },
  { credits: 3000, amountNaira: 3000, label: "Standard" },
  { credits: 5000, amountNaira: 5000, label: "Pro" },
  { credits: 10000, amountNaira: 10000, label: "Premium" },
] as const;

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BuyCreditsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/wallet/deposit");
  }

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const selectedCredits = Number(sp?.credits || 0);

  const selectedPackage =
    CREDIT_PACKAGES.find((pkg) => pkg.credits === selectedCredits) ?? null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      wallet: {
        select: {
          credits: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/wallet/deposit");
  }

  const balance = user.wallet?.credits ?? 0;

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account/wallet" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <AutoScrollToSelectedPackage
          active={!!selectedPackage}
          targetId="purchase-summary"
        />

        <div className="space-y-6">
          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Buy Credits</h1>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  Choose a credit package and continue to secure payment checkout.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <LoadingLink
                  href="/account/wallet"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
                >
                  Back to Wallet
                </LoadingLink>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-s font-bold">Current Balance</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Available wallet credits
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Balance
                </div>
                <div className="mt-1 text-3xl font-bold gold-text">
                  {balance}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="text-s font-bold">Choose a Package</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Select the package that best fits your posting and renewal needs.
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {CREDIT_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage?.credits === pkg.credits;

                return (
                  <div
                    key={pkg.credits}
                    className={[
                      "rounded-2xl border p-4 dark:border-zinc-800",
                      isSelected ? "border-amber-500/60" : "border-zinc-200",
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold">{pkg.label}</div>

                    <div className="mt-2 text-2xl font-bold gold-text">
                      {pkg.credits}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      credits
                    </div>

                    <div className="mt-3 text-sm ">
                      {formatNaira(pkg.amountNaira)}
                    </div>

                    <div className="mt-4">
                      <LoadingLink
                        href={`/account/wallet/deposit?credits=${pkg.credits}`}
                        className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
                      >
                        {isSelected ? "Selected" : "Choose Package"}
                      </LoadingLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            id="purchase-summary"
            className="card p-5 bg-white/80 dark:bg-zinc-900/40"
          >
            <div className="text-s font-bold">Purchase Summary</div>

            {!selectedPackage ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                Select a package above to continue to payment.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Package
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {selectedPackage.label}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Credits
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {selectedPackage.credits}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Amount
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {formatNaira(selectedPackage.amountNaira)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Account email
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {user.email || "No email found"}
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  action="/api/payments/paystack/initialize"
                  method="post"
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <input
                    type="hidden"
                    name="credits"
                    value={selectedPackage.credits}
                  />

                  <input
                    type="hidden"
                    name="amountNaira"
                    value={selectedPackage.amountNaira}
                  />

                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    You will be redirected to Paystack to complete payment securely.
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="text-s font-bold">How Credits Are Used</div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Standard ad</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  650 credits
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Featured option</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  +1000 credits
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">Extended option</div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                  +600 credits
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
        </div>
      </section>
    </main>
  );
}