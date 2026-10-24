import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { ORDER_STAGES, cn, formatDate, inr, whatsappLink } from "@/lib/utils";
import { PhotoUploader } from "@/components/PhotoUploader";
import { createOrder, deleteOrder, moveOrder, recordPayment, updateOrder } from "./actions";

type Row = Order & { clients: { name: string; phone: string | null } | null };

const stageMsg: Record<string, string> = {
  received: "we've received your order and will start soon",
  cutting: "your fabric is being cut",
  stitching: "your outfit is being stitched",
  trial: "your outfit is ready for a trial",
  ready: "your order is ready for pickup/delivery",
  delivered: "your order has been delivered — thank you",
};

export default async function OrdersPage() {
  const { studio, profile } = await requireStudio();
  const supabase = await createClient();
  const [{ data }, { data: clients }] = await Promise.all([
    supabase.from("orders").select("*, clients(name, phone)").eq("studio_id", studio.id).order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, name").eq("studio_id", studio.id).order("name"),
  ]);
  const orders = (data ?? []) as Row[];
  const today = new Date().toISOString().slice(0, 10);
  const dues = orders.filter((o) => o.stage !== "delivered").reduce((s, o) => s + Math.max(0, o.price - o.paid), 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-ink-500">{orders.length} orders · <span className="font-semibold text-maroon">{inr(dues)}</span> to collect</p>
        </div>
      </div>

      <details className="card mt-5 p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-bold"><Plus className="h-4 w-4" /> New order</summary>
        <form action={createOrder} className="mt-4 grid gap-3 md:grid-cols-3">
          <select name="client_id" className="input" defaultValue="">
            <option value="">No client / walk-in</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="title" required className="input" placeholder="Title (e.g. Bridal blouse)" />
          <input name="garment" className="input" placeholder="Garment / fabric" />
          <input name="price" type="number" min={0} className="input" placeholder="Price ₹" />
          <input name="paid" type="number" min={0} className="input" placeholder="Advance ₹" />
          <input name="due_date" type="date" className="input" />
          <div className="md:col-span-3">
            <span className="label">Fabric photos</span>
            <PhotoUploader userId={profile.id} folder="fabric" name="fabric_photos" max={6} />
          </div>
          <textarea name="notes" rows={2} className="input md:col-span-3" placeholder="Notes" />
          <button className="btn-primary md:w-fit">Create order</button>
        </form>
      </details>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {ORDER_STAGES.map((stage, i) => {
          const col = orders.filter((o) => o.stage === stage.key);
          return (
            <section key={stage.key} className="w-[290px] shrink-0">
              <header className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-bold uppercase tracking-wide">{stage.label}</p>
                <span className="text-xs text-ink-500">{col.length}</span>
              </header>
              <div className="space-y-3 rounded-2xl bg-ivory-100 p-2 min-h-[120px]">
                {col.map((o) => {
                  const due = o.price - o.paid;
                  const late = o.due_date && o.due_date < today && o.stage !== "delivered";
                  const prev = ORDER_STAGES[i - 1]?.key;
                  const next = ORDER_STAGES[i + 1]?.key;
                  return (
                    <article key={o.id} id={o.id} className="card p-3.5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold leading-tight">{o.title}</p>
                          {o.clients && (
                            <Link href={`/dashboard/clients/${o.client_id}`} className="text-xs text-ink-500 hover:text-maroon">{o.clients.name}</Link>
                          )}
                        </div>
                        {o.fabric_photos[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.fabric_photos[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                      </div>
                      <p className={cn("mt-2 text-xs", late ? "font-semibold text-maroon" : "text-ink-500")}>
                        Due {formatDate(o.due_date)}{late && " · overdue"}
                      </p>
                      <p className="mt-1 text-xs">
                        {inr(o.price)} · {due > 0 ? <span className="font-semibold text-maroon">{inr(due)} due</span> : <span className="text-jade">Paid</span>}
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        {prev && (
                          <form action={moveOrder}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="stage" value={prev} />
                            <button className="btn-ghost btn-sm px-2" aria-label="Move back"><ChevronLeft className="h-4 w-4" /></button>
                          </form>
                        )}
                        {next && (
                          <form action={moveOrder}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="stage" value={next} />
                            <button className="btn-secondary btn-sm">{ORDER_STAGES[i + 1].label} <ChevronRight className="h-3.5 w-3.5" /></button>
                          </form>
                        )}
                        {o.clients?.phone && (
                          <a
                            href={whatsappLink(o.clients.phone, `Hi ${o.clients.name.split(" ")[0]}, update from ${studio.name}: ${stageMsg[o.stage]}.${due > 0 && ["ready", "trial"].includes(o.stage) ? ` Balance due: ${inr(due)}.` : ""}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost btn-sm ml-auto px-2 text-jade"
                            aria-label="WhatsApp update"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <details className="mt-2 border-t border-ink/5 pt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-ink-500">Edit · payment · photos</summary>
                        {due > 0 && (
                          <form action={recordPayment} className="mt-3 flex gap-2">
                            <input type="hidden" name="id" value={o.id} />
                            <input name="amount" type="number" min={1} className="input py-1.5" placeholder="Received ₹" />
                            <button className="btn-primary btn-sm">Add</button>
                          </form>
                        )}
                        <form action={updateOrder} className="mt-3 space-y-2">
                          <input type="hidden" name="id" value={o.id} />
                          <input name="title" defaultValue={o.title} className="input py-1.5" />
                          <input name="garment" defaultValue={o.garment ?? ""} className="input py-1.5" placeholder="Garment / fabric" />
                          <div className="grid grid-cols-2 gap-2">
                            <input name="price" type="number" defaultValue={o.price} className="input py-1.5" />
                            <input name="paid" type="number" defaultValue={o.paid} className="input py-1.5" />
                          </div>
                          <input name="due_date" type="date" defaultValue={o.due_date ?? ""} className="input py-1.5" />
                          <select name="stage" defaultValue={o.stage} className="input py-1.5">
                            {ORDER_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <PhotoUploader userId={profile.id} folder="fabric" name="fabric_photos" initial={o.fabric_photos} max={6} />
                          <textarea name="notes" defaultValue={o.notes ?? ""} rows={2} className="input py-1.5" placeholder="Notes" />
                          <button className="btn-primary btn-sm w-full">Save</button>
                        </form>
                        <form action={deleteOrder} className="mt-2">
                          <input type="hidden" name="id" value={o.id} />
                          <button className="text-xs text-maroon">Delete order</button>
                        </form>
                      </details>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
