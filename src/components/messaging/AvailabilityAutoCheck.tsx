import { CalendarDays, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useBookedDates } from "@/hooks/useAvailability";
import { useBlockedDates } from "@/hooks/useBlockedDates";

interface Props {
  listingId: string;
}

export default function AvailabilityAutoCheck({ listingId }: Props) {
  const { data: bookedRanges, isLoading: bookingsLoading } = useBookedDates(listingId);
  const { data: blockedDates, isLoading: blockedLoading } = useBlockedDates(listingId);

  const loading = bookingsLoading || blockedLoading;

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Vérification de la disponibilité…
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next30 = new Date(today);
  next30.setDate(next30.getDate() + 30);

  // Check if any of the next 30 days are fully blocked
  const blockedSet = new Set(blockedDates?.map((d) => d.date) || []);
  const bookedDays = new Set<string>();
  
  for (const range of bookedRanges || []) {
    const start = new Date(range.check_in);
    const end = new Date(range.check_out);
    const cur = new Date(start);
    while (cur <= end) {
      bookedDays.add(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  }

  let availableDays = 0;
  const check = new Date(today);
  while (check <= next30) {
    const dateStr = check.toISOString().slice(0, 10);
    if (!blockedSet.has(dateStr) && !bookedDays.has(dateStr)) {
      availableDays++;
    }
    check.setDate(check.getDate() + 1);
  }

  const isAvailable = availableDays > 5;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isAvailable ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
      {isAvailable ? (
        <>
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Ce logement a des disponibilités dans les 30 prochains jours ({availableDays} jours disponibles).</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Ce logement a très peu de disponibilités dans les 30 prochains jours. Nous vous conseillons de consulter le calendrier.</span>
        </>
      )}
    </div>
  );
}
