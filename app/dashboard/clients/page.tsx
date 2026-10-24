import Link from "next/link";
import { Download, Search, UserPlus } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { createClientRecord } from "./actions";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { studio } = await requireStudio();
  const supabase = await createClient();
  let query = supabase.from("clients").select("*").eq("studio_id", studio.id).order("created_at", { ascending: false });
  const term = q.replace(/[%,()]/g, "").trim();
  if (term) query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await query;
  const clients = (data ?? []) as Client[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Clients</h1>
        <a href="/dashboard/clients/export" className="btn-secondary btn-sm"><Download className="h-3.5 w-3.5" /> Export CSV</a>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <form className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input name="q" defaultValue={q} className="input pl-10" placeholder="Search by name, phone or email" />
          </form>
          <div className="card mt-4 overflow-hidden">
            {clients.length ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory-100 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Phone</th>
                    <th className="hidden px-4 py-3 md:table-cell">Measurements</th>
                    <th className="hidden px-4 py-3 md:table-cell">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="table-row hover:bg-ivory">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/clients/${c.id}`} className="font-semibold hover:text-maroon">{c.name}</Link>
                        <p className="text-xs text-ink-500 sm:hidden">{c.phone}</p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">{c.phone ?? "—"}</td>
                      <td className="hidden px-4 py-3 md:table-cell">{Object.keys(c.measurements ?? {}).length} saved</td>
                      <td className="hidden px-4 py-3 text-ink-500 md:table-cell">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-10 text-center text-sm text-ink-500">{q ? "No clients match." : "Your client book is empty. Add your first client →"}</p>
            )}
          </div>
        </div>

        <form action={createClientRecord} className="card h-fit space-y-3 p-5">
          <p className="flex items-center gap-2 font-bold"><UserPlus className="h-4 w-4" /> Add client</p>
          <input name="name" required className="input" placeholder="Name" />
          <input name="phone" type="tel" className="input" placeholder="Phone" />
          <input name="email" type="email" className="input" placeholder="Email" />
          <input name="address" className="input" placeholder="Address" />
          <button className="btn-primary w-full">Add client</button>
        </form>
      </div>
    </div>
  );
}
