// app/account/page.tsx
import CityHeader from "@/components/CityHeader";
import WelcomeBanner from "@/components/account/WelcomeBanner";
import AccountHero from "@/components/account/AccountHero";
import ProfileCompletionCard from "@/components/account/ProfileCompletionCard";
import AccountBioCard from "@/components/account/AccountBioCard";
import AdsManager from "@/components/account/AdsManager";
import VerificationCard from "@/components/account/VerificationCard";
import WalletCard from "@/components/account/WalletCard";
import SettingsSecurityCard from "@/components/account/SettingsSecurityCard";
import SupportCard from "@/components/account/SupportCard";
import AccountContactCard from "@/components/account/AccountContactCard";
import { AdStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = { welcome?: string };

type CompletionInput = {
  bio?: string | null;
  photoCount: number;
  hasAnyContact: boolean;
  city?: string | null;
  state?: string | null;
  verified: boolean;
};

function computeCompletion(input: CompletionInput) {
  const items = [
    { label: "Add bio (max 150)", done: Boolean(input.bio?.trim()) },
    { label: "Upload 3+ photos", done: input.photoCount >= 3 },
    { label: "Add contact info", done: input.hasAnyContact },
    {
      label: "Set location",
      done: Boolean(input.city?.trim() && input.state?.trim()),
    },
    { label: "Get verified", done: input.verified },
  ];

  const percent = Math.round(
    (items.filter((i) => i.done).length / items.length) * 100
  );

  return { percent, items };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await getServerSession(authOptions);

  // Protect route
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  // Next 16: searchParams can be Promise
  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const showWelcome = sp?.welcome === "1";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      userSlug: true,
      verified: true,
      name: true,
      email: true,
      profile: {
        select: {
          bio: true,
          phone: true,
          email: true,
          whatsapp: true,
          snapchat: true,
          instagram: true,
          website: true,
          avatarUrl: true,
          photoUrls: true,
          city: true,
          state: true,
        },
      },
      wallet: { select: { credits: true } },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  const userSlug = user.userSlug;
  const verified = Boolean(user.verified);

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    (user.email && adminEmails.includes(user.email.toLowerCase())) ||
    user.userSlug === "admin";

  // ✅ Real DB values (with safe fallbacks)
  const avatarSrc = user.profile?.avatarUrl || "/assets/avatar.jpg";
    const photos = (user.profile?.photoUrls || [])
    .filter((url) => Boolean(url) && url !== user.profile?.avatarUrl)
    .slice(0, 4);
  const bio = user.profile?.bio || "";
  const credits = user.wallet?.credits ?? 0;

  const contact = {
    phone: user.profile?.phone || undefined,
    email: user.profile?.email || user.email || undefined,
    whatsapp: user.profile?.whatsapp || undefined,
    snapchat: user.profile?.snapchat || undefined,
    instagram: user.profile?.instagram || undefined,
    website: user.profile?.website || undefined,
  };

  const hasAnyContact = Boolean(
    contact.phone ||
      contact.email ||
      contact.whatsapp ||
      contact.snapchat ||
      contact.instagram ||
      contact.website
  );

  const { percent, items } = computeCompletion({
    bio: user.profile?.bio,
    photoCount: photos.length,
    hasAnyContact,
    city: user.profile?.city,
    state: user.profile?.state,
    verified,
  });

  type DisplayAdStatus = "ACTIVE" | "EXPIRED";

  type AdSummary = {
    id: string;
    title: string;
    status: DisplayAdStatus;
    postedAt: string;
  };

  const now = new Date();

  const rawAds = await prisma.ad.findMany({
    where: {
      ownerId: user.id,
      status: {
        in: [AdStatus.ACTIVE, AdStatus.EXPIRED],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  const getDisplayStatus = (ad: {
    status: AdStatus;
    expiresAt: Date | null;
  }): DisplayAdStatus => {
    if (ad.status === AdStatus.EXPIRED) return "EXPIRED";
    if (ad.expiresAt && ad.expiresAt <= now) return "EXPIRED";
    return "ACTIVE";
  };

  const activeCount = rawAds.filter(
    (ad) => getDisplayStatus(ad) === "ACTIVE"
  ).length;

  const expiredCount = rawAds.filter(
    (ad) => getDisplayStatus(ad) === "EXPIRED"
  ).length;

  const recentAds: AdSummary[] = rawAds.slice(0, 5).map((ad) => ({
    id: ad.id,
    title: ad.title,
    status: getDisplayStatus(ad),
    postedAt: ad.createdAt.toISOString(),
  }));

  return (
    <main className="relative isolate min-h-screen flex flex-col overflow-x-hidden">
      {/* Welcome toast (only when welcome=1) */}
      <WelcomeBanner fullName={user.name ?? ""} show={showWelcome} />

      {/* Header */}
      <section className="hero-pattern relative z-50 overflow-visible">
        <div className="relative z-50 mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader fallbackHref="/ng" />
        </div>
      </section>

      {/* Content */}
      <section className="relative z-0 mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-10">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-6">
          <div className="min-w-0">
            <AccountHero
              userSlug={userSlug}
              verified={verified}
              avatarSrc={avatarSrc}
              photos={photos}
            />
          </div>

          <div className="grid w-full max-w-full min-w-0 gap-6 lg:grid-cols-3">
            {/* Left */}

            {isAdmin ? (
                <div className="card p-5 bg-white/80 dark:bg-zinc-900/40">
                  <div className="text-s font-semibold ">
                    Admin Dashboard
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-400">
                    Review verification requests, monitor platform activity, and manage core admin actions.
                  </p>
                  <a
                    href="/admin"
                    className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-semibold gold-border hover:bg-[rgba(212,175,55,0.10)]"
                  >
                    Open Admin Page
                  </a>
                </div>
              ) : null}

            <div className="min-w-0 space-y-6 lg:col-span-2">
              <ProfileCompletionCard
                percent={percent}
                items={items}
                ctaHref="/account/profile/edit"
                ctaLabel={percent === 100 ? "Edit profile" : "Complete profile"}
              />

              <AccountBioCard bio={bio} />

              <WalletCard balance={credits} />

              <AccountContactCard contact={contact} />

              <AdsManager
                activeCount={activeCount}
                expiredCount={expiredCount}
                recent={recentAds}
              />
            </div>

            {/* Right */}
            <div className="min-w-0 space-y-6">
              

              <VerificationCard verified={verified} />
              <SettingsSecurityCard />
              <SupportCard />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}