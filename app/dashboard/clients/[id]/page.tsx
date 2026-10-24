import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Client, Order } from "@/lib/types";
import { MEASUREMENT_FIELDS, ORDER_STAGES, formatDate, gmailLink, inr, whatsappLink } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { createOrder } from "../../orders/actions";
import { deleteClientRecord, saveMeasurements, updateClientRecord } from "../actions";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { studio, profile } = await requireStudio();
  const supabase = await createClient();
  const [{ data: c }, { data: orderRows }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).eq("studio_id", studio.id).maybeSingle(),
    supabase.from("orders").select("*").eq("client_id", id).eq("studio_id", studio.id).order("created_at", { ascending: false }),
  ]);
  if (!c) notFound();
  const client = c as Client;
  const orders = (orderRows ?? []) as Order[];
  const m = client.measurements ?? {};
  const extras = Object.entries(m).filter(([k]) => !(MEASUREMENT_FIELDS as readonly string[]).includes(k));
  const first = client.name.split(" ")[0];

  const templates = [
    ["Measurement reminder", `Hi ${first}, this is ${studio.name}. Could you share a good time for your measurements this week?`],
    ["Trial ready", `Hi ${first}, your outfit is ready for a trial at ${studio.name}. When would you like to come in (or shall we visit)?`],
    ["Ready for pickup", `Hi ${first}, great news — your order from ${studio.name} is ready! Let us know when you'd like to collect it.`],
    ["Payment reminder", `Hi ${first}, a gentle reminder from ${studio.name} about the pending balance on your order. Thank you!`],
  ];

  return (
    <div>
      <Link href="/dashboard/clients" className="text-sm text-ink-500 hover:text-ink">← Clients</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{client.name}</h1>
        <form action={deleteClientRecord}>
          <input type="hidden" name="id" value={client.id} />
          <button className="btn-ghost btn-sm text-maroon">Delete client</button>
        </form>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form action={updateClientRecord} className="card space-y-3 p-5">
          <p className="font-bold">Details</p>
          <input type="hidden" name="id" value={client.id} />
          <input name="name" defaultValue={client.name} className="input" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="phone" defaultValue={client.phone ?? ""} className="input" placeholder="Phone" />
            <input name="email" defaultValue={client.email ?? ""} className="input" placeholder="Email" />
          </div>
          <input name="address" defaultValue={client.address ?? ""} className="input" placeholder="Address" />
          <textarea name="notes" defaultValue={client.notes ?? ""} rows={3} className="input" placeholder="Notes: preferences, fabric, fit…" />
          <button className="btn-primary btn-sm">Save details</button>
        </form>

        <div className="card p-5">
          <p className="font-bold">Quick messages</p>
          <div className="mt-3 space-y-3">
            {templates.map(([label, text]) => (
              <div key={label} className="rounded-xl bg-ivory p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
                <p className="mt-1 text-sm text-ink-600">{text}</p>
                <div className="mt-2 flex gap-2">
                  <a href={whatsappLink(client.phone, text)} target="_blank" rel="noreferrer" className={`btn-secondary btn-sm ${client.phone ? "" : "pointer-events-none opacity-40"}`}>
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  <a href={gmailLink(client.email, `${label} — ${studio.name}`, text)} target="_blank" rel="noreferrer" className={`btn-secondary btn-sm ${client.email ? "" : "pointer-events-none opacity-40"}`}>
                    <Mail className="h-3.5 w-3.5" /> Gmail
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form action={saveMeasurements} className="card mt-6 p-5">
        <input type="hidden" name="id" value={client.id} />
        <div className="flex items-center justify-between">
          <p className="font-bold">Measurements <span className="font-normal text-ink-500">(inches)</span></p>
          <button className="btn-primary btn-sm">Save measurements</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEASUREMENT_FIELDS.map((f) => (
            <label key={f}>
              <span className="label">{f}</span>
              <input name={`m:${f}`} defaultValue={m[f] ?? ""} className="input" inputMode="decimal" />
            </label>
          ))}
          {extras.map(([k, v]) => (
            <label key={k}>
              <span className="label">{k}</span>
              <input name={`x:${k}`} defaultValue={v} className="input" />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input name="extra_key" className="input" placeholder="Custom field (e.g. Thigh)" />
          <input name="extra_val" className="input" placeholder="Value" />
        </div>
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="card p-5">
          <p className="font-bold">Orders</p>
          <div className="mt-3 divide-y divide-ink/5">
            {orders.length ? orders.map((o) => (
              <Link key={o.id} href={`/dashboard/orders#${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-maroon">
                <div>
                  <p className="font-semibold">{o.title}</p>
                  <p className="text-xs text-ink-500">Due {formatDate(o.due_date)} · {inr(o.price)} ({inr(o.paid)} paid)</p>
                </div>
                <StatusBadge status={o.stage} />
              </Link>
            )) : <p className="py-6 text-center text-sm text-ink-500">No orders yet.</p>}
          </div>
        </div>
        <form action={createOrder} className="card h-fit space-y-3 p-5">
          <p className="font-bold">New order</p>
          <input type="hidden" name="client_id" value={client.id} />
          <input type="hidden" name="return_to" value={`/dashboard/clients/${client.id}`} />
          <input name="title" required className="input" placeholder="e.g. Wedding blouse" />
          <input name="garment" className="input" placeholder="Garment / fabric" />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" type="number" min={0} className="input" placeholder="Price ₹" />
            <input name="paid" type="number" min={0} className="input" placeholder="Advance ₹" />
          </div>
          <input name="due_date" type="date" className="input" />
          <select name="stage" className="input" defaultValue="received">
            {ORDER_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input type="hidden" name="uid" value={profile.id} />
          <button className="btn-primary w-full">Create order</button>
        </form>
      </div>
    </div>
  );
}
