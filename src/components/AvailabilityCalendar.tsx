import { Calendar } from "@/components/ui/calendar";
import { useBookedDates, getDisabledDates } from "@/hooks/useAvailability";
import { Loader2 } from "lucide-react";

interface AvailabilityCalendarProps {
  listingId: string;
}

const AvailabilityCalendar = ({ listingId }: AvailabilityCalendarProps) => {
  const { data: bookedRanges, isLoading } = useBookedDates(listingId);
  const disabledDates = bookedRanges ? getDisabledDates(bookedRanges) : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">Disponibilité</h2>
      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40" /> Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" /> Réservé</span>
      </div>
      <Calendar
        mode="single"
        disabled={[
          (date) => date < new Date(),
          ...disabledDates.map((d) => new Date(d)),
        ]}
        modifiers={{ booked: disabledDates }}
        modifiersClassNames={{
          booked: "!bg-destructive/20 !text-destructive line-through",
        }}
        className="rounded-xl border border-border p-3"
        numberOfMonths={2}
      />
    </div>
  );
};

export default AvailabilityCalendar;
