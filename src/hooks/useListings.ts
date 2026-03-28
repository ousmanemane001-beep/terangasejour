import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBListing {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  location: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  price_per_night: number;
  photos: string[] | null;
  status: string;
  verified: boolean;
  created_at: string;
  user_id: string;
  booking_mode: string;
  availability_mode: string;
  cancellation_policy: string;
  admin_remark: string | null;
}

export function useListings(limit?: number) {
  return useQuery({
    queryKey: ["listings", limit],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DBListing[];
    },
    staleTime: 1000 * 60 * 2, // 2 min cache
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as DBListing | null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
