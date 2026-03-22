import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Dispute {
  id: string;
  booking_id: string;
  reporter_id: string;
  host_id: string;
  problem_type: string;
  description: string;
  urgency: string;
  status: string;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyDisputes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-disputes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("disputes" as any)
        .select("*")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Dispute[];
    },
    enabled: !!user,
  });
}

export function useAllDisputes() {
  return useQuery({
    queryKey: ["all-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Dispute[];
    },
  });
}

export function useCreateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      booking_id: string;
      reporter_id: string;
      host_id: string;
      problem_type: string;
      description: string;
      urgency: string;
    }) => {
      const { data, error } = await supabase
        .from("disputes" as any)
        .insert(params as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Dispute;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-disputes"] });
      qc.invalidateQueries({ queryKey: ["all-disputes"] });
    },
  });
}

export function useUpdateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; admin_notes?: string; resolution?: string }) => {
      const { error } = await supabase
        .from("disputes" as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-disputes"] });
      qc.invalidateQueries({ queryKey: ["my-disputes"] });
    },
  });
}
