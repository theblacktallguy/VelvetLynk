import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashEmailVerificationToken } from "@/lib/email-verification";

type SearchParams = {
  token?: string;
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const rawToken = typeof sp?.token === "string" ? sp.token.trim() : "";

  let status: "success" | "invalid" | "missing" = "missing";
  let message = "This verification link is missing or invalid.";

  if (rawToken) {
    const tokenHash = hashEmailVerificationToken(rawToken);

    const token = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      token &&
      !token.usedAt &&
      token.expiresAt.getTime() > Date.now()
    ) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: token.userId },
          data: {
            emailVerified: new Date(),
          },
        }),
        prisma.emailVerificationToken.update({
          where: { id: token.id },
          data: {
            usedAt: new Date(),
          },
        }),
        prisma.emailVerificationToken.updateMany({
          where: {
            userId: token.userId,
            usedAt: null,
            id: { not: token.id },
          },
          data: {
            usedAt: new Date(),
          },
        }),
      ]);

      status = "success";
      message = "Your email has been verified successfully.";
    } else {
      status = "invalid";
      message = "This verification link is invalid or has expired.";
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-8000" style={{ backgroundColor: "rgba(179, 157, 30, 0.28)" }}>
        <h1 className="text-2xl font-semibold">Email verification</h1>

        <div
          className={[
            "mt-4 rounded-xl border p-4 text-sm",
            status === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/60 dark:bg-red-500/40 dark:text-red-500",
          ].join(" ")}
        >
          {message}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/account/verification"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go to verification
          </Link>

          <Link
            href="/account"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium transition dark:border-zinc-700"
          >
            Back to account
          </Link>
        </div>
      </div>
    </main>
  );
}