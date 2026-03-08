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
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const reviews = (data ?? []) as Array<Omit<Review, "profiles"> & { user_id: string }>;

      // Fetch profiles for review authors
      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      if (userIds.length === 0) return [] as Review[];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      );

      return reviews.map((r) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || undefined,
      })) as Review[];
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
