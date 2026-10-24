import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Profile;
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    phone: null,
    role: "customer",
  };
}

export async function requireProfile(next = "/account"): Promise<Profile> {
  if (!isSupabaseConfigured) redirect("/login?demo=1");
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile("/admin");
  if (profile.role !== "admin") redirect("/");
  return profile;
}

export function homeFor(role: Profile["role"] | undefined) {
  if (role === "admin") return "/admin";
  if (role === "designer") return "/dashboard";
  return "/account";
}
