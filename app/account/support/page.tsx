import CityHeader from "@/components/CityHeader";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AccountSupportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/support");
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      subject: true,
      message: true,
      adminReply: true,
      status: true,
      createdAt: true,
      repliedAt: true,
      closedAt: true,
    },
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const answeredCount = tickets.filter((t) => t.status === "ANSWERED").length;
  const closedCount = tickets.filter((t) => t.status === "CLOSED").length;

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Support Tickets</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  View your submitted tickets, track their status, and read replies from support.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Open Support Chat
                </Link>

                <Link
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  Back to Account
                </Link>
              </div>
            </div>
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
                <div className="text-s font-bold">Your Ticket History</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Replies from support will appear inside each ticket below.
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                You have not submitted any support tickets yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                  >
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

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Submitted: {formatDate(ticket.createdAt)}</span>
                      {ticket.repliedAt ? (
                        <span>Replied: {formatDate(ticket.repliedAt)}</span>
                      ) : null}
                      {ticket.closedAt ? (
                        <span>Closed: {formatDate(ticket.closedAt)}</span>
                      ) : null}
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="mb-2 text-sm font-semibold">Your message</div>
                      <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                        {ticket.message}
                      </div>
                    </div>

                    {ticket.adminReply ? (
                      <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                        <div className="mb-2 text-sm font-semibold">Support reply</div>
                        <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                          {ticket.adminReply}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                        No reply yet. Our support team will respond here when available.
                      </div>
                    )}
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
