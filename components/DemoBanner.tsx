import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-ivory">
      Demo mode — showing sample Delhi studios. Sign-up, bookings and the studio CRM switch on once Supabase is connected.
    </div>
  );
}
