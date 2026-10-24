import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { Notice } from "@/components/Notice";
import { LoginForm } from "./AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; demo?: string; error?: string }>;
}) {
  const { next, demo, error } = await searchParams;
  const profile = await getCurrentProfile();
  if (profile) redirect(next ?? homeFor(profile.role));
  return (
    <div className="container grid min-h-[70vh] place-items-center py-14">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">Log in to manage your bookings or your studio.</p>
        {demo && <div className="mb-4"><Notice>The site is in demo mode, so accounts aren&apos;t switched on yet.</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
        <LoginForm next={next} />
      </div>
    </div>
  );
}
