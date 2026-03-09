import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks whether a confirmed booking exists for a given conversation's listing + guest.
 */
export function useConversationBookingStatus(
  listingId: string | undefined,
  guestId: string | undefined
) {
  return useQuery({
    queryKey: ["conv-booking-status", listingId, guestId],
    queryFn: async () => {
      if (!listingId || !guestId) return false;
      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("listing_id", listingId)
        .eq("guest_id", guestId)
        .eq("status", "confirmed")
        .limit(1);
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!listingId && !!guestId,
  });
}
