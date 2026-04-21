import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  error?: string;
  success?: string;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/verifications");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      userSlug: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/admin/verifications");
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

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  await requireAdmin();

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const requests = await prisma.verificationRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      user: {
        select: {
          userSlug: true,
          email: true,
          verified: true,
          profile: {
            select: {
              avatarUrl: true,
              phone: true,
            },
          },
        },
      },
    },
  });

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
                <h1 className="text-2xl font-bold">Verification Review Queue</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review Level 2 verification submissions and decide approval or rejection.
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

            {sp?.success === "approved" ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-800/80 p-3">
                Verification request approved successfully.
              </div>
            ) : null}

            {sp?.success === "rejected" ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-800/80 p-3">
                Verification request rejected successfully.
              </div>
            ) : null}

            {sp?.error ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-800/80 p-3">
                {sp.error}
              </div>
            ) : null}
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-s font-bold">Verification Requests</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Most recent requests appear below. Pending requests stay at the top.
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {requests.length} {requests.length === 1 ? "request" : "requests"}
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                No verification requests found.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        {request.user.profile?.avatarUrl ? (
                          <img
                            src={request.user.profile.avatarUrl}
                            alt={request.user.userSlug}
                            className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="truncate text-base font-semibold">
                              @{request.user.userSlug}
                            </div>

                            {request.user.verified ? (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Verified
                              </span>
                            ) : null}

                            <span
                              className={[
                                "rounded-full border px-3 py-1 text-xs font-semibold",
                                request.status === "APPROVED"
                                  ? "border-emerald-500/30 bg-emerald-800/80 text-emerald-800 dark:text-emerald-200"
                                  : request.status === "REJECTED"
                                  ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                              ].join(" ")}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                            {request.user.email || "No email"}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>Submitted: {formatDate(request.createdAt)}</span>
                            {request.reviewedAt ? (
                              <span>Reviewed: {formatDate(request.reviewedAt)}</span>
                            ) : null}
                            {request.user.profile?.phone ? (
                              <span>Phone: {request.user.profile.phone}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <LoadingLink
                          href={`/profile/${request.user.userSlug}`}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                        >
                          View profile
                        </LoadingLink>

                        <LoadingLink
                          href={`/admin/verifications/${request.id}`}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
                        >
                          Review request
                        </LoadingLink>
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