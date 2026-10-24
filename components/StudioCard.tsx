import Link from "next/link";
import { Home, MapPin, Sparkles } from "lucide-react";
import type { Studio } from "@/lib/types";
import { inr } from "@/lib/utils";
import { Stars } from "./Stars";
import { StudioCover } from "./StudioCover";

export function StudioCard({ studio, distance }: { studio: Studio; distance?: number | null }) {
  return (
    <Link
      href={`/designers/${studio.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-100">
        <StudioCover name={studio.name} url={studio.cover_url} className="transition duration-500 group-hover:scale-105" />
        {studio.plan !== "free" && (
          <span className="badge absolute left-3 top-3 bg-maroon text-ivory">
            <Sparkles className="mr-1 h-3 w-3" /> Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg leading-tight">{studio.name}</h3>
            <p className="text-sm text-ink-500">{studio.kind}</p>
          </div>
          <Stars rating={studio.rating} />
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
          <MapPin className="h-3.5 w-3.5" /> {studio.area ?? studio.city}
          {distance != null && <span>· {distance.toFixed(1)} km</span>}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-500">Starts at</p>
            <p className="font-bold">{inr(studio.starting_price)}</p>
          </div>
          {studio.home_visits && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-jade">
              <Home className="h-3.5 w-3.5" /> Home visits
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
