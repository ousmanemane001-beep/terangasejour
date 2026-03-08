import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlockedDate {
  id: string;
  listing_id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

export function useBlockedDates(listingId: string | undefined) {
  return useQuery({
    queryKey: ["blocked-dates", listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("listing_id", listingId);
      if (error) throw error;
      return (data ?? []) as BlockedDate[];
    },
    enabled: !!listingId,
  });
}

export function useToggleBlockedDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, date, reason }: {
      listingId: string; date: string; reason?: string;
    }) => {
      // Check if already blocked
      const { data: existing } = await supabase
        .from("blocked_dates")
        .select("id")
        .eq("listing_id", listingId)
        .eq("date", date)
        .maybeSingle();
      if (existing) {
        await supabase.from("blocked_dates").delete().eq("id", existing.id);
        return { action: "unblocked" as const };
      } else {
        await supabase.from("blocked_dates").insert({
          listing_id: listingId,
          date,
          reason: reason || null,
        } as any);
        return { action: "blocked" as const };
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["blocked-dates", vars.listingId] });
      qc.invalidateQueries({ queryKey: ["booked-dates", vars.listingId] });
    },
  });
}
