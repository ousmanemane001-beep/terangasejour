import { MessageCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvailabilitySubType = "contact" | "calendar";

interface AvailabilityTypeStepProps {
  availabilitySubType: AvailabilitySubType;
  onChangeSubType: (sub: AvailabilitySubType) => void;
}

const AvailabilityTypeStep = ({
  availabilitySubType,
  onChangeSubType,
}: AvailabilityTypeStepProps) => {
  console.log("AvailabilityTypeStep render — availabilitySubType:", availabilitySubType);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Type de disponibilité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comment souhaitez-vous gérer la disponibilité ?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChangeSubType("contact")}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200",
            availabilitySubType === "contact"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            availabilitySubType === "contact"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <Phone className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">Me contacter</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les voyageurs vous contactent pour vérifier la disponibilité
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeSubType("calendar")}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200",
            availabilitySubType === "calendar"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            availabilitySubType === "calendar"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">Définir mes disponibilités</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Marquez les dates occupées sur un calendrier interactif
            </p>
          </div>
        </button>
      </div>

      {availabilitySubType === "contact" && (
        <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground animate-fade-in">
          📩 Les voyageurs vous enverront un message pour vérifier la disponibilité. Vous pourrez accepter ou refuser chaque demande.
        </div>
      )}

      {availabilitySubType === "calendar" && (
        <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground animate-fade-in">
          📅 À l'étape suivante, vous pourrez marquer les dates occupées sur un calendrier.
        </div>
      )}
    </div>
  );
};

export default AvailabilityTypeStep;
