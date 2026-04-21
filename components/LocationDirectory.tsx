"use client";

import LoadingLink from "@/components/navigation/LoadingLink";
import { useEffect, useMemo, useRef } from "react";
import locations from "@/data/nigeria-locations.json";

type LocationsMap = Record<string, string[]>;

function slugify(input: string) {
  return input
    .trim()
    .replace(/,+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[\/]+/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s/g, "-")
    .replace(/-+/g, "-");
}

export default function LocationDirectory({
  initialOpenStateSlug,
}: {
  initialOpenStateSlug?: string;
}) {
  const map = locations as LocationsMap;

  const states = useMemo(
    () => Object.keys(map).sort((a, b) => a.localeCompare(b)),
    [map]
  );

  // Keep refs to each <details> so we can open it programmatically
  const detailRefs = useRef<Record<string, HTMLDetailsElement | null>>({});

  useEffect(() => {
    if (!initialOpenStateSlug) return;

    // Find the human-readable state name that matches this slug
    const matchState = states.find((s) => slugify(s) === initialOpenStateSlug);
    if (!matchState) return;

    const el = detailRefs.current[matchState];
    if (!el) return;

    // Open it
    el.open = true;

    // Scroll to it (nice UX)
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialOpenStateSlug, states]);

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Choose a location</h2>

      <div className="card overflow-hidden">
        <div className="divide-y">
          {states.map((state) => {
            const cities = Array.from(new Set(map[state] || []));

            return (
              <details
                key={state}
                ref={(node) => {
                  detailRefs.current[state] = node;
                }}
                className="group"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-[rgba(212,175,55,0.12)] dark:hover:bg-[rgba(212,175,55,0.14)]">
                  <span className="font-medium">{state}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cities.length} cities
                  </span>
                </summary>

                <div className="px-4 pb-4">
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <LoadingLink
                        key={`${state}-${city}`}
                        href={`/ng/${slugify(state)}/${slugify(city)}`}
                        className="rounded-lg border px-3 py-1.5 text-sm transition-all duration-200 hover:bg-[rgba(212,175,55,0.12)] active:scale-[0.98] active:opacity-80 dark:hover:bg-[rgba(212,175,55,0.14)]"
                      >
                        {city}
                      </LoadingLink>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}