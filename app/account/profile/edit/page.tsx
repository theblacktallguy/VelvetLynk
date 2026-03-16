import CityHeader from "@/components/CityHeader";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditProfileForm from "./ui/EditProfileForm";

type SearchParams = { error?: string };

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/profile/edit");

  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      userSlug: true,
      email: true,
      emailVerified: true,
      profile: {
        select: {
          bio: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          instagram: true,
          website: true,
          city: true,
          state: true,
          avatarUrl: true,
          photoUrls: true,
        },
      },
    },
  });

  if (!user) redirect("/login?callbackUrl=/account/profile/edit");

  const initial = {
    userSlug: user.userSlug,
    accountEmail: user.email ?? "",
    accountEmailVerified: Boolean(user.emailVerified),

    bio: user.profile?.bio ?? "",
    phone: user.profile?.phone ?? "",
    email: user.profile?.email ?? user.email ?? "",
    whatsapp: user.profile?.whatsapp ?? "",
    snapchat: user.profile?.snapchat ?? "",
    instagram: user.profile?.instagram ?? "",
    website: user.profile?.website ?? "",
    city: user.profile?.city ?? "",
    state: user.profile?.state ?? "",
    avatarUrl: user.profile?.avatarUrl ?? "",
       photoUrls: (user.profile?.photoUrls ?? []).filter(
      (url) => url && url !== (user.profile?.avatarUrl ?? "")
    ),
  };

  return (
    <main className="min-h-screen flex flex-col ">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/account" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              Edit Profile
            </h1>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
              Upload photos, update your bio, and manage contact details. Bio max is 150 characters.
            </p>

            {sp?.error ? (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-600/40 dark:bg-amber-500/10 dark:text-amber-200">
                {sp.error === "username_taken"
                  ? "That username is already taken."
                  : sp.error === "bad_username"
                  ? "That username is not allowed. Use 3–30 chars, letters/numbers/hyphens."
                  : "Something went wrong. Please try again."}
              </div>
            ) : null}
          </div>

          <EditProfileForm initial={initial} />
        </div>
      </section>
    </main>
  );
}