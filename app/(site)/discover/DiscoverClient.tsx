"use client";
import { useMemo, useState } from "react";
import { Home, LocateFixed, Map as MapIcon, Search, Store } from "lucide-react";
import { StudioCard } from "@/components/StudioCard";
import { StudioMap, type MapPoint } from "@/components/StudioMap";
import type { Studio } from "@/lib/types";
import { CATEGORIES, cn, distanceKm } from "@/lib/utils";

type Sort = "recommended" | "distance" | "price" | "rating";

export function DiscoverClient({
  studios,
  initialQuery,
  initialCategory,
}: {
  studios: Studio[];
  initialQuery: string;
  initialCategory: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [homeOnly, setHomeOnly] = useState(false);
  const [studioOnly, setStudioOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>("recommended");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  function nearMe() {
    if (!navigator.geolocation) {
      setLocError("Your browser doesn't support location.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMe({ lat: p.coords.latitude, lng: p.coords.longitude });
        setSort("distance");
        setLocating(false);
      },
      () => {
        setLocError("Location permission was denied. Showing all of Delhi.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = studios
      .filter((s) => {
        if (category && !s.categories.includes(category)) return false;
        if (homeOnly && !s.home_visits) return false;
        if (studioOnly && !s.studio_visits) return false;
        if (maxPrice && s.starting_price > maxPrice) return false;
        if (!needle) return true;
        const hay = [s.name, s.kind, s.area, s.tagline, s.bio, ...s.categories].join(" ").toLowerCase();
        return needle.split(/\s+/).every((w) => hay.includes(w));
      })
      .map((s) => ({
        studio: s,
        distance: me && s.lat != null && s.lng != null ? distanceKm(me, { lat: s.lat, lng: s.lng }) : null,
      }));

    if (sort === "distance") list = list.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    if (sort === "price") list = list.sort((a, b) => a.studio.starting_price - b.studio.starting_price);
    if (sort === "rating") list = list.sort((a, b) => Number(b.studio.rating) - Number(a.studio.rating));
    return list;
  }, [studios, q, category, homeOnly, studioOnly, maxPrice, sort, me]);

  const points: MapPoint[] = results
    .filter((r) => r.studio.lat != null && r.studio.lng != null)
    .map(({ studio: s }) => ({
      slug: s.slug,
      name: s.name,
      lat: s.lat!,
      lng: s.lng!,
      kind: s.kind,
      starting_price: s.starting_price,
      featured: s.plan !== "free",
    }));

  return (
    <div className="mt-8">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input pl-10"
              placeholder="Blouse alteration, sherwani, Saket…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={nearMe} className="btn-secondary" disabled={locating}>
              <LocateFixed className="h-4 w-4" /> {locating ? "Locating…" : me ? "Near me ✓" : "Near me"}
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input w-auto">
              <option value="recommended">Recommended</option>
              <option value="distance" disabled={!me}>Nearest first</option>
              <option value="rating">Top rated</option>
              <option value="price">Lowest price</option>
            </select>
            <select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="input w-auto">
              <option value={0}>Any price</option>
              <option value={500}>From ≤ ₹500</option>
              <option value={1000}>From ≤ ₹1,000</option>
              <option value={2000}>From ≤ ₹2,000</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setCategory("")} className={cn("chip", !category && "chip-active")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c === category ? "" : c)} className={cn("chip", c === category && "chip-active")}>
              {c}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-ink/10 sm:block" />
          <button onClick={() => setHomeOnly(!homeOnly)} className={cn("chip", homeOnly && "chip-active")}>
            <Home className="h-3.5 w-3.5" /> Home visits
          </button>
          <button onClick={() => setStudioOnly(!studioOnly)} className={cn("chip", studioOnly && "chip-active")}>
            <Store className="h-3.5 w-3.5" /> Studio visits
          </button>
          <button onClick={() => setShowMap(!showMap)} className="chip ml-auto">
            <MapIcon className="h-3.5 w-3.5" /> {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
        {locError && <p className="mt-3 text-xs text-maroon">{locError}</p>}
      </div>

      {showMap && (
        <div className="mt-6 overflow-hidden rounded-[20px] border border-ink/10 shadow-card">
          <StudioMap points={points} me={me} />
        </div>
      )}

      <p className="mt-6 text-sm text-ink-500">
        {results.length} {results.length === 1 ? "studio" : "studios"}
        {category && ` for ${category}`}
      </p>
      {results.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ studio, distance }) => (
            <StudioCard key={studio.slug} studio={studio} distance={distance} />
          ))}
        </div>
      ) : (
        <div className="card mt-4 p-10 text-center text-ink-500">
          No studios match those filters yet. Try clearing a filter.
        </div>
      )}
    </div>
  );
}
