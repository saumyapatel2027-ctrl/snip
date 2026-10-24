import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarDays, Home, IndianRupee, Store } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { formatDate, inr } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardHome() {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: upcoming }, { count: requested }, { count: clientCount }, { data: openOrders }, { count: serviceCount }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, service_name, scheduled_at, mode, status, customer_name")
        .eq("studio_id", studio.id)
        .in("status", ["requested", "confirmed"])
        .gte("scheduled_at", nowIso)
        .order("scheduled_at")
        .limit(6),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("studio_id", studio.id).eq("status", "requested"),
      supabase.from("clients").select("id", { count: "exact", head: true }).eq("studio_id", studio.id),
      supabase.from("orders").select("id, title, stage, due_date, price, paid, clients(name)").eq("studio_id", studio.id).neq("stage", "delivered"),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("studio_id", studio.id),
    ]);

  const orders = (openOrders ?? []) as unknown as { id: string; title: string; stage: string; due_date: string | null; price: number; paid: number; clients: { name: string } | null }[];
  const dues = orders.reduce((sum, o) => sum + Math.max(0, o.price - o.paid), 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = orders.filter((o) => o.due_date && o.due_date < today);

  const checklist = [
    [Boolean(studio.bio && studio.tagline), "Add a tagline and bio"],
    [studio.lat != null, "Drop your map pin"],
    [studio.photos.length > 0, "Upload photos of your work"],
    [(serviceCount ?? 0) > 0, "Add services and prices"],
  ] as const;
  const incomplete = checklist.filter(([done]) => !done);

  return (
    <div>
      <h1 className="text-3xl">Overview</h1>
      {studio.status === "pending" && (
        <div className="mt-5 flex gap-3 rounded-2xl bg-saffron-50 p-5 text-sm text-[#8A5A12]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Your studio is waiting for verification.</p>
            <p>Complete your profile so the Snip team can verify you and publish you on Discover.</p>
          </div>
        </div>
      )}
      {studio.status === "rejected" && (
        <div className="mt-5 rounded-2xl bg-maroon-50 p-5 text-sm text-maroon">
          Your studio wasn&apos;t approved. Update your profile and email hello@snip.in to be reviewed again.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="New requests" value={String(requested ?? 0)} href="/dashboard/bookings" />
        <Stat label="Clients" value={String(clientCount ?? 0)} href="/dashboard/clients" />
        <Stat label="Open orders" value={String(orders.length)} href="/dashboard/orders" />
        <Stat label="Dues to collect" value={inr(dues)} href="/dashboard/orders" />
      </div>

      {incomplete.length > 0 && (
        <div className="card mt-6 p-5">
          <p className="font-bold">Finish your profile</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {checklist.map(([done, label]) => (
              <li key={label} className={done ? "text-jade line-through" : "text-ink-600"}>
                {done ? "✓" : "○"} {label}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/profile" className="btn-primary btn-sm mt-4">Edit profile <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold">Upcoming visits</p>
            <Link href="/dashboard/bookings" className="text-sm font-semibold text-maroon">All bookings →</Link>
          </div>
          <div className="mt-3 divide-y divide-ink/5">
            {upcoming?.length ? (
              upcoming.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{b.customer_name ?? "Customer"} · {b.service_name}</p>
                    <p className="flex items-center gap-2 text-xs text-ink-500">
                      <CalendarDays className="h-3 w-3" /> {formatDate(b.scheduled_at, true)}
                      {b.mode === "home" ? <Home className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-ink-500">No upcoming visits yet.</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold">Orders due</p>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-maroon">Pipeline →</Link>
          </div>
          {overdue.length > 0 && <p className="mt-2 text-xs font-semibold text-maroon">{overdue.length} overdue</p>}
          <div className="mt-3 divide-y divide-ink/5">
            {orders.length ? (
              orders
                .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
                .slice(0, 6)
                .map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{o.title}</p>
                      <p className="text-xs text-ink-500">{o.clients?.name ?? "—"} · due {formatDate(o.due_date)}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={o.stage} />
                      {o.price - o.paid > 0 && <p className="mt-1 text-xs text-maroon">{inr(o.price - o.paid)} due</p>}
                    </div>
                  </div>
                ))
            ) : (
              <p className="py-6 text-center text-sm text-ink-500">No open orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, href, icon }: { label: string; value: string; href: string; icon?: boolean }) {
  return (
    <Link href={href} className="card p-5 transition hover:shadow-lift">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 flex items-center gap-1 text-3xl font-extrabold">
        {icon && <IndianRupee className="h-5 w-5 text-ink-300" />}
        {value}
      </p>
    </Link>
  );
}
