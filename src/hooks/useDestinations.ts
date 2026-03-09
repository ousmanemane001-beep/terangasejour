import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbDestination {
  id: string;
  name: string;
  category: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  description: string | null;
}

export function useDestinations(search?: string) {
  return useQuery({
    queryKey: ["destinations", search ?? ""],
    queryFn: async () => {
      let query = supabase
        .from("destinations")
        .select("*")
        .order("name");

      if (search && search.trim().length > 0) {
        query = query.or(`name.ilike.%${search}%,region.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data ?? []) as DbDestination[];
    },
  });
}

export function usePopularDestinations() {
  return useQuery({
    queryKey: ["popular-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("category", "ville")
        .in("name", ["Dakar", "Saly", "Saint-Louis", "Cap Skirring", "Somone", "Mbour"])
        .order("name");
      if (error) throw error;
      return (data ?? []) as DbDestination[];
    },
  });
}
