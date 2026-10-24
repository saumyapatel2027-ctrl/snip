"use client";
import { useActionState } from "react";
import type { Studio } from "@/lib/types";
import { CATEGORIES } from "@/lib/utils";
import { LocationPicker } from "@/components/LocationPicker";
import { Notice } from "@/components/Notice";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SubmitButton } from "@/components/SubmitButton";
import { saveStudio, type ProfileState } from "./actions";

const KINDS = ["Tailor", "Boutique", "Emerging designer", "Custom tailoring", "Bridal couture"];

export function StudioForm({ studio, userId }: { studio: Studio; userId: string }) {
  const [state, action] = useActionState<ProfileState, FormData>(saveStudio, {});
  return (
    <form action={action} className="space-y-6">
      <div className="card grid gap-4 p-5 md:grid-cols-2">
        <p className="font-bold md:col-span-2">Basics</p>
        <label>
          <span className="label">Studio name</span>
          <input name="name" defaultValue={studio.name} required className="input" />
        </label>
        <label>
          <span className="label">Type</span>
          <select name="kind" defaultValue={studio.kind} className="input">
            {KINDS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label">Tagline</span>
          <input name="tagline" defaultValue={studio.tagline ?? ""} className="input" placeholder="One line about what you do best" maxLength={120} />
        </label>
        <label className="md:col-span-2">
          <span className="label">About</span>
          <textarea name="bio" defaultValue={studio.bio ?? ""} rows={4} className="input" placeholder="Experience, specialities, how you work…" />
        </label>
        <label>
          <span className="label">Public link</span>
          <div className="flex items-center gap-1 text-sm text-ink-500">
            /designers/<input name="slug" defaultValue={studio.slug} className="input" />
          </div>
        </label>
        <label>
          <span className="label">Starting price (₹)</span>
          <input name="starting_price" type="number" min={0} defaultValue={studio.starting_price} className="input" />
        </label>
      </div>

      <div className="card p-5">
        <p className="font-bold">What you offer</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="chip cursor-pointer has-[:checked]:border-maroon has-[:checked]:bg-maroon has-[:checked]:text-ivory">
              <input type="checkbox" name="categories" value={c} defaultChecked={studio.categories.includes(c)} className="sr-only" />
              {c}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="home_visits" defaultChecked={studio.home_visits} className="accent-maroon" /> I do home visits</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="studio_visits" defaultChecked={studio.studio_visits} className="accent-maroon" /> Customers can visit my studio</label>
        </div>
      </div>

      <div className="card grid gap-4 p-5 md:grid-cols-2">
        <p className="font-bold md:col-span-2">Contact &amp; location</p>
        <label><span className="label">Phone / WhatsApp</span><input name="phone" defaultValue={studio.phone ?? ""} className="input" /></label>
        <label><span className="label">Email</span><input name="email" type="email" defaultValue={studio.email ?? ""} className="input" /></label>
        <label><span className="label">Instagram</span><input name="instagram" defaultValue={studio.instagram ?? ""} className="input" placeholder="@yourstudio" /></label>
        <label><span className="label">Area</span><input name="area" defaultValue={studio.area ?? ""} className="input" placeholder="e.g. Lajpat Nagar" /></label>
        <label className="md:col-span-2"><span className="label">Studio address</span><input name="address" defaultValue={studio.address ?? ""} className="input" /></label>
        <div className="md:col-span-2">
          <span className="label">Map pin</span>
          <div className="overflow-hidden rounded-[20px] border border-ink/10">
            <LocationPicker lat={studio.lat} lng={studio.lng} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-bold">Photos</p>
        <p className="mb-3 text-sm text-ink-500">The first photo is your cover. Show finished pieces, your studio and your team.</p>
        <PhotoUploader userId={userId} folder="studio" name="photos" initial={studio.photos} max={studio.plan === "free" ? 4 : 8} />
        {studio.plan === "free" && <p className="mt-2 text-xs text-ink-500">Free plan: up to 4 photos. Premium: up to 8.</p>}
      </div>

      {state.error && <Notice kind="error">{state.error}</Notice>}
      {state.ok && <Notice kind="success">Saved. Your public page is updated.</Notice>}
      <div className="sticky bottom-4">
        <SubmitButton className="px-8 py-3">Save profile</SubmitButton>
      </div>
    </form>
  );
}
