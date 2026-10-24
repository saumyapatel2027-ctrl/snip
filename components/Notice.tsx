import { cn } from "@/lib/utils";

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        kind === "error" && "bg-maroon-50 text-maroon",
        kind === "success" && "bg-jade-50 text-jade",
        kind === "info" && "bg-saffron-50 text-[#8A5A12]",
      )}
    >
      {children}
    </div>
  );
}
