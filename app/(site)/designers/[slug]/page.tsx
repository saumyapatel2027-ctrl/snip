import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, BadgeCheck, Clock, Home, Mail, MapPin, Phone, Sparkles, Store } from "lucide-react";
import { getStudioBySlug } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { formatDate, inr } from "@/lib/utils";
import { Stars } from "@/components/Stars";
import { StudioCover } from "@/components/StudioCover";
import { StudioMap } from "@/components/StudioMap";
import { BookingForm } from "./BookingForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getStudioBySlug(slug);
  if (!s) return { title: "Studio not found" };
  return {
    title: `${s.name} — ${s.kind} in ${s.area ?? s.city}`,
    description: s.tagline ?? s.bio ?? undefined,
    openGraph: s.cover_url ? { images: [s.cover_url] } : undefined,
  };
}

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const [studio, profile] = await Promise.all([getStudioBySlug(slug), getCurrentProfile()]);
  if (!studio) notFound();

  const pending = studio.status !== "verified";
  const gallery = studio.photos.filter((p) => p !== studio.cover_url);

  return (
    <div className="container py-10">
      {pending && (
        <div className="mb-6 rounded-xl bg-saffron-50 px-4 py-3 text-sm text-[#8A5A12]">
          This profile is <strong>{studio.status}</strong> — only you and Snip admins can see it until it&apos;s verified.
        </div>
      )}
      <Link href="/discover" className="text-sm text-ink-500 hover:text-ink">← All studios</Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="grid gap-3 overflow-hidden rounded-3xl sm:grid-cols-[2fr_1fr]">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl sm:rounded-none">
              <StudioCover name={studio.name} url={studio.cover_url} />
            </div>
            {gallery.length > 0 && (
              <div className="hidden gap-3 sm:grid">
                {gallery.slice(0, 2).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p} src={p} alt="" className="h-full w-full object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-jade-50 text-jade"><BadgeCheck className="mr-1 h-3 w-3" /> Snip verified</span>
                {studio.plan !== "free" && (
                  <span className="badge bg-maroon text-ivory"><Sparkles className="mr-1 h-3 w-3" /> Featured</span>
                )}
                {studio.snip_code && <span className="font-mono text-xs text-ink-500">{studio.snip_code}</span>}
              </div>
              <h1 className="mt-3 text-4xl sm:text-5xl">{studio.name}</h1>
              <p className="mt-2 text-ink-600">
                {studio.kind} · <MapPin className="inline h-4 w-4" /> {studio.area ?? studio.city}
              </p>
            </div>
            <div className="text-right">
              <Stars rating={studio.rating} count={studio.review_count} />
              <p className="mt-1 text-sm text-ink-500">Starts at <strong className="text-ink">{inr(studio.starting_price)}</strong></p>
            </div>
          </div>

          {studio.tagline && <p className="mt-6 text-xl font-semibold">{studio.tagline}</p>}
          {studio.bio && <p className="mt-3 whitespace-pre-line text-ink-600">{studio.bio}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            {studio.categories.map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
            {studio.home_visits && <span className="chip text-jade"><Home className="h-3.5 w-3.5" /> Home visits</span>}
            {studio.studio_visits && <span className="chip"><Store className="h-3.5 w-3.5" /> Studio visits</span>}
          </div>

          <h2 className="mt-12 text-2xl">Services &amp; prices</h2>
          <div className="card mt-4 divide-y divide-ink/5">
            {studio.services.length ? (
              studio.services.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    {s.description && <p className="text-sm text-ink-500">{s.description}</p>}
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                      <Clock className="h-3 w-3" /> ~{s.duration_mins} min visit
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-bold">{inr(s.price)}</p>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-ink-500">Services coming soon. Book a consultation to discuss your needs.</p>
            )}
          </div>

          {studio.lat != null && studio.lng != null && (
            <>
              <h2 className="mt-12 text-2xl">Location</h2>
              <p className="mt-1 text-sm text-ink-500">{studio.address}</p>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-ink/10">
                <StudioMap
                  height={280}
                  points={[{ slug: studio.slug, name: studio.name, lat: studio.lat, lng: studio.lng, kind: studio.kind, starting_price: studio.starting_price }]}
                />
              </div>
            </>
          )}

          <h2 className="mt-12 text-2xl">Reviews</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {studio.reviews.length ? (
              studio.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{r.author_name ?? "Snip customer"}</p>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
                  <p className="mt-3 text-xs text-ink-300">{formatDate(r.created_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-500">No reviews yet. Reviews unlock after a completed booking.</p>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="text-lg font-bold">Book {studio.name}</p>
            <p className="mb-5 text-sm text-ink-500">Pick a service and a slot. The studio confirms.</p>
            <BookingForm
              studioId={studio.id}
              slug={studio.slug}
              services={studio.services}
              homeVisits={studio.home_visits}
              studioVisits={studio.studio_visits}
              signedIn={Boolean(profile)}
              defaultPhone={profile?.phone ?? ""}
            />
          </div>
          <div className="card mt-4 space-y-2 p-5 text-sm">
            {studio.phone && (
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-500" /> {studio.phone}</p>
            )}
            {studio.email && (
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-500" /> {studio.email}</p>
            )}
            {studio.instagram && (
              <a href={`https://instagram.com/${studio.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-maroon">
                <AtSign className="h-4 w-4 text-ink-500" /> {studio.instagram}
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
