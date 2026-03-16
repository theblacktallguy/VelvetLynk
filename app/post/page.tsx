import CityHeader from "@/components/CityHeader";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostWizard from "./post-wizard";

export default async function PostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/post");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          bio: true,
          state: true,
          city: true,
          photoUrls: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          instagram: true,
          website: true,
        },
      },
      wallet: { select: { credits: true } },
    },
  });

  if (!user) redirect("/login?callbackUrl=/post");

  const profile = user.profile;
  const photoCount = (profile?.photoUrls ?? []).filter(Boolean).length;

  const hasAnyContact = Boolean(
    profile?.phone ||
      profile?.email ||
      profile?.whatsapp ||
      profile?.snapchat ||
      profile?.instagram ||
      profile?.website ||
      user.email
  );

  const gating = {
    bioOk: Boolean(profile?.bio?.trim() && profile.bio.trim().length <= 150),
    photosOk: photoCount >= 3 && photoCount <= 5,
    contactOk: hasAnyContact,
    locationOk: Boolean(profile?.state?.trim() && profile?.city?.trim()),
  };

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/ng" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40">
          <PostWizard
            gating={gating}
            walletCredits={user.wallet?.credits ?? 0}
            profilePrefill={{
              phone: profile?.phone ?? "",
              email: (profile?.email ?? user.email ?? "") ?? "",
              whatsapp: profile?.whatsapp ?? "",
              snapchat: profile?.snapchat ?? "",
              state: profile?.state ?? "",
              city: profile?.city ?? "",
            }}
          />
        </div>
      </section>
    </main>
  );
}