"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/discover");
  revalidatePath("/");
}

export async function setStudioStatus(form: FormData) {
  await requireAdmin();
  const status = String(form.get("status"));
  if (!["pending", "verified", "rejected"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("studios").update({ status }).eq("id", String(form.get("id")));
  refresh();
}

export async function setStudioPlan(form: FormData) {
  await requireAdmin();
  const plan = String(form.get("plan"));
  if (!["free", "premium", "priority"].includes(plan)) return;
  const supabase = await createClient();
  await supabase.from("studios").update({ plan }).eq("id", String(form.get("id")));
  refresh();
}

export async function setUserRole(form: FormData) {
  const me = await requireAdmin();
  const id = String(form.get("id"));
  const role = String(form.get("role"));
  if (!["customer", "designer", "admin"].includes(role) || id === me.id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin");
}
