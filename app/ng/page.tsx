import LogoHeader from "@/components/LogoHeader";
import TopRow from "@/components/TopRow";
import LocationDirectory from "@/components/LocationDirectory";
import SeoSection from "@/components/SeoSection";

type SearchParams = {
  state?: string;
};

type Props = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

export default async function NgHome({ searchParams }: Props) {
  // searchParams can be undefined in Next 16, so guard it
  const sp =
    searchParams && "then" in (searchParams as any)
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  return (
    <main className="min-h-screen">
      <section className="hero-pattern">
        <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-6">
          <LogoHeader />
          <TopRow />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10">
        <LocationDirectory initialOpenStateSlug={sp?.state} />
        <SeoSection />
      </section>
    </main>
  );
}