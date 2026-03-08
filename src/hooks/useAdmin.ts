import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, any>;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.read).length || 0;
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from("notifications")
        .update({ read: true } as any)
        .eq("id", notificationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notification: {
      user_id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from("notifications")
        .insert(notification as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export interface BookingRequest {
  id: string;
  listing_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  message: string | null;
  status: string;
  host_response: string | null;
  created_at: string;
}

export function useBookingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["booking-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get requests for listings owned by user
      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id);
      if (!listings || listings.length === 0) return [];
      const ids = listings.map((l) => l.id);
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .in("listing_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookingRequest[];
    },
    enabled: !!user,
  });
}

export function useMyBookingRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-booking-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("guest_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookingRequest[];
    },
    enabled: !!user,
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, status, response }: {
      requestId: string; status: "approved" | "rejected"; response?: string;
    }) => {
      const { error } = await supabase
        .from("booking_requests")
        .update({ status, host_response: response || null, updated_at: new Date().toISOString() } as any)
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-requests"] });
    },
  });
}
