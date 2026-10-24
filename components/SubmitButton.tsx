"use client";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  pendingText = "Saving…",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" disabled={pending || rest.disabled} className={cn("btn-primary", className)}>
      {pending ? pendingText : children}
    </button>
  );
}
