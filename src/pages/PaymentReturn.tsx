import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, AlertTriangle, Home, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentState = "checking" | "paid" | "failed" | "timeout";

const MAX_POLLS = 10; // 10 × 3s = 30s
const POLL_INTERVAL = 3000;

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>("checking");
  const [booking, setBooking] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);

  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    if (!bookingId) {
      setState("failed");
      return;
    }

    const poll = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, listing_id, check_in, check_out, nights, total_price, payment_status, status")
        .eq("id", bookingId)
        .maybeSingle();

      if (error || !data) {
        setState("failed");
        return;
      }

      if (data.payment_status === "paid" || data.status === "confirmed") {
        setBooking(data);
        setState("paid");
        return;
      }

      if (data.payment_status === "failed") {
        setState("failed");
        return;
      }

      // Still pending
      setPollCount((c) => {
        if (c + 1 >= MAX_POLLS) {
          setState("timeout");
          return c + 1;
        }
        return c + 1;
      });
    };

    poll();
    const interval = setInterval(() => {
      setPollCount((c) => {
        if (c >= MAX_POLLS) {
          clearInterval(interval);
          return c;
        }
        return c;
      });
      poll();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 text-center space-y-6">
        {state === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-foreground">
              Paiement en cours de vérification...
            </h1>
            <p className="text-sm text-muted-foreground">
              Veuillez patienter, nous vérifions votre paiement.
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((pollCount / MAX_POLLS) * 100, 95)}%` }}
              />
            </div>
          </>
        )}

        {state === "paid" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Paiement confirmé ✅</h1>
            <p className="text-muted-foreground">
              Votre réservation est validée. Les détails de votre séjour sont disponibles.
            </p>
            {booking && (
              <div className="bg-muted rounded-xl p-4 text-sm space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium text-foreground">{booking.check_in}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium text-foreground">{booking.check_out}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nuitées</span>
                  <span className="font-medium text-foreground">{booking.nights}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {booking.total_price?.toLocaleString("fr-FR")} F
                  </span>
                </div>
              </div>
            )}
            <Button
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground"
              onClick={() => navigate("/dashboard/my-bookings")}
            >
              <Eye className="w-4 h-4 mr-2" /> Voir ma réservation
            </Button>
          </>
        )}

        {state === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-9 h-9 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Paiement échoué ❌</h1>
            <p className="text-muted-foreground">
              Votre réservation n'a pas été confirmée. Le paiement a échoué ou a été annulé.
            </p>
            <div className="space-y-3">
              {bookingId && (
                <Button
                  className="w-full rounded-xl h-12 bg-primary text-primary-foreground"
                  onClick={() => navigate(`/paiement-echec?booking_id=${bookingId}`)}
                >
                  Réessayer le paiement
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-xl h-12"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" /> Retour accueil
              </Button>
            </div>
          </>
        )}

        {state === "timeout" && (
          <>
            <Loader2 className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-xl font-bold text-foreground">
              Vérification en cours...
            </h1>
            <p className="text-sm text-muted-foreground">
              La confirmation prend plus de temps que prévu. Veuillez patienter ou contacter le
              support si le problème persiste.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full rounded-xl h-12 bg-primary text-primary-foreground"
                onClick={() => {
                  setPollCount(0);
                  setState("checking");
                }}
              >
                Revérifier
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-12"
                onClick={() => navigate("/dashboard/my-bookings")}
              >
                Voir mes réservations
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;
