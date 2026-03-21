import { useMemo, useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type DateStatus = "available" | "booked" | "blocked" | "pending";

export interface DateInfo {
  date: Date;
  status: DateStatus;
  price?: number;
  reason?: string;
}

interface CalendarGridProps {
  dateMap: Map<string, DateInfo>;
  checkIn?: Date;
  checkOut?: Date;
  onSelectDate: (date: Date) => void;
  pricePerNight?: number;
  minStay?: number;
  className?: string;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const statusStyles: Record<DateStatus, string> = {
  available: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200/60 cursor-pointer",
  booked: "bg-red-50 text-red-400 border-red-200/40 cursor-not-allowed line-through",
  blocked: "bg-muted text-muted-foreground/50 border-border cursor-not-allowed",
  pending: "bg-amber-50 text-amber-700 border-amber-200/60 cursor-not-allowed",
};

const CalendarGrid = ({
  dateMap,
  checkIn,
  checkOut,
  onSelectDate,
  pricePerNight,
  minStay = 1,
  className,
}: CalendarGridProps) => {
  const [baseMonth, setBaseMonth] = useState(() => startOfMonth(new Date()));
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    setDirection(1);
    setBaseMonth((m) => addMonths(m, 1));
  }, []);
  const goPrev = useCallback(() => {
    setDirection(-1);
    setBaseMonth((m) => addMonths(m, -1));
  }, []);

  const canGoPrev = !isSameMonth(baseMonth, new Date()) && isAfter(baseMonth, new Date());

  const months = useMemo(() => [baseMonth, addMonths(baseMonth, 1)], [baseMonth]);

  const getDateKey = (d: Date) => format(d, "yyyy-MM-dd");
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const isInSelectedRange = (date: Date) => {
    if (!checkIn) return false;
    const end = checkOut || hoveredDate;
    if (!end) return false;
    if (isSameDay(date, checkIn) || isSameDay(date, end)) return false;
    return isWithinInterval(date, {
      start: isBefore(checkIn, end) ? checkIn : end,
      end: isAfter(end, checkIn) ? end : checkIn,
    });
  };

  const isCheckIn = (date: Date) => checkIn && isSameDay(date, checkIn);
  const isCheckOut = (date: Date) => checkOut && isSameDay(date, checkOut);

  const renderMonth = (monthStart: Date) => {
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let current = calStart;
    while (current <= calEnd) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex-1 min-w-0">
        <h3 className="text-center font-display font-semibold text-foreground capitalize mb-3 text-sm">
          {format(monthStart, "MMMM yyyy", { locale: fr })}
        </h3>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.flat().map((day, i) => {
            const inMonth = isSameMonth(day, monthStart);
            const isPast = isBefore(day, today);
            const key = getDateKey(day);
            const info = dateMap.get(key);
            const status: DateStatus = !inMonth || isPast ? "blocked" : info?.status || "available";
            const price = info?.price ?? pricePerNight;
            const isDisabled = status !== "available" || isPast || !inMonth;
            const inRange = isInSelectedRange(day);
            const isStart = isCheckIn(day);
            const isEnd = isCheckOut(day);
            const isHovered = hoveredDate && isSameDay(day, hoveredDate) && checkIn && !checkOut;

            return (
              <motion.button
                key={`${key}-${i}`}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelectDate(day)}
                onMouseEnter={() => !isDisabled && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                whileHover={!isDisabled ? { scale: 1.08 } : undefined}
                whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border text-xs transition-all duration-150 aspect-square",
                  !inMonth && "opacity-0 pointer-events-none",
                  inMonth && statusStyles[status],
                  inRange && "!bg-primary/10 !border-primary/20 !text-primary",
                  (isStart || isEnd) && "!bg-primary !text-primary-foreground !border-primary ring-2 ring-primary/30",
                  isHovered && "!bg-primary/20 !border-primary/40",
                  isSameDay(day, today) && status === "available" && !isStart && !isEnd && "ring-1 ring-primary/40",
                )}
                title={
                  status === "booked" ? "Déjà réservé" :
                  status === "blocked" ? (info?.reason || "Indisponible") :
                  status === "pending" ? "En attente de confirmation" :
                  isStart ? "Date d'arrivée" :
                  isEnd ? "Date de départ" :
                  price ? `${price.toLocaleString("fr-FR")} F/nuit` : undefined
                }
              >
                <span className={cn("font-medium", (isStart || isEnd) ? "text-sm" : "text-xs")}>
                  {format(day, "d")}
                </span>
                {inMonth && price && status === "available" && !isStart && !isEnd && (
                  <span className="text-[8px] leading-none opacity-70 mt-0.5">
                    {price >= 1000 ? `${Math.round(price / 1000)}k` : price}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("select-none", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Months grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={baseMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          {months.map((m) => (
            <div key={m.toISOString()} className="flex-1">
              {renderMonth(m)}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
        {[
          { color: "bg-emerald-100 border-emerald-300", label: "Disponible" },
          { color: "bg-red-100 border-red-300", label: "Réservé" },
          { color: "bg-muted border-border", label: "Indisponible" },
          { color: "bg-amber-100 border-amber-300", label: "En attente" },
          { color: "bg-primary border-primary", label: "Sélection" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={cn("w-2.5 h-2.5 rounded-sm border", item.color)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
