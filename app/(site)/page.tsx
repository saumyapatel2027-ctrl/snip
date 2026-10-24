import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { StudioCard } from "@/components/StudioCard";
import { getFeaturedStudios } from "@/lib/data";

export const revalidate = 300;

const faqs = [
  ["Who can join Snip?", "Verified tailors, boutique owners and emerging fashion designers who offer stitching or alteration services."],
  ["Can I book a home visit?", "Yes. Many Snip professionals offer home visits for measurements, fittings and trials. Look for the “Home visits” tag on a profile."],
  ["How are designers verified?", "Every professional goes through identity, address and portfolio checks before their profile goes live on Snip."],
  ["Can I visit the boutique instead?", "Of course. Choose “Studio visit” when you book and you'll get the address and time confirmed by the studio."],
  ["How does Snip make money?", "Booking is free for customers. Professionals can choose optional Premium or Priority plans for more visibility."],
  ["Is Snip available everywhere?", "We're launching first in Delhi, with more cities to follow."],
];

export default async function HomePage() {
  const featured = await getFeaturedStudios(3);

  return (
    <>
      {/* Hero */}
      <section className="container grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.05fr] lg:py-16">
        <div className="animate-rise">
          <p className="eyebrow">Tailoring, reimagined.</p>
          <h1 className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Your perfect fit, just a booking away.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-600">
            Discover verified tailors, boutiques, and emerging designers near you. Book alterations, stitching,
            measurements, and garment care without relying on word-of-mouth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover" className="btn-primary px-7 py-3.5 text-base">
              Find a designer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup?role=designer" className="btn-secondary px-7 py-3.5 text-base">
              Become a Snip designer
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
            {["Verified professionals", "Flexible visits", "Secure bookings"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-jade" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hero.jpg" alt="A designer fitting a maroon blouse in her studio" className="aspect-[4/4.4] w-full object-cover" />
          </div>
          <span className="badge absolute -left-3 top-8 bg-maroon px-4 py-2 text-xs text-ivory shadow-lift">
            Delhi · Early access
          </span>
          <div className="card absolute -bottom-6 left-4 w-64 p-4 sm:left-[-2rem]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-jade">Fitting confirmed</p>
            <p className="mt-1 font-bold">Aarohi Studio</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
              <dt className="text-ink-500">Service</dt>
              <dd className="font-semibold">Blouse alteration</dd>
              <dt className="text-ink-500">Mode</dt>
              <dd className="font-semibold">Home visit</dd>
              <dt className="text-ink-500">Date</dt>
              <dd className="font-semibold">Today · 6:30 PM</dd>
              <dt className="text-ink-500">Status</dt>
              <dd className="font-semibold text-jade">Confirmed ✓</dd>
            </dl>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-ink/10 bg-white/50">
        <div className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [BadgeCheck, "Verified professionals", "Identity and portfolio checked."],
            [Home, "Home visits", "Get measured from the comfort of home."],
            [CalendarCheck, "Transparent booking", "Know who you're booking and what to expect."],
            [MapPin, "Local talent", "Discover creative professionals around you."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof BadgeCheck;
            return (
              <div key={title as string} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
                <div>
                  <p className="font-bold">{title as string}</p>
                  <p className="text-sm text-ink-500">{body as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem */}
      <section id="why" className="container grid gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">A simpler way</p>
          <h2 className="mt-5 text-4xl sm:text-5xl">Finding a good tailor shouldn&apos;t depend on who you know.</h2>
          <p className="mt-5 text-lg text-ink-600">
            Tailoring still runs on personal contacts. That works—until you&apos;re new to a city, away from home, or
            simply looking for someone better.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500">Before</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li>Asking around for “a good darzi”</li>
              <li>No idea of price until you walk in</li>
              <li>Multiple trips for one fitting</li>
              <li>Great talent hidden in back lanes</li>
            </ul>
          </div>
          <div className="card border-maroon/20 bg-maroon p-6 text-ivory">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">With Snip</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Verified profiles with real reviews</li>
              <li>Clear starting prices for every service</li>
              <li>Home visits on your schedule</li>
              <li>Discover studios near you on a map</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works + discover preview */}
      <section id="how" className="bg-ivory-100 py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-5 text-4xl sm:text-5xl">The new way to book tailoring.</h2>
            <p className="mt-4 text-lg text-ink-600">
              A real profile, clear services, and a time that works—before you commit.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [Search, "01", "Discover", "Search by service and area, or tap “Near me” to see studios around you."],
              [Users, "02", "Compare", "Check portfolios, starting prices, verification and reviews."],
              [CalendarCheck, "03", "Book", "Pick a home visit or studio appointment. The studio confirms your slot."],
            ].map(([Icon, n, t, b]) => {
              const I = Icon as typeof Search;
              return (
                <div key={n as string} className="card p-6">
                  <div className="flex items-center justify-between">
                    <I className="h-6 w-6 text-maroon" />
                    <span className="font-display text-3xl font-extrabold text-ink/10">{n as string}</span>
                  </div>
                  <p className="mt-6 text-lg font-bold">{t as string}</p>
                  <p className="mt-1 text-sm text-ink-500">{b as string}</p>
                </div>
              );
            })}
          </div>

          <div className="card mt-10 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink/10 bg-ivory px-5 py-3 text-xs text-ink-500">
              <span className="h-2.5 w-2.5 rounded-full bg-maroon/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-saffron/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-jade/40" />
              <span className="ml-3 font-mono">snip / discover</span>
            </div>
            <div className="p-5 sm:p-8">
              <form action="/discover" className="flex flex-col gap-3 sm:flex-row">
                <input name="q" className="input sm:flex-1" placeholder="What do you need stitched or altered?" />
                <button className="btn-primary">
                  <Search className="h-4 w-4" /> Search Delhi
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Alterations", "Blouses", "Dresses", "Suits", "Custom stitching"].map((c) => (
                  <Link key={c} href={`/discover?category=${encodeURIComponent(c)}`} className="chip hover:border-maroon">
                    {c}
                  </Link>
                ))}
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {featured.map((s) => (
                  <StudioCard key={s.slug} studio={s} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="card mx-auto w-full max-w-sm overflow-hidden">
          <div className="flex items-center justify-between bg-maroon px-5 py-3 text-ivory">
            <span className="font-display font-extrabold tracking-[0.25em]">SNIP.</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron">Snip verified</span>
          </div>
          <div className="flex gap-4 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/designer.jpg" alt="" className="h-20 w-20 rounded-2xl object-cover" />
            <div>
              <p className="text-lg font-bold">Aarohi Mehta</p>
              <p className="text-sm text-ink-500">Emerging fashion designer</p>
            </div>
          </div>
          <ul className="space-y-2 px-5 pb-4 text-sm">
            {["Identity verified", "Address verified", "Portfolio verified"].map((v) => (
              <li key={v} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-jade" /> {v}
              </li>
            ))}
          </ul>
          <p className="border-t border-ink/10 px-5 py-3 font-mono text-xs text-ink-500">SNIP ID · SN-2048</p>
        </div>
        <div>
          <p className="eyebrow">Trust, by design</p>
          <h2 className="mt-5 text-4xl sm:text-5xl">Know who&apos;s behind the needle.</h2>
          <p className="mt-5 text-lg text-ink-600">
            Every Snip professional goes through identity, address, and portfolio verification before joining.
          </p>
          <p className="mt-6 font-bold">One professional. Two identities. Zero guesswork.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip"><Store className="h-3.5 w-3.5" /> Boutique identity</span>
            <span className="chip"><BadgeCheck className="h-3.5 w-3.5 text-jade" /> Snip verified identity</span>
          </div>
        </div>
      </section>

      {/* Your schedule */}
      <section className="bg-ink py-20 text-ivory">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-saffron before:bg-saffron">Made around your life</p>
            <h2 className="mt-5 text-4xl text-ivory sm:text-5xl">Your clothes. Your schedule. Your choice.</h2>
            <div className="mt-8 space-y-5">
              {[
                ["Home visits", "Get measured without leaving home."],
                ["Trusted professionals", "Know exactly who you're booking."],
                ["Flexible service", "Choose the appointment style that works for you."],
              ].map(([t, b]) => (
                <div key={t} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 text-saffron" />
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="text-sm text-ivory/60">{b}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/discover" className="btn mt-10 bg-ivory text-ink hover:bg-white">
              Book your first service <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/customer.jpg" alt="A customer being measured at home" className="aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </section>

      {/* For professionals */}
      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">For professionals</p>
            <h2 className="mt-5 text-4xl sm:text-5xl">Great designers deserve to be discovered.</h2>
            <p className="mt-5 text-lg text-ink-600">
              Reach customers beyond your immediate circle—without spending heavily on marketing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?role=designer" className="btn-primary">Join Snip as a designer</Link>
              <Link href="/for-designers" className="btn-secondary">See designer benefits</Link>
            </div>
            <p className="mt-4 text-sm text-ink-500">
              For independent designers, boutique owners, and tailoring professionals.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              [Search, "Get discovered", "Reach people actively looking for your services."],
              [BadgeCheck, "Build credibility", "Your profile becomes a verified professional identity."],
              [TrendingUp, "Grow consistently", "Receive bookings without depending entirely on referrals."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof Search;
              return (
                <div key={t as string} className="card flex gap-4 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-maroon-50 text-maroon">
                    <I className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">{t as string}</p>
                    <p className="text-sm text-ink-500">{b as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16">
          <p className="eyebrow">Built to grow together</p>
          <h3 className="mt-4 text-3xl">A marketplace built around its professionals.</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Free studio CRM", "Clients, measurements, an order pipeline and dues—free for every Snip professional."],
              ["02", "Premium visibility", "Optional tools that help standout profiles get seen."],
              ["03", "Priority placement", "Promoted placement when customers are browsing."],
            ].map(([n, t, b]) => (
              <div key={n} className="rounded-2xl border border-ink/10 p-6">
                <span className="font-display text-3xl font-extrabold text-maroon">{n}</span>
                <p className="mt-4 font-bold">{t}</p>
                <p className="mt-1 text-sm text-ink-500">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delhi */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-maroon text-ivory">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/final.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="relative grid gap-6 p-8 sm:p-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-saffron before:bg-saffron">Starting local</p>
              <h2 className="mt-5 text-4xl text-ivory sm:text-5xl">We&apos;re launching first in Delhi.</h2>
              <p className="mt-4 max-w-xl text-ivory/75">
                We&apos;re working closely with a curated group of designers and boutiques to build a better tailoring
                experience from the ground up.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span className="badge bg-ivory/15 text-ivory"><Sparkles className="mr-1 h-3 w-3" /> Early access · Delhi</span>
              <Link href="/signup" className="btn bg-ivory text-ink hover:bg-white">Get early access</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container grid gap-10 pb-24 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-5 text-4xl sm:text-5xl">Questions, answered.</h2>
        </div>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {faqs.map(([q, a], i) => (
            <details key={q} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                {q}
                <span className="text-2xl font-normal text-maroon transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-ink/10 bg-ivory-100 py-20 text-center">
        <div className="container max-w-2xl">
          <p className="eyebrow justify-center">Your fit. Your way.</p>
          <h2 className="mt-5 text-4xl sm:text-5xl">The right fit starts with the right person.</h2>
          <p className="mt-4 text-lg text-ink-600">
            Find trusted tailoring and fashion professionals near you—or become one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/discover" className="btn-primary px-7 py-3.5">Find a designer</Link>
            <Link href="/signup?role=designer" className="btn-secondary px-7 py-3.5">Join Snip</Link>
          </div>
        </div>
      </section>
    </>
  );
}
