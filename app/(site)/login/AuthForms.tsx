"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { cn } from "@/lib/utils";
import { login, signup, type AuthState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <SubmitButton className="w-full py-3" pendingText="Logging in…">Log in</SubmitButton>
      <p className="text-center text-sm text-ink-500">
        New to Snip? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-maroon">Create an account</Link>
      </p>
    </form>
  );
}

export function SignupForm({ initialRole }: { initialRole: "customer" | "designer" }) {
  const [state, action] = useActionState<AuthState, FormData>(signup, {});
  const [role, setRole] = useState(initialRole);

  if (state.info) return <Notice kind="success">{state.info}</Notice>;

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-ivory-100 p-1">
        {(["customer", "designer"] as const).map((r) => (
          <label key={r} className={cn("cursor-pointer rounded-full py-2 text-center text-sm font-semibold transition", role === r ? "bg-maroon text-ivory" : "text-ink-600")}>
            <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
            {r === "customer" ? "I want to book" : "I'm a professional"}
          </label>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="full_name">Your name</label>
        <input id="full_name" name="full_name" required className="input" autoComplete="name" />
      </div>
      {role === "designer" && (
        <div>
          <label className="label" htmlFor="studio_name">Studio / boutique name</label>
          <input id="studio_name" name="studio_name" className="input" placeholder="e.g. Aarohi Studio" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="98xxxxxxxx" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={8} required className="input" autoComplete="new-password" />
      </div>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <SubmitButton className="w-full py-3" pendingText="Creating account…">
        {role === "designer" ? "Create my studio" : "Create account"}
      </SubmitButton>
      {role === "designer" && (
        <p className="text-center text-xs text-ink-500">Your studio goes live on Discover once Snip verifies it.</p>
      )}
      <p className="text-center text-sm text-ink-500">
        Already on Snip? <Link href="/login" className="font-semibold text-maroon">Log in</Link>
      </p>
    </form>
  );
}
