import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OwnerListing {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  photos: string[] | null;
  property_type: string;
  status: string;
  created_at: string;
  bedrooms: number;
  capacity: number;
}

export interface OwnerBooking {
  id: string;
  listing_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  status: string;
  created_at: string;
}

export function useOwnerListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owner-listings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OwnerListing[];
    },
    enabled: !!user,
  });
}

export function useOwnerBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owner-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get bookings for listings owned by the user
      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("user_id", user.id);
      
      if (!listings || listings.length === 0) return [];
      
      const listingIds = listings.map((l) => l.id);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OwnerBooking[];
    },
    enabled: !!user,
  });
}

export function useGuestBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["guest-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("guest_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OwnerBooking[];
    },
    enabled: !!user,
  });
}
