import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Home, Store } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, whatsappLink } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { addReview } from "../designers/[slug]/actions";
import { cancelBooking } from "./actions";

export const metadata: Metadata = { title: "My bookings" };

type Row = {
  id: string;
  service_name: string;
  mode: "home" | "studio";
  scheduled_at: string;
  status: string;
  studio_id: string;
  studios: { name: string; slug: string; phone: string | null; address: string | null } | null;
  reviews: { id: string }[] | null;
};

export default async function AccountPage() {
  const profile = await requireProfile("/account");
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, service_name, mode, scheduled_at, status, studio_id, studios(name, slug, phone, address), reviews(id)")
    .eq("customer_id", profile.id)
    .order("scheduled_at", { ascending: false });
  const bookings = (data ?? []) as unknown as Row[];
  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.scheduled_at).getTime() >= now && ["requested", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="container max-w-4xl py-12">
      <p className="eyebrow">My account</p>
      <h1 className="mt-4 text-4xl">Hi {profile.full_name?.split(" ")[0] ?? "there"} 👋</h1>
      {profile.role === "customer" && (
        <p className="mt-2 text-sm text-ink-500">
          Are you a tailor or designer? <Link href="/for-designers" className="font-semibold text-maroon">List your studio on Snip</Link>
        </p>
      )}

      <h2 className="mt-10 text-2xl">Upcoming</h2>
      <div className="mt-4 space-y-3">
        {upcoming.length ? upcoming.map((b) => <BookingRow key={b.id} b={b} />) : (
          <div className="card p-8 text-center text-ink-500">
            No upcoming bookings. <Link href="/discover" className="font-semibold text-maroon">Find a designer →</Link>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl">History</h2>
          <div className="mt-4 space-y-3">
            {past.map((b) => <BookingRow key={b.id} b={b} />)}
          </div>
        </>
      )}
    </div>
  );
}

function BookingRow({ b }: { b: Row }) {
  const canCancel = ["requested", "confirmed"].includes(b.status);
  const canReview = b.status === "completed" && !(b.reviews?.length);
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/designers/${b.studios?.slug ?? ""}`} className="text-lg font-bold hover:text-maroon">
            {b.studios?.name ?? "Studio"}
          </Link>
          <p className="text-sm text-ink-600">{b.service_name}</p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.scheduled_at, true)}</span>
            <span className="inline-flex items-center gap-1">
              {b.mode === "home" ? <Home className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
              {b.mode === "home" ? "Home visit" : `Studio · ${b.studios?.address ?? ""}`}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={b.status} />
          {b.studios?.phone && canCancel && (
            <a
              href={whatsappLink(b.studios.phone, `Hi ${b.studios.name}, about my Snip booking for ${b.service_name} on ${formatDate(b.scheduled_at, true)}.`)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-sm"
            >
              WhatsApp
            </a>
          )}
          {canCancel && (
            <form action={cancelBooking}>
              <input type="hidden" name="id" value={b.id} />
              <button className="btn-ghost btn-sm text-maroon">Cancel</button>
            </form>
          )}
        </div>
      </div>
      {canReview && (
        <form action={addReview} className="mt-4 flex flex-col gap-2 border-t border-ink/5 pt-4 sm:flex-row">
          <input type="hidden" name="studio_id" value={b.studio_id} />
          <input type="hidden" name="booking_id" value={b.id} />
          <select name="rating" defaultValue="5" className="input sm:w-32">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
          <input name="comment" className="input flex-1" placeholder="How was your experience?" />
          <button className="btn-primary">Post review</button>
        </form>
      )}
    </div>
  );
}
