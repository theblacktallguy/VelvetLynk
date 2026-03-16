import CityHeader from "@/components/CityHeader";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col ">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-8 py-3">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold ">
              Privacy Policy
            </h1>
            <p className="text-sm ">
              This policy explains what we collect, how we use it, and how we protect it.
              We aim to be transparent and practical.
            </p>
          </header>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">
              Information we collect
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>
                <span className="font-semibold">Account data:</span> email, username, and authentication-related metadata.
              </li>
              <li>
                <span className="font-semibold">Profile content:</span> bio, photos, and contact fields you choose to provide.
              </li>
              <li>
                <span className="font-semibold">Listings/ads:</span> content you post and related activity (status, timestamps).
              </li>
              <li>
                <span className="font-semibold">Usage & security logs:</span> basic logs used to prevent abuse, debug issues,
                and enforce policies.
              </li>
            </ul>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">
              How we use your information
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>Provide and maintain the platform (profiles, listings, account access).</li>
              <li>Prevent fraud, spam, harassment, and policy violations.</li>
              <li>Respond to support requests and reports.</li>
              <li>Improve performance, reliability, and user experience.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-bold ">
              Photos and media
            </h2>
            <p className="text-sm ">
              If you upload photos, they are stored with a media provider and referenced by secure URLs in our database.
              Your photos are displayed based on your profile settings and may appear on your public profile.
            </p>
            <p className="text-xs ">
              You control what you upload. Avoid uploading sensitive personal documents.
            </p>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">
              Sharing and disclosure
            </h2>
            <p className="text-sm ">
              We do not sell your personal data. We may share data only in limited circumstances:
            </p>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>With service providers needed to operate the platform (hosting, storage, monitoring).</li>
              <li>To investigate abuse, enforce policies, or protect users.</li>
              <li>When required to comply with law or lawful requests.</li>
            </ul>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">
              Security practices
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>We use authentication controls and access restrictions.</li>
              <li>We monitor for abuse patterns and suspicious activity.</li>
              <li>We limit access to production systems to authorized personnel.</li>
            </ul>
            <p className="text-xs ">
              No system is perfectly secure. If you believe your account is compromised, contact support immediately.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-bold ">
              Your choices
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>Edit your profile information at any time.</li>
              <li>Remove photos or change what appears publicly.</li>
              <li>Contact support for questions or data requests.</li>
            </ul>
          </section>

          <section className="space-y-2 py-3">
            <h2 className="text-lg font-bold ">
              Updates to this policy
            </h2>
            <p className="text-sm ">
              We may update this policy as features evolve (verification, messaging, payments).
              We will post updates here.
            </p>
            <p className="text-xs ">
              This is a solid production baseline, but you should still have legal counsel review before launch.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}