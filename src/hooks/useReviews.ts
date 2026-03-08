import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  owner_reply: string | null;
  owner_reply_at: string | null;
  created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

export interface ListingRating {
  avg: number | null;
  count: number;
}

/* ── Fetch reviews for a listing ── */
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

      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      if (userIds.length === 0) return [] as Review[];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      return reviews.map((r) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || undefined,
      })) as Review[];
    },
    enabled: !!listingId,
  });
}

/* ── Fetch average rating for a listing ── */
export function useListingRating(listingId: string | undefined) {
  return useQuery({
    queryKey: ["listing-rating", listingId],
    queryFn: async (): Promise<ListingRating> => {
      if (!listingId) return { avg: null, count: 0 };
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("listing_id", listingId);
      if (error) throw error;
      const ratings = data ?? [];
      if (ratings.length === 0) return { avg: null, count: 0 };
      const sum = ratings.reduce((s, r) => s + r.rating, 0);
      return { avg: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
    },
    enabled: !!listingId,
  });
}

/* ── Batch fetch ratings for multiple listings ── */
export function useListingsRatings(listingIds: string[]) {
  return useQuery({
    queryKey: ["listings-ratings", listingIds.sort().join(",")],
    queryFn: async (): Promise<Record<string, ListingRating>> => {
      if (listingIds.length === 0) return {};
      const { data, error } = await supabase
        .from("reviews")
        .select("listing_id, rating")
        .in("listing_id", listingIds);
      if (error) throw error;
      const map: Record<string, { sum: number; count: number }> = {};
      for (const r of data ?? []) {
        if (!map[r.listing_id]) map[r.listing_id] = { sum: 0, count: 0 };
        map[r.listing_id].sum += r.rating;
        map[r.listing_id].count += 1;
      }
      const result: Record<string, ListingRating> = {};
      for (const [id, v] of Object.entries(map)) {
        result[id] = { avg: Math.round((v.sum / v.count) * 10) / 10, count: v.count };
      }
      return result;
    },
    enabled: listingIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

/* ── Check if user can review (has completed booking) ── */
export function useCanReview(listingId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["can-review", listingId, userId],
    queryFn: async () => {
      if (!listingId || !userId) return { canReview: false, reason: "" };

      // Check if user already reviewed
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) return { canReview: false, reason: "Vous avez déjà laissé un avis." };

      // Check if user has a completed booking with checkout in the past
      const today = new Date().toISOString().split("T")[0];
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("listing_id", listingId)
        .eq("guest_id", userId)
        .lte("check_out", today)
        .limit(1)
        .maybeSingle();

      if (!booking) return { canReview: false, reason: "Seuls les voyageurs ayant séjourné peuvent laisser un avis." };
      return { canReview: true, reason: "" };
    },
    enabled: !!listingId && !!userId,
  });
}

/* ── Create review ── */
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
      qc.invalidateQueries({ queryKey: ["listing-rating", vars.listing_id] });
      qc.invalidateQueries({ queryKey: ["can-review", vars.listing_id, vars.user_id] });
    },
  });
}

/* ── Owner reply to review ── */
export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string; listingId: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ owner_reply: reply, owner_reply_at: new Date().toISOString() } as any)
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.listingId] });
    },
  });
}
