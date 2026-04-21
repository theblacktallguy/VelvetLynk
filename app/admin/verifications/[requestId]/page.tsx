import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
} from "../actions";

type Params = {
  requestId?: string;
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

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  await requireAdmin();

  const p =
    "then" in (params as any)
      ? await (params as Promise<Params>)
      : (params as Params);

  const requestId = p.requestId;

  if (!requestId) {
    redirect("/admin/verifications");
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      selfieImageUrl: true,
      proofImageUrl: true,
      note: true,
      reviewNote: true,
      createdAt: true,
      reviewedAt: true,
      user: {
        select: {
          id: true,
          userSlug: true,
          email: true,
          verified: true,
          profile: {
            select: {
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    return (
      <main className="min-h-screen flex flex-col">
        <section className="hero-pattern">
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6">
            <CityHeader />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="text-lg font-semibold">Request not found</div>
            <div className="mt-2 text-sm">
              This verification request does not exist.
            </div>
            <LoadingLink
              href="/admin/verifications"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
            >
              Back to queue
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
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="p-5 ">
            <div className="flex flex-col gap-4 sm:flex-row text-center sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Review verification request
                </h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Review submission details and approve or reject this request.
                </p>
              </div>

              <LoadingLink
                href="/admin/verifications"
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
              >
                Back to queue
              </LoadingLink>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold ">
                    @{request.user.userSlug}
                  </div>

                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      request.status === "APPROVED"
                        ? "border-emerald-500/30 bg-emerald-700/70 "
                        : request.status === "REJECTED"
                        ? "border-red-500/30 bg-red-700/70"
                        : "border-amber-500/30 bg-amber-700/70",
                    ].join(" ")}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="text-sm text-zinc-700 dark:text-zinc-400">
                  Email: {request.user.email || "No email"}
                </div>

                <div className="text-sm text-zinc-700 dark:text-zinc-400">
                  Phone: {request.user.profile?.phone || "No phone"}
                </div>

                <div className="text-sm text-zinc-700 dark:text-zinc-400">
                  Submitted:{" "}
                  {request.createdAt.toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                {request.reviewedAt ? (
                  <div className="text-sm text-zinc-700 dark:text-zinc-400">
                    Reviewed:{" "}
                    {request.reviewedAt.toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                ) : null}

                <div className="pt-1">
                  <LoadingLink
                    href={`/profile/${request.user.userSlug}`}
                    className="text-sm font-semibold underline transition-all duration-200 hover:opacity-80 active:opacity-70"
                  >
                    Open public profile
                  </LoadingLink>
                </div>
              </div>

              {request.user.profile?.avatarUrl ? (
                <img
                  src={request.user.profile.avatarUrl}
                  alt={request.user.userSlug}
                  className="h-20 w-20 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
              ) : null}
            </div>

            {request.note ? (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-700 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                <span className="font-semibold">User note:</span> {request.note}
              </div>
            ) : null}

            {request.reviewNote ? (
                <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                        <span className="font-semibold">Review note:</span> {request.reviewNote}
                    </div>
                    ) : null}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="mb-2 text-s font-bold py-3">
                        Selfie photo
                        </div>
                        <a href={request.selfieImageUrl} target="_blank" rel="noreferrer">
                        <img
                            src={request.selfieImageUrl}
                            alt="Selfie verification"
                            className="w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                        />
                        </a>
                    </div>

                    <div>
                        <div className="mb-2 text-s font-bold py-3">
                        Proof photo
                        </div>
                        <a href={request.proofImageUrl} target="_blank" rel="noreferrer">
                        <img
                            src={request.proofImageUrl}
                            alt="Proof verification"
                            className="w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                        />
                        </a>
                    </div>
                </div>

            {request.status === "PENDING" ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <form action={approveVerificationRequest}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <button
                        type="submit"
                        className="w-full rounded-lg border px-4 py-2 text-sm font-semibold border-emerald-500/40 hover:bg-emerald-800/90"
                    >
                        Approve verification
                    </button>
                    </form>

                    <form action={rejectVerificationRequest} className="space-y-3">
                    <input type="hidden" name="requestId" value={request.id} />
                    <select
                        name="reviewNote"
                        className="w-full rounded-xl border border-zinc-200 bg-transparent p-3 text-sm dark:border-zinc-800"
                        defaultValue=""
                        >
                        <option value="" disabled>
                            Select rejection reason
                        </option>

                        <option value="Selfie photo is not clear enough">
                            Selfie photo is not clear enough
                        </option>

                        <option value="Proof photo does not show username clearly">
                            Proof photo does not show username clearly
                        </option>

                        <option value="Proof photo missing today's date">
                            Proof photo missing today's date
                        </option>

                        <option value="Face is not clearly visible">
                            Face is not clearly visible
                        </option>

                        <option value="Username on paper does not match profile">
                            Username on paper does not match profile
                        </option>

                        <option value="Images appear edited or manipulated">
                            Images appear edited or manipulated
                        </option>

                        <option value="Verification photos do not meet requirements">
                            Verification photos do not meet requirements
                        </option>
                    </select>
                    <button
                        type="submit"
                        className="w-full rounded-lg border px-4 py-2 text-sm font-semibold border-red-500/40 hover:bg-red-800/80"
                    >
                        Reject verification
                    </button>
                    </form>
                </div>
                ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}