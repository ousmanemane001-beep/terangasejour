import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useBlockedDates, useToggleBlockedDate } from "@/hooks/useBlockedDates";
import { useBookedDates, getDisabledDates } from "@/hooks/useAvailability";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BlockedDatesCalendarProps {
  listingId: string;
}

const BlockedDatesCalendar = ({ listingId }: BlockedDatesCalendarProps) => {
  const { data: blockedDates, isLoading: blockedLoading } = useBlockedDates(listingId);
  const { data: bookedRanges, isLoading: bookedLoading } = useBookedDates(listingId);
  const toggleBlocked = useToggleBlockedDate();
  const [selected, setSelected] = useState<Date | undefined>();

  const bookedDays = bookedRanges ? getDisabledDates(bookedRanges) : [];
  const blockedDays = blockedDates?.map((bd) => new Date(bd.date + "T00:00:00")) || [];

  const isBooked = (date: Date) => bookedDays.some((d) => d.toDateString() === date.toDateString());

  const handleSelect = async (date: Date | undefined) => {
    if (!date) return;
    if (isBooked(date)) {
      toast.error("Cette date est déjà réservée");
      return;
    }
    if (date < new Date(new Date().toDateString())) {
      toast.error("Impossible de bloquer une date passée");
      return;
    }
    setSelected(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const result = await toggleBlocked.mutateAsync({ listingId, date: dateStr });
    toast.success(result.action === "blocked" ? "Date bloquée" : "Date débloquée");
  };

  if (blockedLoading || bookedLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-3">Gérer la disponibilité</h3>
      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40" /> Disponible</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" /> Réservé</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted-foreground/20 border border-muted-foreground/40" /> Bloqué</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Cliquez sur une date pour la bloquer/débloquer.</p>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        disabled={[
          (date) => date < new Date(new Date().toDateString()),
          ...bookedDays.map((d) => new Date(d)),
        ]}
        modifiers={{
          booked: bookedDays,
          blocked: blockedDays,
        }}
        modifiersClassNames={{
          booked: "!bg-destructive/20 !text-destructive line-through",
          blocked: "!bg-muted-foreground/20 !text-muted-foreground line-through",
        }}
        className="rounded-xl border border-border p-3"
        numberOfMonths={2}
      />
    </div>
  );
};

export default BlockedDatesCalendar;
