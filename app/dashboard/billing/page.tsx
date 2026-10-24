import { Check } from "lucide-react";
import { requireStudio } from "@/lib/dashboard";
import { dodoConfigured } from "@/lib/dodo";
import { PLAN_LABEL, formatDate } from "@/lib/utils";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { cancelPlan, startCheckout } from "./actions";

const PLANS = [
  { key: "premium", price: 499, perks: ["“Featured” badge", "Ranked above free profiles", "Up to 8 photos"] },
  { key: "priority", price: 999, perks: ["Everything in Premium", "Top placement on Discover", "Highlighted map pin"] },
] as const;

const errors: Record<string, string> = {
  "not-configured": "Payments aren't set up yet (missing Dodo keys). Ask the Snip admin.",
  checkout: "Couldn't start checkout. Please try again in a minute.",
  cancel: "Couldn't cancel the subscription. Please contact support.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkout?: string; cancelled?: string }>;
}) {
  const sp = await searchParams;
  const { studio } = await requireStudio();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl">Plan &amp; billing</h1>
      <div className="mt-4 space-y-3">
        {sp.error && <Notice kind="error">{errors[sp.error] ?? "Something went wrong."}</Notice>}
        {sp.checkout && <Notice kind="success">Thanks! Your plan updates as soon as the payment is confirmed (usually a few seconds). Refresh to see it.</Notice>}
        {sp.cancelled && <Notice>Your plan will stay active until the end of the current billing period.</Notice>}
        {!dodoConfigured && <Notice>Payments are in setup mode. Upgrades become available once Dodo Payments is connected.</Notice>}
      </div>

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Current plan</p>
          <p className="mt-1 text-2xl font-extrabold">{PLAN_LABEL[studio.plan]}</p>
          {studio.plan_renews_at && <p className="text-sm text-ink-500">Renews {formatDate(studio.plan_renews_at)}</p>}
        </div>
        {studio.plan !== "free" && studio.dodo_subscription_id && (
          <form action={cancelPlan}>
            <button className="btn-secondary btn-sm">Cancel at period end</button>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {PLANS.map((p) => {
          const current = studio.plan === p.key;
          return (
            <div key={p.key} className={`card flex flex-col p-6 ${p.key === "priority" ? "border-maroon ring-2 ring-maroon/15" : ""}`}>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-maroon">{PLAN_LABEL[p.key]}</p>
              <p className="mt-2 text-4xl font-extrabold">₹{p.price}<span className="text-base font-medium text-ink-500">/month</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.perks.map((perk) => <li key={perk} className="flex gap-2"><Check className="h-4 w-4 text-jade" /> {perk}</li>)}
              </ul>
              <form action={startCheckout} className="mt-6">
                <input type="hidden" name="plan" value={p.key} />
                <SubmitButton className="w-full" disabled={current || !dodoConfigured} pendingText="Opening checkout…">
                  {current ? "Current plan" : `Upgrade to ${PLAN_LABEL[p.key]}`}
                </SubmitButton>
              </form>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-ink-500">Billed monthly in INR via Dodo Payments. Cancel anytime.</p>
    </div>
  );
}
