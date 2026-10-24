"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type BookingState = { ok?: boolean; error?: string };

export async function createBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  if (!isSupabaseConfigured) {
    return { error: "This is demo mode — bookings switch on once Supabase is connected." };
  }
  const slug = String(form.get("slug") ?? "");
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/designers/${slug}`);

  const studioId = String(form.get("studio_id") ?? "");
  const serviceId = String(form.get("service_id") ?? "") || null;
  const mode = form.get("mode") === "studio" ? "studio" : "home";
  const date = String(form.get("date") ?? "");
  const time = String(form.get("time") ?? "");
  const address = String(form.get("address") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();

  if (!date || !time) return { error: "Pick a date and time." };
  const scheduled = new Date(`${date}T${time}:00+05:30`);
  if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() < Date.now()) {
    return { error: "Pick a time in the future." };
  }
  if (mode === "home" && address.length < 6) return { error: "Add the address for the home visit." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Add a phone number the studio can reach you on." };

  const supabase = await createClient();
  let serviceName = String(form.get("service_name") ?? "Consultation");
  if (serviceId) {
    const { data: svc } = await supabase.from("services").select("name").eq("id", serviceId).maybeSingle();
    if (svc) serviceName = svc.name;
  }

  const { error } = await supabase.from("bookings").insert({
    studio_id: studioId,
    customer_id: profile.id,
    service_id: serviceId,
    service_name: serviceName,
    mode,
    scheduled_at: scheduled.toISOString(),
    address: mode === "home" ? address : null,
    notes: notes || null,
    customer_name: profile.full_name,
    customer_phone: phone,
    customer_email: profile.email,
  });
  if (error) return { error: error.message };

  if (!profile.phone) await supabase.from("profiles").update({ phone }).eq("id", profile.id);
  revalidatePath("/account");
  return { ok: true };
}

export async function addReview(form: FormData) {
  if (!isSupabaseConfigured) return;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const rating = Math.min(5, Math.max(1, Number(form.get("rating") ?? 5)));
  const supabase = await createClient();
  await supabase.from("reviews").insert({
    studio_id: String(form.get("studio_id")),
    booking_id: String(form.get("booking_id")),
    customer_id: profile.id,
    author_name: profile.full_name ?? "Snip customer",
    rating,
    comment: String(form.get("comment") ?? "").trim() || null,
  });
  revalidatePath("/account");
}
