import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, BookOpen, Check, ClipboardList, MessageCircle, Ruler, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = { title: "For designers & boutiques" };

const plans = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    blurb: "Everything you need to get started.",
    features: ["Verified Snip profile", "Bookings from customers", "Studio CRM: clients, measurements, orders", "WhatsApp & Gmail templates"],
  },
  {
    key: "premium",
    name: "Premium",
    price: "₹499",
    blurb: "Stand out when customers browse.",
    features: ["Everything in Free", "“Featured” badge on your profile", "Ranked above free profiles", "Gallery of up to 8 photos"],
    highlight: true,
  },
  {
    key: "priority",
    name: "Priority",
    price: "₹999",
    blurb: "Top placement in your area.",
    features: ["Everything in Premium", "Top placement on Discover", "Highlighted map pin", "Priority verification"],
  },
];

export default async function ForDesignersPage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const { upgrade } = await searchParams;
  return (
    <>
      <section className="container grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          {upgrade && (
            <p className="mb-6 rounded-xl bg-saffron-50 px-4 py-3 text-sm text-[#8A5A12]">
              The studio dashboard is for Snip professionals. Create a professional account to get one.
            </p>
          )}
          <p className="eyebrow">For professionals</p>
          <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl">Great designers deserve to be discovered.</h1>
          <p className="mt-5 text-lg text-ink-600">
            A verified profile that brings you bookings—plus a free CRM to run your studio: clients, measurements, an
            order pipeline and dues, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=designer" className="btn-primary px-7 py-3.5">Join Snip as a designer</Link>
            <Link href="#pricing" className="btn-secondary px-7 py-3.5">See plans</Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/designer.jpg" alt="Designer at work" className="aspect-square w-full rounded-3xl object-cover shadow-lift" />
      </section>

      <section className="bg-ivory-100 py-16">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl">A free CRM built for tailoring</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Users, "Client book", "Every customer with contact details and notes."],
              [Ruler, "Measurements", "Saved per client, ready for the next order."],
              [ClipboardList, "Order pipeline", "Received → cutting → stitching → trial → ready → delivered."],
              [MessageCircle, "One-tap messages", "Pre-filled WhatsApp and Gmail updates for every stage."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof Users;
              return (
                <div key={t as string} className="card p-6">
                  <I className="h-6 w-6 text-maroon" />
                  <p className="mt-4 font-bold">{t as string}</p>
                  <p className="mt-1 text-sm text-ink-500">{b as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="verification" className="container grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Verification</p>
          <h2 className="mt-5 text-3xl sm:text-4xl">How you get verified</h2>
          <p className="mt-3 text-ink-600">Customers trust Snip because every profile is checked by a person.</p>
        </div>
        <ol className="space-y-4">
          {[
            [BookOpen, "Create your studio", "Sign up, add your services, prices, photos and drop your map pin."],
            [BadgeCheck, "We verify", "Snip checks your identity, address and portfolio—usually within 48 hours."],
            [Sparkles, "Go live", "Your profile appears on Discover and customers can book you."],
          ].map(([Icon, t, b], i) => {
            const I = Icon as typeof BookOpen;
            return (
              <li key={t as string} className="card flex gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-maroon text-ivory"><I className="h-5 w-5" /></span>
                <div>
                  <p className="font-bold">{i + 1}. {t as string}</p>
                  <p className="text-sm text-ink-500">{b as string}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="pricing" className="container pb-20">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-5 text-3xl sm:text-4xl">Start free. Upgrade when you&apos;re ready.</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.key} className={`card flex flex-col p-7 ${p.highlight ? "border-maroon ring-2 ring-maroon/20" : ""}`}>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-maroon">{p.name}</p>
              <p className="mt-3 text-4xl font-extrabold">{p.price}<span className="text-base font-medium text-ink-500">/month</span></p>
              <p className="mt-2 text-sm text-ink-500">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-jade" /> {f}</li>
                ))}
              </ul>
              <Link href={p.key === "free" ? "/signup?role=designer" : "/dashboard/billing"} className={p.highlight ? "btn-primary mt-6" : "btn-secondary mt-6"}>
                {p.key === "free" ? "Join free" : `Choose ${p.name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
