import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Money is stored as whole rupees. */
export function inr(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60);
}

/** Indian numbers: keep digits, default to +91 when 10 digits. */
export function normalizePhone(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsappLink(phone: string | null | undefined, text: string) {
  const p = normalizePhone(phone);
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export function gmailLink(to: string | null | undefined, subject: string, body: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: to ?? "", su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const CATEGORIES = [
  "Alterations",
  "Blouses",
  "Dresses",
  "Suits",
  "Bridal",
  "Menswear",
  "Custom stitching",
] as const;

export const ORDER_STAGES = [
  { key: "received", label: "Received" },
  { key: "cutting", label: "Cutting" },
  { key: "stitching", label: "Stitching" },
  { key: "trial", label: "Trial" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["key"];

export const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  priority: "Priority",
};

export const MEASUREMENT_FIELDS = [
  "Bust / Chest",
  "Waist",
  "Hip",
  "Shoulder",
  "Sleeve length",
  "Armhole",
  "Neck (front)",
  "Neck (back)",
  "Blouse length",
  "Kurta length",
  "Inseam",
  "Bottom length",
] as const;
