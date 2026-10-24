import { Star } from "lucide-react";

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
      <Star className="h-4 w-4 fill-saffron text-saffron" />
      {Number(rating).toFixed(1)}
      {count !== undefined && <span className="font-normal text-ink-500">({count})</span>}
    </span>
  );
}
