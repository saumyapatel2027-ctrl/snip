"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Service } from "@/lib/types";
import { inr } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/Notice";
import { createBooking, type BookingState } from "./actions";

export function BookingForm({
  studioId,
  slug,
  services,
  homeVisits,
  studioVisits,
  signedIn,
  defaultPhone,
}: {
  studioId: string;
  slug: string;
  services: Service[];
  homeVisits: boolean;
  studioVisits: boolean;
  signedIn: boolean;
  defaultPhone: string;
}) {
  const [state, action] = useActionState<BookingState, FormData>(createBooking, {});
  const [mode, setMode] = useState<"home" | "studio">(homeVisits ? "home" : "studio");
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

  if (state.ok) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-jade" />
        <p className="mt-3 text-lg font-bold">Request sent!</p>
        <p className="mt-1 text-sm text-ink-500">The studio will confirm your slot shortly.</p>
        <Link href="/account" className="btn-primary mt-5">View my bookings</Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="studio_id" value={studioId} />
      <input type="hidden" name="slug" value={slug} />
      <div>
        <label className="label" htmlFor="service_id">Service</label>
        <select id="service_id" name="service_id" className="input">
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {inr(s.price)}
            </option>
          ))}
          {!services.length && <option value="">Consultation</option>}
        </select>
      </div>
      <div>
        <span className="label">Visit type</span>
        <div className="grid grid-cols-2 gap-2">
          {homeVisits && (
            <label className={`chip cursor-pointer justify-center py-2 ${mode === "home" ? "chip-active" : ""}`}>
              <input type="radio" name="mode" value="home" className="sr-only" checked={mode === "home"} onChange={() => setMode("home")} />
              Home visit
            </label>
          )}
          {studioVisits && (
            <label className={`chip cursor-pointer justify-center py-2 ${mode === "studio" ? "chip-active" : ""}`}>
              <input type="radio" name="mode" value="studio" className="sr-only" checked={mode === "studio"} onChange={() => setMode("studio")} />
              Studio visit
            </label>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" min={today} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="time">Time</label>
          <input id="time" name="time" type="time" min="08:00" max="21:00" step={1800} required className="input" defaultValue="11:00" />
        </div>
      </div>
      {mode === "home" && (
        <div>
          <label className="label" htmlFor="address">Address</label>
          <textarea id="address" name="address" rows={2} className="input" placeholder="Flat, building, area" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" className="input" defaultValue={defaultPhone} placeholder="98xxxxxxxx" />
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" rows={2} className="input" placeholder="Fabric, reference, urgency…" />
      </div>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      {signedIn ? (
        <SubmitButton className="w-full py-3" pendingText="Sending…">Request booking</SubmitButton>
      ) : (
        <Link href={`/login?next=/designers/${slug}`} className="btn-primary w-full py-3">
          Log in to book
        </Link>
      )}
      <p className="text-center text-xs text-ink-500">No payment now — pay the studio at your visit.</p>
    </form>
  );
}
