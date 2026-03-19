// app/account/deposit/page.tsx
import CityHeader from "@/components/CityHeader";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DepositPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/deposit");

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-5">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Deposit
          </div>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Add credits to your wallet. (We’ll wire payment provider + credit
            ledger next.)
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/account"
              className="rounded-lg border px-3 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)]"
            >
              Back to account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}