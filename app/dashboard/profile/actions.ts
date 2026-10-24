"use server";
import { revalidatePath } from "next/cache";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, slugify } from "@/lib/utils";

export type ProfileState = { ok?: boolean; error?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;

export async function saveStudio(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const { studio } = await requireStudio();
  const name = str(form, "name");
  if (!name) return { error: "Studio name is required." };
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const photos = String(form.get("photos") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const categories = form.getAll("categories").map(String).filter((c) => (CATEGORIES as readonly string[]).includes(c));
  const wantedSlug = slugify(str(form, "slug") ?? name) || studio.slug;

  const supabase = await createClient();
  if (wantedSlug !== studio.slug) {
    const { data: taken } = await supabase.from("studios").select("id").eq("slug", wantedSlug).neq("id", studio.id).maybeSingle();
    if (taken) return { error: `The link snip/${wantedSlug} is taken. Try another.` };
  }

  const { error } = await supabase
    .from("studios")
    .update({
      name,
      slug: wantedSlug,
      kind: str(form, "kind") ?? "Tailor",
      tagline: str(form, "tagline"),
      bio: str(form, "bio"),
      area: str(form, "area"),
      address: str(form, "address"),
      phone: str(form, "phone"),
      email: str(form, "email"),
      instagram: str(form, "instagram")?.replace(/^@/, "") ?? null,
      categories,
      starting_price: Math.max(0, Math.round(Number(form.get("starting_price") ?? 0) || 0)),
      home_visits: form.get("home_visits") === "on",
      studio_visits: form.get("studio_visits") === "on",
      lat: Number.isFinite(lat) && form.get("lat") !== "" ? lat : null,
      lng: Number.isFinite(lng) && form.get("lng") !== "" ? lng : null,
      photos,
      cover_url: photos[0] ?? null,
    })
    .eq("id", studio.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/designers/${wantedSlug}`);
  revalidatePath("/discover");
  return { ok: true };
}

export async function addService(form: FormData) {
  const { studio } = await requireStudio();
  const name = str(form, "name");
  if (!name) return;
  const supabase = await createClient();
  const { count } = await supabase.from("services").select("id", { count: "exact", head: true }).eq("studio_id", studio.id);
  await supabase.from("services").insert({
    studio_id: studio.id,
    name,
    description: str(form, "description"),
    price: Math.max(0, Math.round(Number(form.get("price") ?? 0) || 0)),
    duration_mins: Math.max(10, Math.round(Number(form.get("duration_mins") ?? 45) || 45)),
    sort: count ?? 0,
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/designers/${studio.slug}`);
}

export async function deleteService(form: FormData) {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", String(form.get("id"))).eq("studio_id", studio.id);
  revalidatePath("/dashboard/profile");
  revalidatePath(`/designers/${studio.slug}`);
}
