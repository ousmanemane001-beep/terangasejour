import { useState } from "react";
import { Loader2 } from "lucide-react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import { useCalendarData } from "@/components/calendar/useCalendarData";

interface AvailabilityCalendarProps {
  listingId: string;
  pricePerNight?: number;
  onDatesChange?: (checkIn?: Date, checkOut?: Date) => void;
  interactive?: boolean;
}

const AvailabilityCalendar = ({
  listingId,
  pricePerNight,
  onDatesChange,
  interactive = false,
}: AvailabilityCalendarProps) => {
  const { dateMap, isLoading } = useCalendarData(listingId);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const handleSelectDate = (date: Date) => {
    if (!interactive) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(date);
      setCheckOut(undefined);
      onDatesChange?.(date, undefined);
    } else {
      // Set check-out
      if (date > checkIn) {
        // Verify no booked dates in between
        const current = new Date(checkIn);
        current.setDate(current.getDate() + 1);
        while (current < date) {
          const key = current.toISOString().split("T")[0];
          const info = dateMap.get(key);
          if (info && (info.status === "booked" || info.status === "blocked")) {
            // Can't select across booked dates — restart
            setCheckIn(date);
            setCheckOut(undefined);
            onDatesChange?.(date, undefined);
            return;
          }
          current.setDate(current.getDate() + 1);
        }
        setCheckOut(date);
        onDatesChange?.(checkIn, date);
      } else {
        setCheckIn(date);
        setCheckOut(undefined);
        onDatesChange?.(date, undefined);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">
        Disponibilité
      </h2>
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <CalendarGrid
          dateMap={dateMap}
          checkIn={interactive ? checkIn : undefined}
          checkOut={interactive ? checkOut : undefined}
          onSelectDate={handleSelectDate}
          pricePerNight={pricePerNight}
        />
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
