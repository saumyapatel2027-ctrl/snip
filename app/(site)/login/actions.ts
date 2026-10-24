"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { homeFor } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string };

function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function origin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: "Demo mode — log in switches on once Supabase is connected." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(safeNext(String(form.get("next") ?? "")) ?? homeFor(profile?.role));
}

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: "Demo mode — sign up switches on once Supabase is connected." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const fullName = String(form.get("full_name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const role = form.get("role") === "designer" ? "designer" : "customer";
  const studioName = String(form.get("studio_name") ?? "").trim();

  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  if (!fullName) return { error: "Add your name." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback`,
      data: { full_name: fullName, phone, role, studio_name: studioName },
    },
  });
  if (error) return { error: error.message };
  if (!data.session) {
    return { info: `Almost there — we sent a confirmation link to ${email}. Open it to finish signing up.` };
  }
  redirect(role === "designer" ? "/dashboard/profile?welcome=1" : "/discover");
}
