import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return jsonResponse(401, {
        error: "Unauthorized",
        details: "Missing Bearer token",
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      console.error("Empty bearer token");
      return jsonResponse(401, {
        error: "Unauthorized",
        details: "Empty access token",
      });
    }

    const body = await req.json().catch(() => null);
    const booking_id = body?.booking_id;

    if (!booking_id || typeof booking_id !== "string") {
      return jsonResponse(400, { error: "booking_id is required" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("Auth error:", userError?.message || "No user data");
      return jsonResponse(401, {
        error: "Unauthorized",
        details: userError?.message ?? "Invalid or expired session",
      });
    }

    const userId = userData.user.id;
    console.log("Authenticated user:", userId);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return jsonResponse(404, { error: "Booking not found" });
    }

    if (booking.guest_id !== userId) {
      return jsonResponse(403, { error: "Forbidden" });
    }

    const MASTER_KEY = Deno.env.get("PAYDUNYA_MASTER_KEY");
    const PRIVATE_KEY = Deno.env.get("PAYDUNYA_PRIVATE_KEY");
    const TOKEN = Deno.env.get("PAYDUNYA_TOKEN");

    if (!MASTER_KEY || !PRIVATE_KEY || !TOKEN) {
      return jsonResponse(500, { error: "Payment gateway not configured" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/payment-ipn`;

    const invoicePayload = {
      invoice: {
        total_amount: booking.total_price,
        description: `Réservation TerangaSéjour #${booking_id.slice(0, 8)}`,
      },
      store: {
        name: "TerangaSéjour",
        tagline: "Location de vacances au Sénégal",
        phone: "",
        postal_address: "Dakar, Sénégal",
        website_url: "https://terangasejour.lovable.app",
      },
      custom_data: {
        booking_id,
      },
      actions: {
        callback_url: callbackUrl,
        return_url: "https://terangasejour.lovable.app/dashboard",
        cancel_url: `https://terangasejour.lovable.app/property/${booking.listing_id}`,
      },
    };

    const requestInvoice = async (url: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": MASTER_KEY,
          "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
          "PAYDUNYA-TOKEN": TOKEN,
        },
        body: JSON.stringify(invoicePayload),
      });

      const raw = await response.text();
      try {
        return JSON.parse(raw);
      } catch {
        return {
          response_code: response.ok ? "00" : String(response.status),
          response_text: raw || "Invalid PayDunya response",
        };
      }
    };

    // Sandbox endpoint (test mode)
    const paydunyaData = await requestInvoice(
      "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create"
    );

    if (paydunyaData.response_code !== "00") {
      console.error("PayDunya error:", paydunyaData);
      return jsonResponse(502, {
        error: "Payment creation failed",
        details: paydunyaData.response_text,
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await adminClient
      .from("bookings")
      .update({ transaction_id: paydunyaData.token })
      .eq("id", booking_id);

    if (updateError) {
      console.error("Failed to persist payment token:", updateError.message);
      return jsonResponse(500, { error: "Unable to save payment transaction" });
    }

    return jsonResponse(200, {
      payment_url: paydunyaData.response_text,
      token: paydunyaData.token,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return jsonResponse(500, {
      error: "Internal server error",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});