import type { Metadata } from "next";
import { getStudios } from "@/lib/data";
import { DiscoverClient } from "./DiscoverClient";

export const metadata: Metadata = { title: "Find a designer in Delhi" };
export const revalidate = 60;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const [{ q, category }, studios] = await Promise.all([searchParams, getStudios()]);
  return (
    <div className="container py-10">
      <p className="eyebrow">Discover</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Tailors, boutiques &amp; designers in Delhi</h1>
      <p className="mt-3 text-ink-600">Every studio here is verified by Snip. Featured studios appear first.</p>
      <DiscoverClient studios={studios} initialQuery={q ?? ""} initialCategory={category ?? ""} />
    </div>
  );
}
