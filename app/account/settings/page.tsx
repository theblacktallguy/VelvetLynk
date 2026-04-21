import CityHeader from "@/components/CityHeader";
import LoadingLink from "@/components/navigation/LoadingLink";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function maskEmail(email?: string | null) {
  if (!email) return "No email found";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0] ?? ""}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

type SearchParams = {
  error?: string;
};



export default async function AccountSettingsPage({
searchParams,
}: {
searchParams?: Promise<SearchParams> | SearchParams;
}) {

    const sp =
        searchParams && "then" in (searchParams as any)
        ? await (searchParams as Promise<SearchParams>)
        : (searchParams as SearchParams | undefined);
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      userSlug: true,
      verified: true,
      emailVerified: true,
      sessionVersion: true,
      createdAt: true,
      profile: {
        select: {
          city: true,
          state: true,
        },
      },
      wallet: {
        select: {
          credits: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/settings");
  }

  const joinedDate = new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(user.createdAt);

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
                <h1 className="text-2xl font-bold">Settings & Security</h1>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                  Manage your account details, password, verification status, and security preferences.
                </p>
              </div>

                {sp?.error ? (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-800/80 p-3">
                        {sp.error}
                    </div>
                ) : null}

              <div className="flex flex-wrap gap-3">
                <LoadingLink
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                >
                  Back to Account
                </LoadingLink>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                <div className="text-s font-bold">Account Information</div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Full name
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {user.name || "Not set"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Username
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      @{user.userSlug}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Email
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {maskEmail(user.email)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Joined
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {joinedDate}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Location
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {user.profile?.city && user.profile?.state
                        ? `${user.profile.city}, ${user.profile.state}`
                        : "Not set"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Wallet balance
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {user.wallet?.credits ?? 0} credits
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <LoadingLink
                    href="/account/profile/edit"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold gold-border transition-all duration-200 hover:bg-amber-600/60 active:scale-95 active:opacity-80"
                  >
                    Edit Profile
                  </LoadingLink>
                </div>
              </div>

              <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                <div className="text-s font-bold">Security</div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">Password</div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Change your password if you think your account may be at risk.
                        </div>
                      </div>

                      <LoadingLink
                        href="/forgot-password"
                        className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                      >
                        Change Password
                      </LoadingLink>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">Email verification</div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Confirm your email to secure your account and access protected actions.
                        </div>
                      </div>

                      <LoadingLink
                        href="/verify-email"
                        className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                      >
                        {user.emailVerified ? "Verified" : "Verify Email"}
                      </LoadingLink>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">Platform verification</div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Verification improves trust and may unlock badge display across the platform.
                        </div>
                      </div>

                      <LoadingLink
                        href="/account/verification"
                        className="rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-95 active:opacity-80 dark:hover:bg-zinc-800/60"
                      >
                        {user.verified ? "Verified" : "Manage Verification"}
                      </LoadingLink>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-sm font-semibold">Session security</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      Your session protection is active. Password resets and admin security actions can revoke older sessions.
                    </div>
                    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                      Session version: {user.sessionVersion ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                <div className="text-s font-bold">Danger Zone</div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-red-500/30 p-4">
                    <div className="text-sm font-semibold text-red-700 ">
                      Delete Account
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      This should permanently remove your account, profile, and associated content. Use this only if you are certain.
                    </div>

                    <form
                        action="/api/account/delete"
                        method="post"
                        className="mt-4 space-y-3"
                        >
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-400">
                            Current password
                            </label>
                            <input
                            name="currentPassword"
                            type="password"
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                            placeholder="Enter your current password"
                            required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-400">
                            Type DELETE to confirm
                            </label>
                            <input
                            name="confirmText"
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                            placeholder="DELETE"
                            required
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-amber-600/60"
                        >
                            Delete My Account
                        </button>
                        </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                <div className="text-s font-bold">Status</div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Email status
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {user.emailVerified ? "Verified" : "Pending verification"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Account verification
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {user.verified ? "Verified badge active" : "Not verified"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Profile URL
                    </div>
                    <div className="mt-1 text-sm font-semibold break-all">
                      /profile/{user.userSlug}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                <div className="text-s font-bold">Help</div>

                <div className="mt-4 space-y-3">
                  <LoadingLink
                    href="/contact"
                    className="block rounded-xl border border-zinc-200 p-4 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] active:opacity-80 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                  >
                    Contact Support
                  </LoadingLink>

                  <LoadingLink
                    href="/privacy"
                    className="block rounded-xl border border-zinc-200 p-4 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] active:opacity-80 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                  >
                    Privacy Policy
                  </LoadingLink>

                  <LoadingLink
                    href="/terms"
                    className="block rounded-xl border border-zinc-200 p-4 text-sm font-semibold transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] active:opacity-80 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                  >
                    Terms of Service
                  </LoadingLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}