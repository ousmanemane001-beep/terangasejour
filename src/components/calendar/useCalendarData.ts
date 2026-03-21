import { useMemo } from "react";
import { format } from "date-fns";
import { useBookedDates, BookedRange } from "@/hooks/useAvailability";
import { useBlockedDates, BlockedDate } from "@/hooks/useBlockedDates";
import type { DateInfo, DateStatus } from "./CalendarGrid";

export function useCalendarData(listingId: string | undefined) {
  const { data: bookedRanges, isLoading: loadingBooked } = useBookedDates(listingId);
  const { data: blockedDates, isLoading: loadingBlocked } = useBlockedDates(listingId);

  const dateMap = useMemo(() => {
    const map = new Map<string, DateInfo>();

    // Mark booked ranges
    if (bookedRanges) {
      for (const range of bookedRanges) {
        const start = new Date(range.check_in);
        const end = new Date(range.check_out);
        const current = new Date(start);
        while (current <= end) {
          const key = format(current, "yyyy-MM-dd");
          map.set(key, {
            date: new Date(current),
            status: "booked" as DateStatus,
          });
          current.setDate(current.getDate() + 1);
        }
      }
    }

    // Mark blocked dates (override if not already booked)
    if (blockedDates) {
      for (const bd of blockedDates) {
        const key = bd.date;
        if (!map.has(key)) {
          map.set(key, {
            date: new Date(key + "T00:00:00"),
            status: "blocked" as DateStatus,
            reason: bd.reason || "Maintenance",
          });
        }
      }
    }

    return map;
  }, [bookedRanges, blockedDates]);

  return {
    dateMap,
    isLoading: loadingBooked || loadingBlocked,
  };
}
