import "server-only";
import demo from "./demo-data.json";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import type { Studio, StudioWithDetails } from "./types";

const PLAN_RANK: Record<string, number> = { priority: 2, premium: 1, free: 0 };

type DemoStudio = (typeof demo)[number];

function fromDemo(d: DemoStudio, i: number): StudioWithDetails {
  return {
    id: `demo-${i}`,
    owner_id: null,
    slug: d.slug,
    name: d.name,
    kind: d.kind,
    tagline: d.tagline,
    bio: d.bio,
    area: d.area,
    city: "Delhi",
    address: d.address,
    lat: d.lat,
    lng: d.lng,
    phone: d.phone,
    email: d.email,
    instagram: d.instagram,
    categories: d.categories,
    starting_price: d.starting_price,
    home_visits: d.home_visits,
    studio_visits: d.studio_visits,
    cover_url: d.cover_url,
    photos: d.photos,
    rating: d.rating,
    review_count: d.review_count,
    status: "verified",
    plan: d.plan as Studio["plan"],
    snip_code: d.snip_code,
    services: d.services.map((s, j) => ({ id: `demo-${i}-s${j}`, ...s })),
    reviews: d.reviews.map((r, j) => ({
      id: `demo-${i}-r${j}`,
      ...r,
      created_at: new Date(Date.UTC(2026, 8, 1 + j * 5)).toISOString(),
    })),
  };
}

export const demoStudios: StudioWithDetails[] = demo.map(fromDemo);

/** Featured plans first, then rating. */
export function rankStudios<T extends Studio>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      (PLAN_RANK[b.plan] ?? 0) - (PLAN_RANK[a.plan] ?? 0) ||
      Number(b.rating) - Number(a.rating) ||
      b.review_count - a.review_count,
  );
}

/** All verified studios (public). */
export async function getStudios(): Promise<Studio[]> {
  if (!isSupabaseConfigured) return rankStudios(demoStudios);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("status", "verified")
    .limit(500);
  if (error) {
    console.error("getStudios", error.message);
    return [];
  }
  return rankStudios((data ?? []) as Studio[]);
}

export async function getStudioBySlug(slug: string): Promise<StudioWithDetails | null> {
  if (!isSupabaseConfigured) return demoStudios.find((s) => s.slug === slug) ?? null;
  const supabase = await createClient();
  const { data: studio } = await supabase.from("studios").select("*").eq("slug", slug).maybeSingle();
  if (!studio) return null;
  const [{ data: services }, { data: reviews }] = await Promise.all([
    supabase.from("services").select("*").eq("studio_id", studio.id).order("sort").order("created_at"),
    supabase
      .from("reviews")
      .select("id, author_name, rating, comment, created_at")
      .eq("studio_id", studio.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return { ...(studio as Studio), services: services ?? [], reviews: reviews ?? [] };
}

export async function getFeaturedStudios(n = 3): Promise<Studio[]> {
  const all = await getStudios();
  return all.slice(0, n);
}
