import { cn } from "@/lib/utils";

const palettes = [
  "from-maroon to-maroon-400",
  "from-[#7A4A2A] to-saffron",
  "from-jade to-[#4C8C76]",
  "from-ink-600 to-maroon-400",
];

/** Cover photo, or a monogram tile when a studio hasn't uploaded one. */
export function StudioCover({
  name,
  url,
  className,
}: {
  name: string;
  url: string | null | undefined;
  className?: string;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={cn("h-full w-full object-cover", className)} />;
  }
  const i = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className={cn("grid h-full w-full place-items-center bg-gradient-to-br text-ivory", palettes[i], className)}>
      <span className="font-display text-4xl font-extrabold tracking-widest opacity-90">{initials}</span>
    </div>
  );
}
