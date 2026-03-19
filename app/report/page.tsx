import CityHeader from "@/components/CityHeader";
import ReportForm from "./report-form";

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP | undefined, key: string) {
  const v = sp?.[key];
  if (!v) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<SP> | SP;
}) {
  const sp: SP | undefined =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<SP>)
      : (searchParams as SP | undefined);

  const adId = pick(sp, "adId") || pick(sp, "id");

  return (
    <main className="min-h-screen flex flex-col">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-6">
          <CityHeader />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 flex-1">
        <div
          className="card p-6 bg-white/80 dark:bg-zinc-900/40 space-y-6"
          style={{ backgroundColor: "rgba(212,175,55,0.10)" }}
        >
          <div>
            <h1 className="text-2xl font-semibold">Report Ad</h1>
            <p className="mt-1 text-sm">
              Help us keep VelvetLynk safer. Reports are reviewed for policy violations.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm font-semibold">Ad ID</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 break-all">
              {adId || "Missing adId. Go back and open the report link from the ad."}
            </div>
          </div>

          <ReportForm adId={adId} />
        </div>
      </section>
    </main>
  );
}