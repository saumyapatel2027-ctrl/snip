import Link from "next/link";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Explore",
    links: [
      ["Find a designer", "/discover"],
      ["How it works", "/#how"],
      ["Services", "/discover"],
      ["FAQ", "/#faq"],
    ],
  },
  {
    title: "For professionals",
    links: [
      ["Join Snip", "/signup?role=designer"],
      ["Designer benefits", "/for-designers"],
      ["Verification", "/for-designers#verification"],
      ["Pricing", "/for-designers#pricing"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/#why"],
      ["Contact", "mailto:hello@snip.in"],
      ["Log in", "/login"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ivory/70">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="mt-3 text-sm">Tailoring, reimagined.</p>
          <p className="mt-6 text-xs text-ivory/40">Launching first in Delhi.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ivory">{c.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-ivory">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ivory/10">
        <div className="container py-5 text-xs text-ivory/40">© {new Date().getFullYear()} Snip. All rights reserved.</div>
      </div>
    </footer>
  );
}
