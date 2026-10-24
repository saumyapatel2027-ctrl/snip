"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = ["confirmed", "declined", "completed", "cancelled"];

export async function setBookingStatus(form: FormData) {
  const { studio } = await requireStudio();
  const status = String(form.get("status"));
  if (!ALLOWED.includes(status)) return;
  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", String(form.get("id"))).eq("studio_id", studio.id);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

/** Find or create a CRM client for this booking's customer, link it, and open the client page. */
export async function openInCrm(form: FormData) {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  const { data: b } = await supabase
    .from("bookings")
    .select("id, client_id, customer_name, customer_phone, customer_email, address")
    .eq("id", String(form.get("id")))
    .eq("studio_id", studio.id)
    .single();
  if (!b) return;
  let clientId = b.client_id as string | null;

  if (!clientId) {
    let q = supabase.from("clients").select("id").eq("studio_id", studio.id).limit(1);
    if (b.customer_phone) q = q.eq("phone", b.customer_phone);
    else if (b.customer_email) q = q.eq("email", b.customer_email);
    const { data: existing } = b.customer_phone || b.customer_email ? await q : { data: null };
    clientId = existing?.[0]?.id ?? null;
    if (!clientId) {
      const { data: created } = await supabase
        .from("clients")
        .insert({
          studio_id: studio.id,
          name: b.customer_name ?? "Snip customer",
          phone: b.customer_phone,
          email: b.customer_email,
          address: b.address,
          notes: "Added from a Snip booking.",
        })
        .select("id")
        .single();
      clientId = created?.id ?? null;
    }
    if (clientId) await supabase.from("bookings").update({ client_id: clientId }).eq("id", b.id);
  }
  if (clientId) redirect(`/dashboard/clients/${clientId}`);
}
