import { NextResponse } from "next/server";
import { requireStudio } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { MEASUREMENT_FIELDS } from "@/lib/utils";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const { studio } = await requireStudio();
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("studio_id", studio.id).order("name");
  const header = ["Name", "Phone", "Email", "Address", "Notes", ...MEASUREMENT_FIELDS, "Added"];
  const rows = (data ?? []).map((c) => [
    c.name, c.phone, c.email, c.address, c.notes,
    ...MEASUREMENT_FIELDS.map((f) => (c.measurements as Record<string, string>)?.[f] ?? ""),
    c.created_at?.slice(0, 10),
  ]);
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="snip-clients-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
