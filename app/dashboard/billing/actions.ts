"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireStudio } from "@/lib/dashboard";
import { cancelSubscription, createCheckout, dodoConfigured } from "@/lib/dodo";

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

export async function startCheckout(form: FormData) {
  const plan = form.get("plan") === "priority" ? "priority" : "premium";
  const { studio, profile } = await requireStudio();
  if (!dodoConfigured) redirect("/dashboard/billing?error=not-configured");
  let url: string;
  try {
    const session = await createCheckout({
      plan,
      studioId: studio.id,
      email: profile.email ?? studio.email ?? "",
      name: profile.full_name ?? studio.name,
      returnUrl: `${await siteUrl()}/dashboard/billing?checkout=done`,
    });
    url = session.checkout_url;
  } catch (e) {
    console.error(e);
    redirect("/dashboard/billing?error=checkout");
  }
  redirect(url);
}

export async function cancelPlan() {
  const { studio } = await requireStudio();
  if (studio.dodo_subscription_id) {
    try {
      await cancelSubscription(studio.dodo_subscription_id);
    } catch (e) {
      console.error(e);
      redirect("/dashboard/billing?error=cancel");
    }
  }
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/billing?cancelled=1");
}
