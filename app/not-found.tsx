import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-4 text-4xl">This page slipped a stitch.</h1>
        <p className="mt-3 text-ink-500">The page you were looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary mt-8">Back to Snip</Link>
      </div>
    </main>
  );
}
