import CityHeader from "@/components/CityHeader";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResendVerificationButton from "./ui/ResendVerificationButton";
import LevelTwoVerificationForm from "./ui/LevelTwoVerificationForm";

type SearchParams = {
  error?: string;
  success?: string;
};

export default async function VerificationPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/verification");
  }

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      verified: true,
      userSlug: true,
      profile: {
        select: {
          phone: true,
        },
      },
      verificationRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          createdAt: true,
          reviewedAt: true,
          reviewNote: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/verification");
  }

  const latestRequest = user.verificationRequests[0] ?? null;
  const emailVerified = Boolean(user.emailVerified);
  const levelTwoVerified = Boolean(user.verified);
  const phone = user.profile?.phone ?? "";

  const emailVerifiedLabel = emailVerified
    ? `Verified on ${user.emailVerified?.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`
    : "Not verified yet";

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="space-y-6">
          <div className="p-5">
            <h1 className="text-2xl font-bold">Verification</h1>
            <p className="mt-2 text-sm">
              Manage your account verification status. Email verification is
              required before you can post ads. Level 2 verification gives your
              profile an extra trust signal.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Email verification</h2>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                    Verify your email to secure your account and unlock ad
                    posting.
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    emailVerified
                      ? "border-emerald-500/30 bg-emerald-500/50"
                      : "border-amber-500/30 bg-amber-500/50",
                  ].join(" ")}
                >
                  {emailVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    Email address
                  </div>
                  <div className="mt-1 text-zinc-800 dark:text-zinc-500">
                    {user.email || "No email found"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    Status
                  </div>
                  <div className="mt-1 text-zinc-800 dark:text-zinc-500">
                    {emailVerifiedLabel}
                  </div>
                </div>

                {!emailVerified ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500 dark:text-amber-500">
                    Your email is not verified yet. You must verify it before
                    posting an ad.
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  Back to account
                </Link>

                {!emailVerified ? <ResendVerificationButton /> : null}
              </div>
            </div>

            <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold py-3">
                    Level 2 verification
                  </h2>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
                    Manual profile verification for a stronger trust badge.
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    levelTwoVerified
                      ? "border-emerald-500/30 bg-emerald-500/50"
                      : "border-amber-500/30 bg-amber-500/50",
                  ].join(" ")}
                >
                  {levelTwoVerified ? "Verified" : "Notverified"}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <p>Level 2 verification is reviewed manually. You will submit:</p>

                <ul className="list-disc space-y-1 pl-5">
                  <li>A clear selfie photo</li>
                  <li>
                    A second photo holding a paper showing your username, current phone number and the
                    current date
                  </li>
                </ul>

                <div className="rounded-xl border border-zinc-200 bg-zinc-500 p-3 dark:border-zinc-800">
                  <div className="font-bold text-zinc-800 dark:text-zinc-100">
                    Current phone
                  </div>
                  <div className="mt-1 font-semibold text-zinc-800 dark:text-zinc-100">
                    {phone ? phone : "No phone number added yet"}
                  </div>
                </div>

                {sp?.success === "submitted" ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/50 p-3 text-sm">
                    Your verification request has been submitted successfully.
                  </div>
                ) : null}

                {sp?.error === "already_pending" ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/50 p-3 text-sm">
                    You already have a pending verification request.
                  </div>
                ) : null}

                {sp?.error === "missing_images" ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/50 p-3 text-sm">
                    Please upload both required verification images.
                  </div>
                ) : null}

                {sp?.error === "email_not_verified" ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/50 p-3 text-sm">
                    Please verify your email before submitting Level 2 verification.
                  </div>
                ) : null}

                {levelTwoVerified ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/50 p-3 text-sm">
                    Your account has passed Level 2 verification.
                  </div>
                ) : latestRequest?.status === "PENDING" ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/50 p-3 text-sm">
                    Your verification request is pending review.
                  </div>
                ) : latestRequest?.status === "REJECTED" ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/50 p-3 text-sm">
                      Your last verification request was rejected.
                      {latestRequest.reviewNote
                        ? ` Reason: ${latestRequest.reviewNote}`
                        : ""}
                    </div>
                    <LevelTwoVerificationForm />
                  </div>
                ) : (
                  <LevelTwoVerificationForm />
                )}
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
            <h2 className="text-lg font-bold pry-3">
              What verification unlocks
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">
                  Email verified
                </div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Required before posting ads.
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">
                  Better trust
                </div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Verified accounts look safer and more credible to visitors.
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm font-semibold">
                  Level 2 badge
                </div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Manual approval gives an extra trust badge on your profile.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}