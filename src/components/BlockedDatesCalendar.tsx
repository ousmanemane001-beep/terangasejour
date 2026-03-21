import { useState, useMemo } from "react";
import { useBlockedDates, useToggleBlockedDate } from "@/hooks/useBlockedDates";
import { useBookedDates, getDisabledDates } from "@/hooks/useAvailability";
import { Loader2, CalendarDays, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface BlockedDatesCalendarProps {
  listingId: string;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const BlockedDatesCalendar = ({ listingId }: BlockedDatesCalendarProps) => {
  const { data: blockedDates, isLoading: blockedLoading } = useBlockedDates(listingId);
  const { data: bookedRanges, isLoading: bookedLoading } = useBookedDates(listingId);
  const qc = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date(new Date().toDateString());

  const bookedDays = useMemo(() => bookedRanges ? getDisabledDates(bookedRanges) : [], [bookedRanges]);
  const blockedSet = useMemo(() => {
    const set = new Set<string>();
    blockedDates?.forEach((bd) => set.add(bd.date));
    return set;
  }, [blockedDates]);
  const bookedSet = useMemo(() => {
    const set = new Set<string>();
    bookedDays.forEach((d) => set.add(format(d, "yyyy-MM-dd")));
    return set;
  }, [bookedDays]);

  const isBooked = (date: Date) => bookedSet.has(format(date, "yyyy-MM-dd"));
  const isBlocked = (date: Date) => blockedSet.has(format(date, "yyyy-MM-dd"));
  const isPast = (date: Date) => isBefore(date, today);

  // Compute preview range
  const previewEnd = rangeStart && !rangeEnd ? hoveredDate : rangeEnd;
  const previewStart = rangeStart;

  const isInRange = (date: Date) => {
    if (!previewStart || !previewEnd) return false;
    const start = isBefore(previewStart, previewEnd) ? previewStart : previewEnd;
    const end = isAfter(previewStart, previewEnd) ? previewStart : previewEnd;
    return (isSameDay(date, start) || isAfter(date, start)) && (isSameDay(date, end) || isBefore(date, end));
  };

  const handleDateClick = (date: Date) => {
    if (isPast(date) || isBooked(date)) return;

    if (!rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
    } else if (!rangeEnd) {
      // Set range end (allow reverse selection)
      const start = isBefore(date, rangeStart) ? date : rangeStart;
      const end = isAfter(date, rangeStart) ? date : rangeStart;
      setRangeStart(start);
      setRangeEnd(end);
    } else {
      // Reset and start new selection
      setRangeStart(date);
      setRangeEnd(null);
    }
  };

  const handleBlockRange = async () => {
    if (!rangeStart || !rangeEnd) return;
    setIsProcessing(true);
    try {
      const dates: string[] = [];
      const current = new Date(rangeStart);
      while (current <= rangeEnd) {
        const key = format(current, "yyyy-MM-dd");
        if (!bookedSet.has(key) && !blockedSet.has(key) && !isPast(current)) {
          dates.push(key);
        }
        current.setDate(current.getDate() + 1);
      }
      if (dates.length === 0) {
        toast.info("Toutes les dates sont déjà bloquées ou réservées.");
        return;
      }
      const inserts = dates.map((d) => ({ listing_id: listingId, date: d }));
      const { error } = await supabase.from("blocked_dates").insert(inserts as any);
      if (error) throw error;
      toast.success(`${dates.length} date${dates.length > 1 ? "s" : ""} bloquée${dates.length > 1 ? "s" : ""}`);
      qc.invalidateQueries({ queryKey: ["blocked-dates", listingId] });
      setRangeStart(null);
      setRangeEnd(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblockRange = async () => {
    if (!rangeStart || !rangeEnd) return;
    setIsProcessing(true);
    try {
      const dates: string[] = [];
      const current = new Date(rangeStart);
      while (current <= rangeEnd) {
        const key = format(current, "yyyy-MM-dd");
        if (blockedSet.has(key)) dates.push(key);
        current.setDate(current.getDate() + 1);
      }
      if (dates.length === 0) {
        toast.info("Aucune date bloquée dans cette période.");
        return;
      }
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("listing_id", listingId)
        .in("date", dates);
      if (error) throw error;
      toast.success(`${dates.length} date${dates.length > 1 ? "s" : ""} débloquée${dates.length > 1 ? "s" : ""}`);
      qc.invalidateQueries({ queryKey: ["blocked-dates", listingId] });
      setRangeStart(null);
      setRangeEnd(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate calendar days for a month
  const getMonthDays = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  };

  const renderMonth = (month: Date) => {
    const days = getMonthDays(month);
    return (
      <div>
        <h4 className="font-display font-semibold text-foreground text-center mb-3 capitalize">
          {format(month, "MMMM yyyy", { locale: fr })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, month);
            const past = isPast(day);
            const booked = isBooked(day);
            const blocked = isBlocked(day);
            const inRange = isInRange(day);
            const isStart = rangeStart && isSameDay(day, rangeStart);
            const isEnd = (rangeEnd && isSameDay(day, rangeEnd)) || (!rangeEnd && hoveredDate && rangeStart && isSameDay(day, hoveredDate));
            const available = inMonth && !past && !booked && !blocked;

            return (
              <button
                key={i}
                disabled={!inMonth || past || booked}
                onClick={() => inMonth && handleDateClick(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  "relative aspect-square flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer",
                  !inMonth && "invisible",
                  inMonth && past && "text-muted-foreground/30 cursor-not-allowed",
                  inMonth && booked && "bg-destructive/15 text-destructive line-through cursor-not-allowed",
                  inMonth && blocked && !inRange && "bg-muted-foreground/15 text-muted-foreground line-through",
                  inMonth && available && !inRange && "hover:bg-primary/10 text-foreground",
                  inRange && !booked && "bg-primary/20 text-primary font-semibold",
                  (isStart || isEnd) && !booked && "bg-primary text-primary-foreground font-bold ring-2 ring-primary/30",
                )}
              >
                {inMonth && format(day, "d")}
                {inMonth && available && !inRange && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (blockedLoading || bookedLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  const blockedCount = blockedDates?.length || 0;
  const rangeSelected = rangeStart && rangeEnd;

  // Count days in range
  let rangeDays = 0;
  let rangeBlockedCount = 0;
  let rangeAvailableCount = 0;
  if (rangeStart && rangeEnd) {
    const current = new Date(rangeStart);
    while (current <= rangeEnd) {
      const key = format(current, "yyyy-MM-dd");
      if (!isPast(current) && !bookedSet.has(key)) {
        rangeDays++;
        if (blockedSet.has(key)) rangeBlockedCount++;
        else rangeAvailableCount++;
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Gérer la disponibilité
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cliquez sur 2 dates pour sélectionner une période, puis bloquez ou débloquez.
          </p>
        </div>
        {blockedCount > 0 && (
          <Badge variant="outline" className="text-xs bg-muted-foreground/10 text-muted-foreground">
            {blockedCount} date{blockedCount > 1 ? "s" : ""} bloquée{blockedCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-card border border-border relative">
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
          </span>
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-destructive/15 border border-destructive/30" />
          Réservé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted-foreground/15 border border-muted-foreground/30" />
          Bloqué par vous
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
          Sélection
        </span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })} — {format(addMonths(currentMonth, 1), "MMMM yyyy", { locale: fr })}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid - 2 months */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>

      {/* Selection info bar */}
      {rangeStart && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {rangeEnd ? (
                  <>
                    {format(rangeStart, "d MMMM", { locale: fr })} → {format(rangeEnd, "d MMMM yyyy", { locale: fr })}
                  </>
                ) : (
                  <>Début : {format(rangeStart, "d MMMM yyyy", { locale: fr })} · <span className="text-primary">Cliquez sur la date de fin</span></>
                )}
              </p>
              {rangeSelected && (
                <p className="text-xs text-muted-foreground mt-1">
                  {rangeDays} jour{rangeDays > 1 ? "s" : ""} sélectionné{rangeDays > 1 ? "s" : ""}
                  {rangeAvailableCount > 0 && <> · {rangeAvailableCount} disponible{rangeAvailableCount > 1 ? "s" : ""}</>}
                  {rangeBlockedCount > 0 && <> · {rangeBlockedCount} bloquée{rangeBlockedCount > 1 ? "s" : ""}</>}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setRangeStart(null); setRangeEnd(null); }}>
              Annuler
            </Button>
          </div>

          {rangeSelected && (
            <div className="flex gap-2">
              {rangeAvailableCount > 0 && (
                <Button
                  size="sm"
                  className="rounded-full flex-1 gap-1.5 bg-muted-foreground hover:bg-muted-foreground/90 text-white"
                  disabled={isProcessing}
                  onClick={handleBlockRange}
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  Bloquer {rangeAvailableCount > 1 ? `${rangeAvailableCount} dates` : "cette date"}
                </Button>
              )}
              {rangeBlockedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full flex-1 gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  disabled={isProcessing}
                  onClick={handleUnblockRange}
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  Débloquer {rangeBlockedCount > 1 ? `${rangeBlockedCount} dates` : "cette date"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockedDatesCalendar;
