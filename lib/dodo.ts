import "server-only";

/** Minimal Dodo Payments REST client (subscriptions for designer plans). */
export const dodoConfigured = Boolean(
  process.env.DODO_PAYMENTS_API_KEY &&
    process.env.DODO_PRODUCT_PREMIUM &&
    process.env.DODO_PRODUCT_PRIORITY,
);

function baseUrl() {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

async function dodo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Dodo ${path} → ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export function productFor(plan: "premium" | "priority") {
  return plan === "premium" ? process.env.DODO_PRODUCT_PREMIUM! : process.env.DODO_PRODUCT_PRIORITY!;
}

export function planForProduct(productId: string | undefined | null): "premium" | "priority" | null {
  if (!productId) return null;
  if (productId === process.env.DODO_PRODUCT_PREMIUM) return "premium";
  if (productId === process.env.DODO_PRODUCT_PRIORITY) return "priority";
  return null;
}

export async function createCheckout(opts: {
  plan: "premium" | "priority";
  studioId: string;
  email: string;
  name: string;
  returnUrl: string;
}) {
  return dodo<{ checkout_url: string; session_id: string }>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_cart: [{ product_id: productFor(opts.plan), quantity: 1 }],
      customer: { email: opts.email, name: opts.name },
      billing_address: { country: "IN" },
      return_url: opts.returnUrl,
      metadata: { studio_id: opts.studioId, plan: opts.plan },
    }),
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return dodo(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ cancel_at_next_billing_date: true }),
  });
}
