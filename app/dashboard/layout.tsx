import Link from "next/link";
import { CalendarCheck, ClipboardList, CreditCard, ExternalLink, LayoutDashboard, Store, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import { requireStudio } from "@/lib/dashboard";

const nav = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/bookings", "Bookings", CalendarCheck],
  ["/dashboard/clients", "Clients", Users],
  ["/dashboard/orders", "Orders", ClipboardList],
  ["/dashboard/profile", "Studio profile", Store],
  ["/dashboard/billing", "Plan & billing", CreditCard],
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { studio } = await requireStudio();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-ink/10 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Logo />
          <form action="/auth/signout" method="post" className="lg:hidden">
            <button className="text-xs text-ink-500">Log out</button>
          </form>
        </div>
        <div className="px-5 pb-4">
          <p className="truncate font-bold">{studio.name}</p>
          <div className="mt-1 flex gap-1.5">
            <StatusBadge status={studio.status} />
            <StatusBadge status={studio.plan} />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ivory-100 hover:text-ink">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          <Link href={`/designers/${studio.slug}`} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-maroon hover:bg-maroon-50">
            <ExternalLink className="h-4 w-4" /> View public page
          </Link>
        </nav>
        <form action="/auth/signout" method="post" className="absolute bottom-5 left-5 hidden lg:block">
          <button className="text-sm text-ink-500 hover:text-ink">Log out</button>
        </form>
      </aside>
      <main className="min-w-0 bg-ivory px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
