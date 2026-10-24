import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Studio } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { setStudioPlan, setStudioStatus, setUserRole } from "./actions";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "pending" } = await searchParams;
  const me = await requireAdmin();
  const supabase = await createClient();
  const [{ data: studioRows }, { data: userRows }, { count: bookingCount }] = await Promise.all([
    supabase.from("studios").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
  ]);
  const studios = (studioRows ?? []) as Studio[];
  const users = (userRows ?? []) as Profile[];
  const groups = {
    pending: studios.filter((s) => s.status === "pending"),
    verified: studios.filter((s) => s.status === "verified"),
    rejected: studios.filter((s) => s.status === "rejected"),
  };
  const list = tab in groups ? groups[tab as keyof typeof groups] : [];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-ink/10 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3"><Logo /> <span className="badge bg-ink text-ivory">Admin</span></div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-ink-500 hover:text-ink">View site</Link>
            <form action="/auth/signout" method="post"><button className="text-ink-500 hover:text-ink">Log out</button></form>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Pending studios", groups.pending.length],
            ["Live studios", groups.verified.length],
            ["Users", users.length],
            ["Bookings", bookingCount ?? 0],
          ].map(([l, v]) => (
            <div key={l as string} className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{l}</p>
              <p className="mt-2 text-3xl font-extrabold">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["pending", "verified", "rejected", "users"] as const).map((t) => (
            <a key={t} href={`?tab=${t}`} className={`chip capitalize ${tab === t ? "chip-active" : ""}`}>
              {t} {t !== "users" ? `(${groups[t].length})` : `(${users.length})`}
            </a>
          ))}
        </div>

        {tab !== "users" ? (
          <div className="mt-5 space-y-3">
            {list.length ? list.map((s) => (
              <div key={s.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/designers/${s.slug}`} className="text-lg font-bold hover:text-maroon">{s.name}</Link>
                    <StatusBadge status={s.status} />
                    <StatusBadge status={s.plan} />
                  </div>
                  <p className="text-sm text-ink-500">
                    {s.kind} · {s.area ?? "no area"} · {s.phone ?? "no phone"} · {s.email ?? "no email"}
                  </p>
                  <p className="text-xs text-ink-300">
                    Joined {formatDate(s.created_at)} · {s.photos.length} photos · {s.lat != null ? "map pin ✓" : "no map pin"} · {s.snip_code}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {s.status !== "verified" && (
                    <form action={setStudioStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value="verified" />
                      <button className="btn-primary btn-sm">Verify &amp; publish</button>
                    </form>
                  )}
                  {s.status !== "rejected" && (
                    <form action={setStudioStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value={s.status === "verified" ? "pending" : "rejected"} />
                      <button className="btn-secondary btn-sm">{s.status === "verified" ? "Unpublish" : "Reject"}</button>
                    </form>
                  )}
                  <form action={setStudioPlan} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={s.id} />
                    <select name="plan" defaultValue={s.plan} className="input py-1.5 text-xs">
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="priority">Priority</option>
                    </select>
                    <button className="btn-ghost btn-sm">Set</button>
                  </form>
                </div>
              </div>
            )) : <div className="card p-10 text-center text-ink-500">Nothing here.</div>}
          </div>
        ) : (
          <div className="card mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-100 text-xs uppercase tracking-wide text-ink-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Role</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3 font-semibold">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.id === me.id ? <StatusBadge status="admin" /> : (
                        <form action={setUserRole} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={u.role} className="input py-1.5 text-xs">
                            <option value="customer">Customer</option>
                            <option value="designer">Designer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button className="btn-ghost btn-sm">Set</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
