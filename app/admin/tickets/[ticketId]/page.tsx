import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  ticketId?: string;
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

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  await requireAdmin();

  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const ticketId = p.ticketId;

  if (!ticketId) {
    redirect("/admin/tickets");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
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

  if (!ticket) {
    return (
      <main className="min-h-screen flex flex-col">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
            <CityHeader fallbackHref="/admin/tickets" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="text-lg font-semibold">Ticket not found</div>
            <div className="mt-2 text-sm">This support ticket does not exist.</div>
            <LoadingLink
              href="/admin/tickets"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
            >
              Back to tickets
            </LoadingLink>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/admin/tickets" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Support Ticket</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review the user message and send an admin reply.
                </p>
              </div>

              <LoadingLink
                href="/admin/tickets"
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
              >
                Back to tickets
              </LoadingLink>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold">{ticket.subject}</div>

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

            <div className="text-sm text-zinc-700 dark:text-zinc-400">
              User: @{ticket.user.userSlug} — {ticket.user.email}
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Submitted: {formatDate(ticket.createdAt)}
              {ticket.repliedAt ? ` • Replied: ${formatDate(ticket.repliedAt)}` : ""}
              {ticket.closedAt ? ` • Closed: ${formatDate(ticket.closedAt)}` : ""}
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <div className="mb-2 text-sm font-semibold">User message</div>
              <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {ticket.message}
              </div>
            </div>

            {ticket.adminReply ? (
              <div className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                <div className="mb-2 text-sm font-semibold">Admin reply</div>
                <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {ticket.adminReply}
                </div>
              </div>
            ) : null}

            <form
              action={`/api/admin/tickets/${ticket.id}/reply`}
              method="post"
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold">Reply</label>
                <textarea
                  name="reply"
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/40"
                  placeholder="Write your reply to the user..."
                  defaultValue={ticket.adminReply || ""}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  name="action"
                  value="reply"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-amber-600/60"
                >
                  Save reply
                </button>

                <button
                  type="submit"
                  name="action"
                  value="close"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  Close ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}