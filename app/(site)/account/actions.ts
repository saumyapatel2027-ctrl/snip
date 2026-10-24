"use server";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function cancelBooking(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", String(form.get("id")))
    .eq("customer_id", profile.id);
  revalidatePath("/account");
}
