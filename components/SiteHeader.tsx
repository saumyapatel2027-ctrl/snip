import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { getCurrentProfile, homeFor } from "@/lib/auth";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-600 lg:flex">
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/discover" className="hover:text-ink">Find a designer</Link>
          <Link href="/for-designers" className="hover:text-ink">For designers</Link>
          <Link href="/#why" className="hover:text-ink">Why Snip</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {profile ? (
            <>
              <Link href={homeFor(profile.role)} className="text-sm font-semibold text-maroon">
                {profile.role === "designer" ? "My studio" : profile.role === "admin" ? "Admin" : "My bookings"}
              </Link>
              <form action="/auth/signout" method="post">
                <button className="hidden text-sm text-ink-500 hover:text-ink sm:block">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signup?role=designer" className="hidden text-sm font-semibold text-maroon sm:block">
                Join as a designer
              </Link>
              <Link href="/login" className="hidden text-sm text-ink-600 hover:text-ink md:block">Log in</Link>
            </>
          )}
          <Link href="/discover" className="btn-primary">
            Book a service <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
