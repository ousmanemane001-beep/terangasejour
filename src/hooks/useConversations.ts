import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Conversation {
  id: string;
  listing_id: string;
  guest_id: string;
  host_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
    enabled: !!user,
  });
}

export function useMessages(conversationId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, qc]);

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!conversationId,
    refetchInterval: 10000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, senderId, content }: {
      conversationId: string; senderId: string; content: string;
    }) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      } as any);
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() } as any).eq("id", conversationId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, guestId, hostId }: {
      listingId: string; guestId: string; hostId: string;
    }) => {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("guest_id", guestId)
        .maybeSingle();
      if (existing) return existing as { id: string };
      const { data, error } = await supabase
        .from("conversations")
        .insert({ listing_id: listingId, guest_id: guestId, host_id: hostId } as any)
        .select("id")
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
