import { Phone, CalendarDays, Globe } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { BookingMode } from "./BookingModeStep";

export type AvailabilitySubType = "contact" | "calendar";

interface AvailabilityStepProps {
  bookingMode: BookingMode;
  availabilitySubType: AvailabilitySubType;
  blockedDates: Date[];
  onChangeSubType: (sub: AvailabilitySubType) => void;
  onChangeBlockedDates: (dates: Date[]) => void;
}

const AvailabilityStep = ({
  bookingMode,
  availabilitySubType,
  blockedDates,
  onChangeSubType,
  onChangeBlockedDates,
}: AvailabilityStepProps) => {
  const toggleDate = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const exists = blockedDates.some((d) => format(d, "yyyy-MM-dd") === dateStr);
    if (exists) {
      onChangeBlockedDates(blockedDates.filter((d) => format(d, "yyyy-MM-dd") !== dateStr));
    } else {
      onChangeBlockedDates([...blockedDates, date]);
    }
  };

  // Instant booking → always available, no config needed
  if (bookingMode === "instant") {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Disponibilité</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configuration de la disponibilité de votre logement.
          </p>
        </div>

        <div className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-6 sm:p-8 shadow-md ring-1 ring-primary/20"
        )}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
            <Globe className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">Toujours disponible</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Votre logement est disponible toute l'année. Les dates réservées seront automatiquement bloquées.
            </p>
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            ✓ Sélectionné automatiquement
          </span>
        </div>

        <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground">
          ✅ Aucune configuration nécessaire. Vous pourrez modifier la disponibilité à tout moment depuis votre tableau de bord.
        </div>
      </div>
    );
  }

  // Request mode → choose contact or calendar
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Disponibilité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comment souhaitez-vous gérer la disponibilité ?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            onChangeSubType("contact");
            onChangeBlockedDates([]);
          }}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200",
            availabilitySubType === "contact"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
              : "border-border hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            availabilitySubType === "contact"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <Phone className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground text-sm">Me contacter</p>
            <p className="text-xs text-muted-foreground">
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
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            availabilitySubType === "calendar"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary/60"
          )}>
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground text-sm">Définir mes disponibilités</p>
            <p className="text-xs text-muted-foreground">
              Marquez les dates occupées sur un calendrier
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
        <div className="space-y-4 animate-fade-in">
          <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Comment ça fonctionne :</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Par défaut, toutes les dates sont <strong>disponibles</strong> (en blanc)</li>
              <li>Cliquez sur une date pour la marquer comme <strong>occupée</strong> (en rouge)</li>
              <li>Cliquez à nouveau pour la rendre disponible</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-card border border-border" />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
              Occupé
            </span>
          </div>

          <Calendar
            mode="single"
            selected={undefined}
            onSelect={toggleDate}
            disabled={(date) => date < new Date(new Date().toDateString())}
            modifiers={{ blocked: blockedDates }}
            modifiersClassNames={{
              blocked: "!bg-destructive/20 !text-destructive line-through",
            }}
            className={cn("rounded-xl border border-border p-3 pointer-events-auto")}
            numberOfMonths={1}
          />

          {blockedDates.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {blockedDates.length} date(s) marquée(s) comme occupée(s).
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityStep;
