import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sniptailor.online";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Snip — Your perfect fit, just a booking away", template: "%s · Snip" },
  description:
    "Discover verified tailors, boutiques and emerging designers near you in Delhi. Book alterations, stitching, measurements and home visits.",
  openGraph: {
    title: "Snip — Tailoring, reimagined",
    description: "Discover and book verified tailors, boutiques and designers near you.",
    images: ["/img/hero.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#5C1A2C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
