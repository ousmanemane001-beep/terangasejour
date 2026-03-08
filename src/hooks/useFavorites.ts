import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*, listings(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useIsFavorite(listingId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite", user?.id, listingId],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!listingId,
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error("Non connecté");

      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        return { added: false };
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
        return { added: true };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite"] });
    },
  });
}
