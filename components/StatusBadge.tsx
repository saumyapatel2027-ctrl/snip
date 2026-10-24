import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  requested: "bg-saffron-50 text-[#8A5A12]",
  pending: "bg-saffron-50 text-[#8A5A12]",
  confirmed: "bg-jade-50 text-jade",
  verified: "bg-jade-50 text-jade",
  completed: "bg-ink/5 text-ink-600",
  declined: "bg-maroon-50 text-maroon",
  rejected: "bg-maroon-50 text-maroon",
  cancelled: "bg-ink/5 text-ink-500",
  free: "bg-ink/5 text-ink-600",
  premium: "bg-saffron-50 text-[#8A5A12]",
  priority: "bg-maroon text-ivory",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("badge", styles[status] ?? "bg-ink/5 text-ink-600")}>{status}</span>;
}
