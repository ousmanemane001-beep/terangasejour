import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { data } = body;

    if (!data) {
      return new Response(JSON.stringify({ error: "No data" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { status, custom_data, invoice } = data;
    const bookingId = custom_data?.booking_id;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "No booking_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (status === "completed") {
      // Payment successful — confirm the booking
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) {
        console.error("IPN update error:", error);
        return new Response(JSON.stringify({ error: "Update failed" }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // Notify the guest
      const { data: booking } = await supabase
        .from("bookings")
        .select("guest_id, listing_id, total_price")
        .eq("id", bookingId)
        .single();

      if (booking) {
        await supabase.rpc("create_notification", {
          _user_id: booking.guest_id,
          _type: "payment_confirmed",
          _title: "Paiement confirmé ✅",
          _message: `Votre paiement de ${booking.total_price?.toLocaleString("fr-FR")} F a été confirmé. Votre réservation est validée !`,
          _data: { booking_id: bookingId, listing_id: booking.listing_id },
        });
      }

      console.log(`IPN: Booking ${bookingId} confirmed`);
    } else if (status === "cancelled" || status === "failed") {
      await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      console.log(`IPN: Booking ${bookingId} cancelled/failed`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("payment-ipn error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
