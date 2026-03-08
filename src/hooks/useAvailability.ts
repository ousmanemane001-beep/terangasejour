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
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in, check_out")
        .eq("listing_id", listingId)
        .in("status", ["confirmed", "pending"]);
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
