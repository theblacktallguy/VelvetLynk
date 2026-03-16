import CityHeader from "@/components/CityHeader";
import SupportChat from "./SupportChat";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col ">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 bg-white/80 dark:bg-zinc-900/40 lg:col-span-1 space-y-4">
            <h1 className="text-2xl font-semibold ">
              Contact & Support
            </h1>
            <p className="text-sm ">
              Use the assistant to get help across the app (account, profile, ads, safety). If you need a human,
              you can request it and we’ll create a support ticket.
            </p>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="text-sm font-semibold ">Common topics</div>
              <ul className="mt-2 list-disc pl-5 text-sm  space-y-1">
                <li>Account login issues</li>
                <li>Profile edits and photos</li>
                <li>Posting and managing ads</li>
                <li>Reporting unsafe content</li>
                <li>Privacy and data requests</li>
              </ul>
            </div>

            <p className="text-xs ">
              Note: Human support email/ticket delivery will be connected to your company email later. For now,
              tickets are recorded as a placeholder step.
            </p>
          </div>

          <div className="lg:col-span-2">
            <SupportChat />
          </div>
        </div>
      </section>
    </main>
  );
}