import "server-only";
import { redirect } from "next/navigation";
import { requireProfile } from "./auth";
import { createClient } from "./supabase/server";
import { slugify } from "./utils";
import type { Profile, Studio } from "./types";

/** The signed-in user's studio, or null. */
export async function getStudio(): Promise<{ profile: Profile; studio: Studio | null }> {
  const profile = await requireProfile("/dashboard");
  const supabase = await createClient();
  const { data } = await supabase.from("studios").select("*").eq("owner_id", profile.id).maybeSingle();
  return { profile, studio: (data as Studio) ?? null };
}

/**
 * Use in every dashboard page and action. Customers are sent to their account;
 * designers without a studio row (e.g. created before the trigger) get one.
 */
export async function requireStudio(): Promise<{ profile: Profile; studio: Studio }> {
  const { profile, studio } = await getStudio();
  if (studio) return { profile, studio };
  if (profile.role !== "designer" && profile.role !== "admin") redirect("/for-designers?upgrade=1");

  const supabase = await createClient();
  const name = profile.full_name ? `${profile.full_name}'s Studio` : "My Studio";
  const { data, error } = await supabase
    .from("studios")
    .insert({
      owner_id: profile.id,
      name,
      slug: `${slugify(name)}-${profile.id.slice(0, 5)}`,
      email: profile.email,
      phone: profile.phone,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(`Could not create studio: ${error?.message}`);
  return { profile, studio: data as Studio };
}
