import { Calendar as CalendarIcon, Globe, MessageSquare, CalendarDays, Phone } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type AvailabilityType = "always" | "request_only";
export type AvailabilitySubType = "contact" | "calendar";

interface AvailabilityStepProps {
  availabilityType: AvailabilityType;
  availabilitySubType: AvailabilitySubType;
  blockedDates: Date[];
  onChangeType: (type: AvailabilityType) => void;
  onChangeSubType: (sub: AvailabilitySubType) => void;
  onChangeBlockedDates: (dates: Date[]) => void;
}

const AvailabilityStep = ({
  availabilityType,
  availabilitySubType,
  blockedDates,
  onChangeType,
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

  const handleTypeChange = (type: AvailabilityType) => {
    onChangeType(type);
    if (type === "always") {
      onChangeBlockedDates([]);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Disponibilité
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comment souhaitez-vous gérer la disponibilité de votre logement ?
        </p>
      </div>

      {/* Main choice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleTypeChange("always")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
            availabilityType === "always"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <Globe className={cn("w-10 h-10", availabilityType === "always" ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Disponible tout le temps</p>
            <p className="text-xs text-muted-foreground mt-1">
              Réservation instantanée toute l'année
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("request_only")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
            availabilityType === "request_only"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <MessageSquare className={cn("w-10 h-10", availabilityType === "request_only" ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Disponible sur demande</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vous contrôlez les réservations
            </p>
          </div>
        </button>
      </div>

      {/* Info for "always" */}
      {availabilityType === "always" && (
        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
          ✅ Votre logement sera réservable immédiatement. Vous pourrez modifier la disponibilité à tout moment depuis votre tableau de bord.
        </div>
      )}

      {/* Sub-options for "request_only" */}
      {availabilityType === "request_only" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-medium text-foreground">
            Comment souhaitez-vous gérer les demandes ?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onChangeSubType("contact");
                onChangeBlockedDates([]);
              }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                availabilitySubType === "contact"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40"
              )}
            >
              <Phone className={cn("w-8 h-8", availabilitySubType === "contact" ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">Les voyageurs doivent me contacter</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pas de calendrier, vous gérez par messagerie
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeSubType("calendar")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                availabilitySubType === "calendar"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40"
              )}
            >
              <CalendarDays className={cn("w-8 h-8", availabilitySubType === "calendar" ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">Je définis mes disponibilités</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Marquez les dates occupées sur un calendrier
                </p>
              </div>
            </button>
          </div>

          {/* Info for contact mode */}
          {availabilitySubType === "contact" && (
            <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground animate-fade-in">
              📩 Les voyageurs vous enverront un message pour vérifier la disponibilité. Vous pourrez accepter ou refuser chaque demande.
            </div>
          )}

          {/* Calendar for "calendar" sub-type */}
          {availabilitySubType === "calendar" && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground space-y-2">
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
      )}
    </div>
  );
};

export default AvailabilityStep;
