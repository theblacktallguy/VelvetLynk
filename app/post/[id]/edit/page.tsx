import CityHeader from "@/components/CityHeader";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPostWizard from "./edit-post-wizard";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/ads");
  }

  const { id } = await params;

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
      wallet: {
        select: {
          credits: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/ads");
  }

  const ad = await prisma.ad.findUnique({
    where: { id },
    select: {
      id: true,
      ownerId: true,
      status: true,
      featured: true,
      durationDays: true,
      countrySlug: true,
      stateSlug: true,
      citySlug: true,
      categorySlug: true,
      title: true,
      body: true,
      sex: true,
      age: true,
      orientation: true,
      locationText: true,
      imageUrls: true,
      phone: true,
      email: true,
      whatsapp: true,
      snapchat: true,
      createdAt: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  if (!ad) {
    notFound();
  }

  if (ad.ownerId !== session.user.id) {
    redirect("/account/ads");
  }

  if (ad.status === "REMOVED") {
    redirect("/account/ads");
  }

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
          <CityHeader fallbackHref="/account/ads" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40">
          <EditPostWizard
            ad={{
              id: ad.id,
              status: ad.status,
              featured: ad.featured,
              durationDays: ad.durationDays,
              stateSlug: ad.stateSlug,
              citySlug: ad.citySlug,
              categorySlug: ad.categorySlug,
              title: ad.title,
              body: ad.body,
              sex: ad.sex ?? "",
              age: ad.age ? String(ad.age) : "",
              orientation: ad.orientation ?? "",
              locationText: ad.locationText ?? "",
              imageUrls: ad.imageUrls ?? [],
              phone: ad.phone ?? "",
              email: ad.email ?? "",
              whatsapp: ad.whatsapp ?? "",
              snapchat: ad.snapchat ?? "",
              expiresAt: ad.expiresAt ? ad.expiresAt.toISOString() : null,
              publishedAt: ad.publishedAt ? ad.publishedAt.toISOString() : null,
            }}
            gating={gating}
            walletCredits={user.wallet?.credits ?? 0}
          />
        </div>
      </section>
    </main>
  );
}