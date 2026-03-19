import CityHeader from "@/components/CityHeader";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col ">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold ">
              Terms of Service
            </h1>
            <p className="text-sm ">
              These terms govern your use of VelvetLynk. By using the platform, you agree to comply with these terms and applicable laws.
            </p>
          </header>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">Eligibility</h2>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>You must be an adult and legally permitted to use the service in your jurisdiction.</li>
              <li>You are responsible for ensuring your use complies with local laws and regulations.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-bold ">User content</h2>
            <p className="text-sm ">
              You are responsible for the content you post (profiles, photos, listings). You agree not to post content that is:
            </p>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>Fraudulent, misleading, or impersonating someone else</li>
              <li>Harassing, threatening, hateful, or abusive</li>
              <li>Non-consensual, exploitative, or invasive of privacy</li>
              <li>Illegal or promoting illegal activity</li>
              <li>Malware, phishing links, or scams</li>
            </ul>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">Safety and reporting</h2>
            <p className="text-sm ">
              We provide reporting tools and may review content or accounts to enforce policies and protect users.
              If you see suspicious behavior, report it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/safety"
                className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
              >
                Safety Center
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
              >
                Contact Support
              </Link>
            </div>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">Enforcement</h2>
            <p className="text-sm ">
              We may remove content, restrict features, or suspend accounts when we believe policies were violated,
              users are at risk, or to comply with legal obligations. Enforcement decisions may be automated or manual.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-semibold ">Disclaimers</h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>The service is provided “as is” without warranties.</li>
              <li>We do not guarantee the accuracy of user-generated content.</li>
              <li>We are not responsible for offline interactions between users.</li>
            </ul>
          </section>

          <section className="space-y-2 py-3">
            <h2 className="text-lg font-bold ">Privacy</h2>
            <p className="text-sm ">
              Our data practices are described in the Privacy Policy.
            </p>
            <Link
              href="/privacy"
              className="text-sm underline "
            >
              Read Privacy Policy
            </Link>
          </section>

          <p className="text-xs ">
            Legal note: This is a strong baseline, but you should have counsel review before production launch.
          </p>
        </div>
      </section>
    </main>
  );
}