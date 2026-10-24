"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { MEASUREMENT_FIELDS } from "@/lib/utils";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;

export async function createClientRecord(form: FormData) {
  const { studio } = await requireStudio();
  const name = str(form, "name");
  if (!name) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .insert({ studio_id: studio.id, name, phone: str(form, "phone"), email: str(form, "email"), address: str(form, "address") })
    .select("id")
    .single();
  revalidatePath("/dashboard/clients");
  if (data) redirect(`/dashboard/clients/${data.id}`);
}

export async function updateClientRecord(form: FormData) {
  const { studio } = await requireStudio();
  const id = String(form.get("id"));
  const supabase = await createClient();
  await supabase
    .from("clients")
    .update({ name: str(form, "name") ?? "Client", phone: str(form, "phone"), email: str(form, "email"), address: str(form, "address"), notes: str(form, "notes") })
    .eq("id", id)
    .eq("studio_id", studio.id);
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function saveMeasurements(form: FormData) {
  const { studio } = await requireStudio();
  const id = String(form.get("id"));
  const m: Record<string, string> = {};
  for (const field of MEASUREMENT_FIELDS) {
    const v = String(form.get(`m:${field}`) ?? "").trim();
    if (v) m[field] = v;
  }
  const extraKey = String(form.get("extra_key") ?? "").trim();
  const extraVal = String(form.get("extra_val") ?? "").trim();
  for (const [k, v] of form.entries()) {
    if (k.startsWith("x:") && String(v).trim()) m[k.slice(2)] = String(v).trim();
  }
  if (extraKey && extraVal) m[extraKey] = extraVal;
  const supabase = await createClient();
  await supabase.from("clients").update({ measurements: m }).eq("id", id).eq("studio_id", studio.id);
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function deleteClientRecord(form: FormData) {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", String(form.get("id"))).eq("studio_id", studio.id);
  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}
