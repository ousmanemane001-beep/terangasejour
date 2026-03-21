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
  payment_method: string;
  payment_status: string;
  created_at: string;
  expires_at: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  passport_number: string | null;
  nationality: string | null;
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
      payment_method?: string;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking as any)
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booked-dates"] });
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
