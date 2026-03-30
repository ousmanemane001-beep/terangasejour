import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookedRange {
  check_in: string;
  check_out: string;
}

export function useBookedDates(listingId: string | undefined) {
  return useQuery({
    queryKey: ["booked-dates", listingId],
    queryFn: async () => {
      if (!listingId) return [];
      // Only block dates for confirmed bookings or paid pending bookings
      // Exclude expired pending bookings that were never paid
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in, check_out, status, payment_status, expires_at")
        .eq("listing_id", listingId)
        .in("status", ["confirmed", "pending"]);
      if (error) throw error;
      
      const now = new Date().toISOString();
      const validBookings = (data ?? []).filter((b: any) => {
        // Always include confirmed bookings
        if (b.status === "confirmed") return true;
        // For pending bookings: only include if paid OR not yet expired
        if (b.status === "pending") {
          if (b.payment_status === "paid") return true;
          // If has expiry and it's passed, exclude (stale booking)
          if (b.expires_at && b.expires_at < now) return false;
          // Active pending booking (within hold period) — still block
          return true;
        }
        return false;
      });
      
      return validBookings.map((b: any) => ({
        check_in: b.check_in,
        check_out: b.check_out,
      })) as BookedRange[];
      if (error) throw error;
      return (data ?? []) as BookedRange[];
    },
    enabled: !!listingId,
  });
}

export function getDisabledDates(bookedRanges: BookedRange[], blockedDates?: string[]): Date[] {
  const disabled: Date[] = [];
  for (const range of bookedRanges) {
    const start = new Date(range.check_in);
    const end = new Date(range.check_out);
    const current = new Date(start);
    while (current <= end) {
      disabled.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  if (blockedDates) {
    for (const d of blockedDates) {
      disabled.push(new Date(d + "T00:00:00"));
    }
  }
  return disabled;
}
