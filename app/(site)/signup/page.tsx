import type { Metadata } from "next";
import { SignupForm } from "../login/AuthForms";

export const metadata: Metadata = { title: "Join Snip" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const isDesigner = role === "designer";
  return (
    <div className="container grid min-h-[70vh] place-items-center py-14">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-3xl">{isDesigner ? "Join Snip as a professional" : "Create your Snip account"}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">
          {isDesigner
            ? "Get a verified profile, bookings and a free studio CRM."
            : "Book verified tailors and designers near you."}
        </p>
        <SignupForm initialRole={isDesigner ? "designer" : "customer"} />
      </div>
    </div>
  );
}
