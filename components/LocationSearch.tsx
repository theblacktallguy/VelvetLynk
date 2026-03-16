"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function LocationSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { stateMatches, cityMatches } = useMemo(() => {
    const map = locations as LocationsMap;
    const query = q.trim().toLowerCase();

    if (!query) {
      return {
        stateMatches: [] as string[],
        cityMatches: [] as { state: string; city: string }[],
      };
    }

    const states = Object.keys(map);

    const stateMatches = states
      .filter((s) => s.toLowerCase().includes(query))
      .slice(0, 8);

    const cityMatches: { state: string; city: string }[] = [];
    for (const state of states) {
      for (const city of map[state] || []) {
        if (city.toLowerCase().includes(query)) {
          cityMatches.push({ state, city });
          if (cityMatches.length >= 10) break;
        }
      }
      if (cityMatches.length >= 10) break;
    }

    return { stateMatches, cityMatches };
  }, [q]);

  const showDropdown = stateMatches.length > 0 || cityMatches.length > 0;

  // ✅ State click from search: go to homepage and open that state's dropdown
  function goState(state: string) {
    const stateSlug = slugify(state);
    router.push(`/ng?state=${stateSlug}`);
    setQ("");
  }

  // ✅ City click from search: go to city directory page
  function goCity(state: string, city: string) {
    router.push(`/ng/${slugify(state)}/${slugify(city)}`);
    setQ("");
  }

  return (
    <div className="relative w-full sm:max-w-md">
      <div className="card px-3 py-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search location"
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
      </div>

      {showDropdown && (
        <div className="card absolute left-0 right-0 z-50 mt-2 overflow-hidden">
          {stateMatches.length > 0 && (
            <div className="border-b px-3 py-2">
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                States
              </div>

              <div className="mt-2 flex flex-col">
                {stateMatches.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => goState(state)}
                    className="rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-[rgba(212,175,55,0.14)]"
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cityMatches.length > 0 && (
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Cities
              </div>

              <div className="mt-2 flex flex-col">
                {cityMatches.map(({ state, city }) => (
                  <button
                    key={`${state}-${city}`}
                    type="button"
                    onClick={() => goCity(state, city)}
                    className="rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-[rgba(212,175,55,0.14)]"
                  >
                    <span className="font-medium">{city}</span>
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {state}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}