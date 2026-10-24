import { CalendarDays, Home, Mail, MapPin, MessageCircle, Store } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types";
import { formatDate, gmailLink, whatsappLink } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { openInCrm, setBookingStatus } from "./actions";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "open" } = await searchParams;
  const { studio } = await requireStudio();
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").eq("studio_id", studio.id).order("scheduled_at", { ascending: tab === "open" });
  const all = (data ?? []) as Booking[];
  const open = all.filter((b) => b.status === "requested" || b.status === "confirmed");
  const list = tab === "open" ? open : all.filter((b) => !open.includes(b));

  return (
    <div>
      <h1 className="text-3xl">Bookings</h1>
      <div className="mt-5 flex gap-2">
        <a href="?tab=open" className={`chip ${tab === "open" ? "chip-active" : ""}`}>Open ({open.length})</a>
        <a href="?tab=past" className={`chip ${tab !== "open" ? "chip-active" : ""}`}>Past ({all.length - open.length})</a>
      </div>
      <div className="mt-5 space-y-3">
        {list.length ? list.map((b) => <BookingCard key={b.id} b={b} studioName={studio.name} />) : (
          <div className="card p-10 text-center text-ink-500">
            {tab === "open" ? "No open bookings. Once you're verified, customers can book you from Discover." : "Nothing here yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b, studioName }: { b: Booking; studioName: string }) {
  const when = formatDate(b.scheduled_at, true);
  const confirmMsg = `Hi ${b.customer_name ?? ""}, this is ${studioName} on Snip. Your ${b.service_name} (${b.mode === "home" ? "home visit" : "studio visit"}) is confirmed for ${when}. See you then!`;
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold">{b.customer_name ?? "Customer"}</p>
          <p className="text-sm text-ink-600">{b.service_name}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {when}</span>
            <span className="inline-flex items-center gap-1">
              {b.mode === "home" ? <Home className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
              {b.mode === "home" ? "Home visit" : "At studio"}
            </span>
            {b.address && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.address}</span>}
            {b.customer_phone && <span>{b.customer_phone}</span>}
          </div>
          {b.notes && <p className="mt-2 rounded-lg bg-ivory-100 px-3 py-2 text-sm text-ink-600">“{b.notes}”</p>}
        </div>
        <StatusBadge status={b.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/5 pt-4">
        {b.status === "requested" && (
          <>
            <StatusButton id={b.id} status="confirmed" label="Confirm" primary />
            <StatusButton id={b.id} status="declined" label="Decline" />
          </>
        )}
        {b.status === "confirmed" && (
          <>
            <StatusButton id={b.id} status="completed" label="Mark completed" primary />
            <StatusButton id={b.id} status="cancelled" label="Cancel" />
          </>
        )}
        {b.customer_phone && (
          <a href={whatsappLink(b.customer_phone, confirmMsg)} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        )}
        {b.customer_email && (
          <a href={gmailLink(b.customer_email, `Your Snip booking with ${studioName}`, confirmMsg)} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
            <Mail className="h-3.5 w-3.5" /> Gmail
          </a>
        )}
        <form action={openInCrm}>
          <input type="hidden" name="id" value={b.id} />
          <button className="btn-ghost btn-sm">Open in CRM →</button>
        </form>
      </div>
    </div>
  );
}

function StatusButton({ id, status, label, primary }: { id: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={primary ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>{label}</button>
    </form>
  );
}
