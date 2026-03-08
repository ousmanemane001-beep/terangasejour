import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

export function useReviews(listingId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(first_name, last_name, avatar_url)")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
    enabled: !!listingId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      listing_id: string;
      user_id: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase.from("reviews").insert(review).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.listing_id] });
    },
  });
}
