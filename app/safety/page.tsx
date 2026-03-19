import CityHeader from "@/components/CityHeader";
import Link from "next/link";

export default function SafetyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-8">
          <header className="space-y-2 py-4">
            <h1 className="text-3xl font-bold ">
              Safety Center
            </h1>
            <p className="text-sm ">
              Safety is a core part of VelvetLynk. This page explains practical steps to protect yourself,
              identify suspicious behavior, and report issues quickly.
            </p>
          </header>

          <section className="space-y-3 ">
            <h2 className="text-lg font-bold ">
              Before you engage
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>
                <span className="font-semibold">Trust your instincts:</span> if something feels off, pause and reassess.
              </li>
              <li>
                <span className="font-semibold">Verify basics:</span> ask for consistent details and watch for contradictions.
              </li>
              <li>
                <span className="font-semibold">Protect your identity:</span> avoid sharing passwords, one-time codes, bank info,
                or sensitive documents.
              </li>
              <li>
                <span className="font-semibold">Keep conversations respectful:</span> harassment, coercion, or threats should be reported immediately.
              </li>
            </ul>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-bold ">
              Meeting in person (best practices)
            </h2>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>Meet in a public place first when possible.</li>
              <li>Tell a friend where you’re going and share your location.</li>
              <li>Arrange your own transportation.</li>
              <li>Keep personal belongings secure and stay aware of your surroundings.</li>
              <li>If you feel unsafe, leave immediately.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-semibold ">
              How to identify suspicious behavior
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-m font-bold ">Common red flags</div>
                <ul className="list-disc pl-5 text-sm  space-y-1">
                  <li>Pressure to move fast or bypass normal conversation</li>
                  <li>Requests for money, gift cards, crypto, or “fees”</li>
                  <li>Requests for one-time codes or account access</li>
                  <li>Inconsistent details, copied text, or suspicious photos</li>
                  <li>Threats, blackmail, coercion, or intimidation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold ">If you’re unsure</div>
                <p className="text-sm ">
                  Don’t feel obligated to continue. You can stop contact, report the profile/ad,
                  and contact support if you need help.
                </p>
                <p className="text-xs ">
                  We recommend documenting the issue (screenshots, usernames, ad IDs) before blocking or deleting messages.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 py-3">
            <h2 className="text-lg font-semibold ">
              Reporting suspicious behavior
            </h2>
            <p className="text-sm ">
              If you see content that violates policies or makes you feel unsafe, report it. Reports help keep the platform clean.
            </p>
            <ol className="list-decimal pl-5 text-sm  space-y-2">
              <li>Open the ad or profile page.</li>
              <li>Click the Report link/button.</li>
              <li>Describe what happened as clearly as possible.</li>
              <li>Include any relevant details (dates, usernames, ad IDs).</li>
            </ol>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
              >
                Contact Support
              </Link>
              <Link
                href="/terms"
                className="rounded-lg border px-3 py-2 text-xs font-semibold gold-border hover:bg-amber-600/60"
              >
                Review Terms
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="text-lg font-bold ">
              Resources for harassment or abuse
            </h2>
            <p className="text-sm ">
              If you are a victim of harassment, threats, or abuse:
            </p>
            <ul className="list-disc pl-5 text-sm  space-y-2">
              <li>Save evidence (screenshots, messages, timestamps).</li>
              <li>Block the user if needed and report the content to us.</li>
              <li>If there is immediate danger, contact local emergency services.</li>
              <li>If you are being blackmailed or threatened, consider contacting law enforcement.</li>
            </ul>
            <p className="text-xs ">
              We can help investigate platform activity, but we can’t replace local emergency services.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 ">
            <div className="text-s font-bold ">
              Safety reminder
            </div>
            <p className="mt-1 text-sm ">
              Always prioritize your safety. If you don’t feel comfortable, step back and report concerns.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}