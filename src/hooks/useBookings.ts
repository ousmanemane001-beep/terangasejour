import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  listing_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  price_per_night: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: {
      listing_id: string;
      guest_id: string;
      check_in: string;
      check_out: string;
      guests: number;
      nights: number;
      price_per_night: number;
      service_fee: number;
      total_price: number;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });
}
