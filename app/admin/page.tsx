import CityHeader from "@/components/CityHeader";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      userSlug: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    (user.email && adminEmails.includes(user.email.toLowerCase())) ||
    user.userSlug === "admin";

  if (!isAdmin) {
    redirect("/account");
  }

  return user;
}

export default async function AdminPage() {
  const adminUser = await requireAdmin();

  const [totalUsers, totalAds, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.ad.count(),
      prisma.verificationRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.verificationRequest.count({
        where: { status: "APPROVED" },
      }),
      prisma.verificationRequest.count({
        where: { status: "REJECTED" },
      }),
    ]);

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Admin Dashboard
                </div>
                <h1 className="mt-2 text-2xl font-bold">Moderation & Operations</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review verification requests, monitor platform activity, and manage core admin actions.
                </p>
                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Signed in as {adminUser.email || `@${adminUser.userSlug}`}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  Back to Account
                </Link>

                <Link
                  href="/admin"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Refresh Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Total users</div>
              <div className="mt-2 text-3xl font-bold gold-text">{totalUsers}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Total ads</div>
              <div className="mt-2 text-3xl font-bold gold-text">{totalAds}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Pending verifications</div>
              <div className="mt-2 text-3xl font-bold gold-text">{pendingCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Approved</div>
              <div className="mt-2 text-3xl font-bold gold-text">{approvedCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Rejected</div>
              <div className="mt-2 text-3xl font-bold gold-text">{rejectedCount}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">Verification Queue</div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                    Review Level 2 verification su.  bmissions and decide approval or rejection.
                  </div>
                </div>

                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="mt-4">
                <Link
                  href="/admin/verifications"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Open Verification Queue
                </Link>
              </div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">Reports Review</div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                    Admin report moderation workflow will be added here next.
                  </div>
                </div>

                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="mt-4">
                  <Link
                    href="/admin/reports"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                  >
                    Open Reports
                  </Link>
                </div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">Support Tickets</div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                    Admin replies and ticket handling can be managed from here later.
                  </div>
                </div>

                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="mt-4">
                  <Link
                    href="/admin/tickets"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                  >
                    Open Tickets
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}