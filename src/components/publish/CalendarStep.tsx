import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarStepProps {
  blockedDates: Date[];
  onChangeBlockedDates: (dates: Date[]) => void;
}

const CalendarStep = ({ blockedDates, onChangeBlockedDates }: CalendarStepProps) => {
  console.log("CalendarStep render — blockedDates:", blockedDates.length);

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
        <h2 className="font-display text-xl font-bold text-foreground">Calendrier de disponibilité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez les dates où votre logement est occupé.
        </p>
      </div>

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
  );
};

export default CalendarStep;
