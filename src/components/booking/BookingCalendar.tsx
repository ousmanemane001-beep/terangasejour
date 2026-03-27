import { useMemo, useState, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameMonth, isSameDay, isBefore,
  isWithinInterval, isAfter,
} from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface BookingCalendarProps {
  checkIn?: Date;
  checkOut?: Date;
  onSelectCheckIn: (date: Date) => void;
  onSelectCheckOut: (date: Date) => void;
  isDateDisabled: (date: Date) => boolean;
  isCheckOutDisabled?: (date: Date) => boolean;
  className?: string;
}

const MAX_MONTHS_AHEAD = 12;

const BookingCalendar = ({
  checkIn, checkOut,
  onSelectCheckIn, onSelectCheckOut,
  isDateDisabled, isCheckOutDisabled,
  className,
}: BookingCalendarProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === "fr" ? fr : enUS;
  const isMobile = useIsMobile();

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [baseMonth, setBaseMonth] = useState(() => startOfMonth(checkIn || today));
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const minMonth = startOfMonth(today);
  const maxMonth = addMonths(minMonth, MAX_MONTHS_AHEAD - 1);

  const canGoPrev = isAfter(baseMonth, minMonth);
  const canGoNext = isMobile
    ? isBefore(baseMonth, maxMonth)
    : isBefore(addMonths(baseMonth, 1), maxMonth);

  const goPrev = useCallback(() => setBaseMonth((m) => addMonths(m, -1)), []);
  const goNext = useCallback(() => setBaseMonth((m) => addMonths(m, 1)), []);

  const months = useMemo(
    () => isMobile ? [baseMonth] : [baseMonth, addMonths(baseMonth, 1)],
    [baseMonth, isMobile]
  );

  const weekdays = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(base, i), "EEEEEE", { locale })
    );
  }, [locale]);

  const selectingCheckOut = !!checkIn && !checkOut;

  const handleDayClick = (day: Date) => {
    if (!checkIn || checkOut) {
      // Start new selection
      onSelectCheckIn(day);
    } else {
      // Selecting check-out
      if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
        // Clicked before check-in → restart
        onSelectCheckIn(day);
      } else {
        onSelectCheckOut(day);
      }
    }
  };

  const isInRange = (day: Date) => {
    if (!checkIn) return false;
    const end = checkOut || hoveredDate;
    if (!end || isSameDay(checkIn, end)) return false;
    const [start, finish] = isBefore(checkIn, end) ? [checkIn, end] : [end, checkIn];
    return isWithinInterval(day, { start: addDays(start, 1), end: addDays(finish, -1) });
  };

  const renderMonth = (monthStart: Date) => {
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let cur = calStart;
    while (cur <= calEnd) {
      days.push(new Date(cur));
      cur = addDays(cur, 1);
    }

    return (
      <div className="flex-1 min-w-0">
        <h3 className="text-center font-semibold text-foreground capitalize mb-3 text-sm">
          {format(monthStart, "MMMM yyyy", { locale })}
        </h3>
        <div className="grid grid-cols-7 mb-1">
          {weekdays.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, monthStart);
            if (!inMonth) {
              return <div key={i} className="aspect-square" />;
            }

            const disabled = selectingCheckOut
              ? (isCheckOutDisabled ? isCheckOutDisabled(day) : isDateDisabled(day))
              : isDateDisabled(day);

            const isStart = checkIn && isSameDay(day, checkIn);
            const isEnd = checkOut && isSameDay(day, checkOut);
            const inRange = isInRange(day);
            const isHovered = selectingCheckOut && hoveredDate && isSameDay(day, hoveredDate) && !disabled;
            const isToday = isSameDay(day, today);

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && handleDayClick(day)}
                onMouseEnter={() => selectingCheckOut && !disabled && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  "relative aspect-square flex items-center justify-center text-sm transition-colors duration-100",
                  // Base
                  disabled
                    ? "text-muted-foreground/40 cursor-not-allowed line-through"
                    : "text-foreground hover:bg-primary/10 cursor-pointer",
                  // Range background
                  inRange && "!bg-primary/10",
                  // Start/end
                  (isStart || isEnd) && "!bg-primary !text-primary-foreground font-semibold rounded-full z-10",
                  isStart && checkOut && "rounded-r-none",
                  isEnd && "rounded-l-none",
                  // Hover preview
                  isHovered && !isStart && "!bg-primary/20 rounded-full",
                  // Today dot
                  isToday && !isStart && !isEnd && !disabled && "font-bold",
                )}
              >
                {format(day, "d")}
                {isToday && !isStart && !isEnd && !disabled && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("select-none", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month grid */}
      <div className={cn("flex gap-6", isMobile ? "flex-col" : "flex-row")}>
        {months.map((m) => (
          <div key={m.toISOString()} className="flex-1">
            {renderMonth(m)}
          </div>
        ))}
      </div>

      {/* Helper text */}
      {selectingCheckOut && (
        <p className="text-xs text-primary text-center mt-3 animate-pulse">
          {i18n.language === "fr" ? "Sélectionnez votre date de départ" : "Select your check-out date"}
        </p>
      )}
    </div>
  );
};

export default BookingCalendar;
