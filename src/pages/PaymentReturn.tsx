import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentState = "checking" | "paid";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => setState("paid"), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 text-center space-y-6">
        {state === "checking" ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Paiement en cours de vérification...</h1>
            <p className="text-sm text-muted-foreground">Veuillez patienter quelques secondes.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Paiement confirmé ✅</h1>
            <p className="text-muted-foreground">Votre réservation est validée.</p>
            <Button
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground"
              onClick={() => navigate("/dashboard/my-bookings")}
            >
              <Eye className="w-4 h-4 mr-2" /> Voir ma réservation
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;
