import { Trash2 } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import { inr } from "@/lib/utils";
import { Notice } from "@/components/Notice";
import { addService, deleteService } from "./actions";
import { StudioForm } from "./StudioForm";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { studio, profile } = await requireStudio();
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("studio_id", studio.id).order("sort");
  const services = (data ?? []) as Service[];

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl">Studio profile</h1>
      {welcome && (
        <div className="mt-4">
          <Notice kind="success">Welcome to Snip! Fill in your profile, add services and drop your map pin. We&apos;ll verify you and publish you on Discover.</Notice>
        </div>
      )}
      <div className="mt-6 grid gap-6">
        <div className="card p-5">
          <p className="font-bold">Services &amp; prices</p>
          <div className="mt-3 divide-y divide-ink/5">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{s.name} <span className="font-normal text-ink-500">· {s.duration_mins} min</span></p>
                  {s.description && <p className="text-xs text-ink-500">{s.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{inr(s.price)}</span>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-ink-300 hover:text-maroon" aria-label="Delete service"><Trash2 className="h-4 w-4" /></button>
                  </form>
                </div>
              </div>
            ))}
            {!services.length && <p className="py-3 text-sm text-ink-500">No services yet. Add your first one below.</p>}
          </div>
          <form action={addService} className="mt-3 grid gap-2 border-t border-ink/5 pt-4 md:grid-cols-[1.4fr_1.6fr_.8fr_.8fr_auto]">
            <input name="name" required className="input" placeholder="Service (e.g. Blouse stitching)" />
            <input name="description" className="input" placeholder="Short description" />
            <input name="price" type="number" min={0} required className="input" placeholder="₹" />
            <input name="duration_mins" type="number" min={10} step={5} defaultValue={45} className="input" title="Visit length (min)" />
            <button className="btn-primary">Add</button>
          </form>
        </div>
        <StudioForm studio={studio} userId={profile.id} />
      </div>
    </div>
  );
}
