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
    redirect("/login?callbackUrl=/admin/tickets");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      userSlug: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/admin/tickets");
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

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  await requireAdmin();

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      subject: true,
      message: true,
      adminReply: true,
      status: true,
      createdAt: true,
      repliedAt: true,
      closedAt: true,
      user: {
        select: {
          userSlug: true,
          email: true,
        },
      },
    },
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const answeredCount = tickets.filter((t) => t.status === "ANSWERED").length;
  const closedCount = tickets.filter((t) => t.status === "CLOSED").length;

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
                <h1 className="text-2xl font-bold">Support Tickets</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review user support tickets and send admin replies.
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

            {sp?.success === "replied" ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-800/80 p-3">
                Ticket reply sent successfully.
              </div>
            ) : null}

            {sp?.success === "closed" ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-800/80 p-3">
                Ticket closed successfully.
              </div>
            ) : null}

            {sp?.error ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-800/80 p-3">
                {sp.error}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Open</div>
              <div className="mt-2 text-3xl font-bold gold-text">{openCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Answered</div>
              <div className="mt-2 text-3xl font-bold gold-text">{answeredCount}</div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Closed</div>
              <div className="mt-2 text-3xl font-bold gold-text">{closedCount}</div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-s font-bold">Ticket Queue</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Open tickets stay at the top for faster response.
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                No support tickets found.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-base font-semibold">{ticket.subject}</div>

                          <span
                            className={[
                              "rounded-full border px-3 py-1 text-xs font-semibold",
                              ticket.status === "CLOSED"
                                ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                : ticket.status === "ANSWERED"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                            ].join(" ")}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400 line-clamp-3">
                          {ticket.message}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>Submitted: {formatDate(ticket.createdAt)}</span>
                          <span>User: @{ticket.user.userSlug}</span>
                          <span>{ticket.user.email}</span>
                          {ticket.repliedAt ? <span>Replied: {formatDate(ticket.repliedAt)}</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <LoadingLink
                          href={`/admin/tickets/${ticket.id}`}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
                        >
                          Open ticket
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