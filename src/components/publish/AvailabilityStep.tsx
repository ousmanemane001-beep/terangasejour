import { useState } from "react";
import { Calendar as CalendarIcon, Globe, MessageSquare } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type AvailabilityType = "always" | "request_only";

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
        <h2 className="font-display text-xl font-bold text-foreground">
          Disponibilité
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ce logement est-il toujours disponible à la réservation ?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Option 1: Toujours disponible */}
        <button
          type="button"
          onClick={() => onChangeType("always")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
            availabilityType === "always"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <Globe className={cn("w-10 h-10", availabilityType === "always" ? "text-primary" : "text-muted-foreground")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Toujours disponible</p>
            <p className="text-xs text-muted-foreground mt-1">
              Réservation instantanée toute l'année
            </p>
          </div>
        </button>

        {/* Option 2: Disponible sur demande */}
        <button
          type="button"
          onClick={() => onChangeType("request_only")}
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
              Les voyageurs envoient une demande que vous acceptez ou refusez
            </p>
          </div>
        </button>
      </div>

      {/* Info box for "always" */}
      {availabilityType === "always" && (
        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
          <p>
            ✅ Votre logement sera réservable immédiatement par les voyageurs. Vous pourrez modifier la disponibilité à tout moment depuis votre tableau de bord.
          </p>
        </div>
      )}

      {/* Calendar + info for "request_only" */}
      {availabilityType === "request_only" && (
        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Comment ça fonctionne :</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Le voyageur sélectionne ses dates et clique sur <strong>"Envoyer une demande"</strong></li>
              <li>Vous recevez une notification avec les dates et le nombre de voyageurs</li>
              <li>Vous pouvez <strong>accepter</strong> ou <strong>refuser</strong> chaque demande</li>
            </ol>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Bloquer des dates (optionnel)
            </p>
            <p className="text-xs text-muted-foreground">
              Cliquez sur les dates que vous souhaitez <strong>bloquer</strong>. Les dates non sélectionnées restent ouvertes aux demandes.
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
        </div>
      )}
    </div>
  );
};

export default AvailabilityStep;
