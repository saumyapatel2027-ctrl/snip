import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display text-xl font-extrabold tracking-[0.25em]",
        light ? "text-ivory" : "text-ink",
        className,
      )}
    >
      SNIP<span className={light ? "text-saffron" : "text-maroon"}>.</span>
    </Link>
  );
}
