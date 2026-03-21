import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SeasonalPrice {
  id: string;
  listing_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  created_at: string;
}

export function useSeasonalPrices(listingId: string | undefined) {
  return useQuery({
    queryKey: ["seasonal-prices", listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from("seasonal_prices" as any)
        .select("*")
        .eq("listing_id", listingId)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as SeasonalPrice[];
    },
    enabled: !!listingId,
  });
}

export function useAddSeasonalPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (price: Omit<SeasonalPrice, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("seasonal_prices" as any)
        .insert(price as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["seasonal-prices", vars.listing_id] });
    },
  });
}

export function useDeleteSeasonalPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listingId }: { id: string; listingId: string }) => {
      const { error } = await supabase
        .from("seasonal_prices" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return listingId;
    },
    onSuccess: (listingId) => {
      qc.invalidateQueries({ queryKey: ["seasonal-prices", listingId] });
    },
  });
}

/** Get the effective price for a given date, falling back to base price */
export function getEffectivePrice(
  date: Date,
  basePricePerNight: number,
  seasonalPrices: SeasonalPrice[]
): { price: number; seasonName?: string } {
  const dateStr = date.toISOString().split("T")[0];
  const match = seasonalPrices.find(
    (sp) => dateStr >= sp.start_date && dateStr <= sp.end_date
  );
  if (match) return { price: match.price_per_night, seasonName: match.season_name };
  return { price: basePricePerNight };
}
