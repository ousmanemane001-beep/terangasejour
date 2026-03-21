import { Globe, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type BookingMode = "instant" | "request";

interface BookingModeStepProps {
  bookingMode: BookingMode;
  onChangeMode: (mode: BookingMode) => void;
}

const BookingModeStep = ({ bookingMode, onChangeMode }: BookingModeStepProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Mode de réservation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comment souhaitez-vous gérer les réservations de votre logement ?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChangeMode("instant")}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 sm:p-8 transition-all duration-200",
            bookingMode === "instant"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            bookingMode === "instant"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <Globe className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">Toujours disponible</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Votre logement est ouvert à la réservation toute l'année. Les voyageurs réservent et paient directement.
            </p>
          </div>
          {bookingMode === "instant" && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              ✓ Recommandé
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onChangeMode("request")}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 sm:p-8 transition-all duration-200",
            bookingMode === "request"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            bookingMode === "request"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">Disponible sur demande</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les voyageurs doivent vous contacter avant de réserver. Vous gardez le contrôle total.
            </p>
          </div>
        </button>
      </div>

      {bookingMode === "instant" && (
        <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground animate-fade-in">
          ⚡ Votre logement sera réservable immédiatement toute l'année. Vous pourrez publier directement après cette étape.
        </div>
      )}

      {bookingMode === "request" && (
        <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground animate-fade-in">
          📩 À l'étape suivante, vous choisirez comment gérer vos disponibilités : par contact direct ou via un calendrier.
        </div>
      )}
    </div>
  );
};

export default BookingModeStep;
