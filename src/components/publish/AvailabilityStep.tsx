import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type AvailabilityType = "always" | "calendar" | "request_only";

interface AvailabilityStepProps {
  availabilityType: AvailabilityType;
  blockedDates: Date[];
  onChangeType: (type: AvailabilityType) => void;
  onChangeBlockedDates: (dates: Date[]) => void;
}

const AvailabilityStep = ({
  availabilityType,
  blockedDates,
  onChangeType,
  onChangeBlockedDates,
}: AvailabilityStepProps) => {
  const [subChoice, setSubChoice] = useState<"pending" | "calendar" | "request">(
    availabilityType === "calendar" ? "calendar" : availabilityType === "request_only" ? "request" : "pending"
  );

  const handleAlways = () => {
    onChangeType("always");
    setSubChoice("pending");
  };

  const handleOnDemand = () => {
    if (availabilityType === "always") {
      onChangeType("request_only");
    }
    setSubChoice("pending");
  };

  const handleSubCalendar = () => {
    onChangeType("calendar");
    setSubChoice("calendar");
  };

  const handleSubRequest = () => {
    onChangeType("request_only");
    setSubChoice("request");
  };

  const showMainChoice = availabilityType === "always" || availabilityType === "request_only" || availabilityType === "calendar";
  const isOnDemand = availabilityType === "calendar" || availabilityType === "request_only";

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

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Disponibilité
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          À quelle fréquence votre logement est-il disponible ?
        </p>
      </div>

      {/* Main choice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleAlways}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all text-left",
            availabilityType === "always"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <Globe className={cn("w-8 h-8", availabilityType === "always" ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">Toujours disponible</p>
            <p className="text-xs text-muted-foreground mt-1">Le logement est disponible toute l'année</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleOnDemand}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all text-left",
            isOnDemand
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <MessageSquare className={cn("w-8 h-8", isOnDemand ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">Disponibilité sur demande</p>
            <p className="text-xs text-muted-foreground mt-1">Gérez vos disponibilités manuellement</p>
          </div>
        </button>
      </div>

      {/* Sub choice for on-demand */}
      {isOnDemand && (
        <div className="space-y-4 pt-2">
          <p className="text-sm font-medium text-foreground">
            Souhaitez-vous définir les dates disponibles ?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSubCalendar}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                subChoice === "calendar"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              <CalendarIcon className={cn("w-5 h-5 shrink-0", subChoice === "calendar" ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-medium text-foreground text-sm">Oui, définir les dates</p>
                <p className="text-xs text-muted-foreground">Bloquer des dates sur un calendrier</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleSubRequest}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                subChoice === "request"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              <MessageSquare className={cn("w-5 h-5 shrink-0", subChoice === "request" ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-medium text-foreground text-sm">Non, les voyageurs doivent demander</p>
                <p className="text-xs text-muted-foreground">Chaque réservation nécessite votre accord</p>
              </div>
            </button>
          </div>

          {/* Calendar for blocking dates */}
          {subChoice === "calendar" && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Cliquez sur les dates que vous souhaitez <strong>bloquer</strong>. Les dates non sélectionnées restent disponibles.
              </p>
              <Calendar
                mode="single"
                selected={undefined}
                onSelect={toggleDate}
                disabled={(date) => date < new Date()}
                modifiers={{ blocked: blockedDates }}
                modifiersClassNames={{
                  blocked: "!bg-destructive/20 !text-destructive line-through",
                }}
                className={cn("rounded-xl border border-border p-3 pointer-events-auto")}
                numberOfMonths={1}
              />
              {blockedDates.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {blockedDates.length} date(s) bloquée(s). Vous pourrez les modifier depuis votre tableau de bord.
                </p>
              )}
            </div>
          )}

          {subChoice === "request" && (
            <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
              Les voyageurs devront envoyer une demande de réservation. Vous pourrez accepter ou refuser chaque demande depuis votre tableau de bord.
            </div>
          )}
        </div>
      )}

      {availabilityType === "always" && (
        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
          Votre logement sera affiché comme disponible toute l'année. Vous pourrez modifier cela à tout moment depuis votre tableau de bord.
        </div>
      )}
    </div>
  );
};

export default AvailabilityStep;
