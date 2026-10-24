"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STAGES } from "@/lib/utils";

const STAGES = ORDER_STAGES.map((s) => s.key) as string[];
const int = (v: FormDataEntryValue | null) => Math.max(0, Math.round(Number(v ?? 0) || 0));
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

export async function createOrder(form: FormData) {
  const { studio } = await requireStudio();
  const title = str(form.get("title"));
  if (!title) return;
  const stage = STAGES.includes(String(form.get("stage"))) ? String(form.get("stage")) : "received";
  const supabase = await createClient();
  await supabase.from("orders").insert({
    studio_id: studio.id,
    client_id: str(form.get("client_id")),
    title,
    garment: str(form.get("garment")),
    stage,
    due_date: str(form.get("due_date")),
    price: int(form.get("price")),
    paid: int(form.get("paid")),
    notes: str(form.get("notes")),
    fabric_photos: lines(form.get("fabric_photos")),
  });
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  const back = String(form.get("return_to") ?? "");
  if (back.startsWith("/dashboard")) {
    revalidatePath(back);
    redirect(back);
  }
}

export async function updateOrder(form: FormData) {
  const { studio } = await requireStudio();
  const stage = String(form.get("stage"));
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({
      title: str(form.get("title")) ?? "Order",
      garment: str(form.get("garment")),
      stage: STAGES.includes(stage) ? stage : "received",
      due_date: str(form.get("due_date")),
      price: int(form.get("price")),
      paid: int(form.get("paid")),
      notes: str(form.get("notes")),
      fabric_photos: lines(form.get("fabric_photos")),
    })
    .eq("id", String(form.get("id")))
    .eq("studio_id", studio.id);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

export async function moveOrder(form: FormData) {
  const { studio } = await requireStudio();
  const stage = String(form.get("stage"));
  if (!STAGES.includes(stage)) return;
  const supabase = await createClient();
  await supabase.from("orders").update({ stage }).eq("id", String(form.get("id"))).eq("studio_id", studio.id);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

export async function recordPayment(form: FormData) {
  const { studio } = await requireStudio();
  const id = String(form.get("id"));
  const amount = int(form.get("amount"));
  if (!amount) return;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("paid").eq("id", id).eq("studio_id", studio.id).single();
  if (!data) return;
  await supabase.from("orders").update({ paid: data.paid + amount }).eq("id", id).eq("studio_id", studio.id);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

export async function deleteOrder(form: FormData) {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", String(form.get("id"))).eq("studio_id", studio.id);
  revalidatePath("/dashboard/orders");
}
