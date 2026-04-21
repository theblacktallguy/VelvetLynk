import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  success?: string;
  error?: string;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/reports");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      userSlug: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/admin/reports");
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

function formatDate(date: Date) {
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  await requireAdmin();

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      ad: {
        select: {
          id: true,
          title: true,
          status: true,
          owner: {
            select: {
              userSlug: true,
              email: true,
            },
          },
        },
      },
      reporter: {
        select: {
          userSlug: true,
          email: true,
        },
      },
    },
  });

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const reviewedCount = reports.filter((r) => r.status === "REVIEWED").length;
  const dismissedCount = reports.filter((r) => r.status === "DISMISSED").length;
  const actionedCount = reports.filter((r) => r.status === "ACTION_TAKEN").length;

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/admin" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Reported Ads Review</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review reported ads, inspect report details, and take moderation actions where necessary.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <LoadingLink
                  href="/admin"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                >
                  Back to Admin
                </LoadingLink>
              </div>
            </div>

            {sp?.success === "reviewed" ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-800/80 p-3">
                Report marked as reviewed successfully.
              </div>
            ) : null}

            {sp?.success === "dismissed" ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-800/80 p-3">
                Report dismissed successfully.
              </div>
            ) : null}

            {sp?.success === "actioned" ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-800/80 p-3">
                Moderation action completed successfully.
              </div>
            ) : null}

            {sp?.error ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-800/80 p-3">
                {sp.error}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Pending</div>
              <div className="mt-2 text-3xl font-bold gold-text">{pendingCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Reviewed</div>
              <div className="mt-2 text-3xl font-bold gold-text">{reviewedCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Dismissed</div>
              <div className="mt-2 text-3xl font-bold gold-text">{dismissedCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Action taken</div>
              <div className="mt-2 text-3xl font-bold gold-text">{actionedCount}</div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-s font-bold">Reports Queue</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Pending reports stay at the top for faster moderation review.
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {reports.length} {reports.length === 1 ? "report" : "reports"}
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                No reports found.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-base font-semibold">
                            {report.ad?.title || "Deleted ad"}
                          </div>

                          <span
                            className={[
                              "rounded-full border px-3 py-1 text-xs font-semibold",
                              report.status === "ACTION_TAKEN"
                                ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                                : report.status === "DISMISSED"
                                ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                : report.status === "REVIEWED"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                            ].join(" ")}
                          >
                            {report.status}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                          <span className="font-semibold">Reason:</span> {report.reason}
                        </div>

                        {report.details ? (
                          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                            <span className="font-semibold">Details:</span> {report.details}
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>Reported: {formatDate(report.createdAt)}</span>
                          <span>Reporter: @{report.reporter?.userSlug || "unknown"}</span>
                          <span>Owner: @{report.ad?.owner?.userSlug || "unknown"}</span>
                          {report.ad?.status ? <span>Ad status: {report.ad.status}</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {report.ad?.id ? (
                          <LoadingLink
                            href={`/ad/${report.ad.id}`}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                          >
                            View ad
                          </LoadingLink>
                        ) : null}

                        <form action={`/api/report/${report.id}`} method="post">
                          <input type="hidden" name="action" value="reviewed" />
                          <button
                            type="submit"
                            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                          >
                            Mark reviewed
                          </button>
                        </form>

                        <form action={`/api/report/${report.id}`} method="post">
                          <input type="hidden" name="action" value="dismissed" />
                          <button
                            type="submit"
                            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                          >
                            Dismiss
                          </button>
                        </form>

                        {report.ad?.id ? (
                          <form action={`/api/report/${report.id}`} method="post">
                            <input type="hidden" name="action" value="remove_ad" />
                            <button
                              type="submit"
                              className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                            >
                              Remove ad
                            </button>
                          </form>
                        ) : null}

                        {report.ad?.owner?.email ? (
                          <form action={`/api/report/${report.id}`} method="post">
                            <input type="hidden" name="action" value="suspend_user" />
                            <button
                              type="submit"
                              className="rounded-lg border px-4 py-2 text-sm font-semibold border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                            >
                              Suspend user
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}