import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!bookingId) return;
    setRetrying(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Erreur de paiement");
      }

      if (data.payment_url) {
        const opened = window.open(data.payment_url, "_blank");
        if (!opened) window.location.href = data.payment_url;
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible de relancer le paiement");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-9 h-9 text-destructive" />
        </div>

        <h1 className="text-xl font-bold text-foreground">Paiement échoué ❌</h1>
        <p className="text-muted-foreground">
          Votre réservation n'a pas été confirmée. Vous pouvez réessayer le paiement ou modifier
          vos dates.
        </p>

        <div className="space-y-3">
          {bookingId && (
            <Button
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Redirection...
                </span>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reprendre le paiement
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full rounded-xl h-12"
            onClick={() => navigate(-1)}
          >
            <CalendarDays className="w-4 h-4 mr-2" /> Modifier les dates
          </Button>

          <Button
            variant="ghost"
            className="w-full rounded-xl h-12"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" /> Retour accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
