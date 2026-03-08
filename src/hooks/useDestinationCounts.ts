import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDestinationCounts(cities: string[]) {
  return useQuery({
    queryKey: ["destination-counts", cities],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("location")
        .eq("status", "published");

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const city of cities) {
        counts[city.toLowerCase()] = 0;
      }

      for (const listing of data ?? []) {
        const loc = (listing.location ?? "").toLowerCase();
        for (const city of cities) {
          if (loc.includes(city.toLowerCase())) {
            counts[city.toLowerCase()]++;
          }
        }
      }

      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });
}
