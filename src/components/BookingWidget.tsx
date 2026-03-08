import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Users, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { toast } from "sonner";

interface BookingWidgetProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
}

const SERVICE_FEE_RATE = 0.15;

const BookingWidget = ({ listingId, pricePerNight, maxGuests }: BookingWidgetProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [booked, setBooked] = useState(false);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const handleBook = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour réserver.");
      navigate("/login");
      return;
    }
    if (!checkIn || !checkOut || nights < 1) {
      toast.error("Veuillez sélectionner vos dates de séjour.");
      return;
    }

    try {
      await createBooking.mutateAsync({
        listing_id: listingId,
        guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"),
        check_out: format(checkOut, "yyyy-MM-dd"),
        guests,
        nights,
        price_per_night: pricePerNight,
        service_fee: serviceFee,
        total_price: total,
      });
      setBooked(true);
      toast.success("Réservation confirmée !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la réservation.");
    }
  };

  if (booked) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Réservation confirmée !</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Du {format(checkIn!, "d MMMM", { locale: fr })} au {format(checkOut!, "d MMMM yyyy", { locale: fr })}
        </p>
        <Button variant="outline" className="rounded-full" onClick={() => navigate("/dashboard")}>
          Voir mes réservations
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6">
      <div className="mb-4">
        <span className="text-2xl font-bold text-foreground">
          {pricePerNight.toLocaleString("fr-FR")} F
        </span>
        <span className="text-muted-foreground"> / nuit</span>
      </div>

      <div className="space-y-3 mb-6">
        {/* Check-in */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Arrivée
              </label>
              <p className="text-sm text-foreground mt-0.5">
                {checkIn ? format(checkIn, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkIn}
              onSelect={(d) => {
                setCheckIn(d);
                if (checkOut && d && d >= checkOut) setCheckOut(undefined);
              }}
              disabled={(date) => date < new Date()}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Check-out */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Départ
              </label>
              <p className="text-sm text-foreground mt-0.5">
                {checkOut ? format(checkOut, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date < (checkIn || new Date())}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Voyageurs
              </label>
              <p className="text-sm text-foreground mt-0.5">{guests} voyageur{guests > 1 ? "s" : ""}</p>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-4" align="start">
            <p className="text-sm font-medium text-foreground mb-3">Voyageurs</p>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
              <span className="font-medium text-foreground">{guests}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.min(maxGuests, guests + 1))}>+</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{pricePerNight.toLocaleString("fr-FR")} F × {nights} nuit{nights > 1 ? "s" : ""}</span>
            <span>{subtotal.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Frais de service (15%)</span>
            <span>{serviceFee.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span>{total.toLocaleString("fr-FR")} F</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleBook}
        disabled={!nights || createBooking.isPending}
        className="w-full rounded-xl h-12 bg-accent text-accent-foreground font-medium text-base hover:bg-accent/90 disabled:opacity-50"
      >
        {createBooking.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Réservation en cours...</>
        ) : nights > 0 ? (
          `Réserver · ${total.toLocaleString("fr-FR")} F`
        ) : (
          "Sélectionnez vos dates"
        )}
      </Button>
    </div>
  );
};

export default BookingWidget;
