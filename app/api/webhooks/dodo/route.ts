import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForProduct } from "@/lib/dodo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DodoEvent = {
  type: string;
  data: {
    subscription_id?: string;
    product_id?: string;
    status?: string;
    next_billing_date?: string;
    metadata?: Record<string, string>;
    customer?: { customer_id?: string; email?: string };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  const body = await req.text();
  let event: DodoEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    }) as DodoEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const d = event.data ?? {};
  const studioId = d.metadata?.studio_id;
  const supabase = createAdminClient();

  // Find the studio: by metadata on first events, by subscription id afterwards.
  let id = studioId ?? null;
  if (!id && d.subscription_id) {
    const { data } = await supabase.from("studios").select("id").eq("dodo_subscription_id", d.subscription_id).maybeSingle();
    id = data?.id ?? null;
  }
  if (!id) return NextResponse.json({ ok: true, skipped: "no studio" });

  const plan = planForProduct(d.product_id) ?? (d.metadata?.plan as "premium" | "priority" | undefined) ?? null;

  if (["subscription.active", "subscription.renewed", "subscription.plan_changed"].includes(event.type) && plan) {
    await supabase
      .from("studios")
      .update({
        plan,
        dodo_subscription_id: d.subscription_id ?? null,
        dodo_customer_id: d.customer?.customer_id ?? null,
        plan_renews_at: d.next_billing_date ?? null,
      })
      .eq("id", id);
  } else if (["subscription.cancelled", "subscription.expired", "subscription.failed"].includes(event.type)) {
    // "cancelled" with cancel_at_next_billing_date still runs to period end; Dodo sends expired at the end.
    if (event.type !== "subscription.cancelled" || d.status !== "active") {
      await supabase.from("studios").update({ plan: "free", plan_renews_at: null }).eq("id", id);
    }
  } else if (event.type === "subscription.on_hold") {
    await supabase.from("studios").update({ plan: "free" }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
