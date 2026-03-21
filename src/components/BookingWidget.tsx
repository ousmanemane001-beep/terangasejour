import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Users, Loader2, CheckCircle, MessageCircle, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCalendarData } from "@/components/calendar/useCalendarData";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import { useCreateNotification } from "@/hooks/useAdmin";
import PaymentMethodSelector, { type PaymentMethod } from "@/components/PaymentMethodSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BookingWidgetProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
  bookingMode?: string;
  hostId?: string;
}

const SERVICE_FEE_RATE = 0.15;

const BookingWidget = ({ listingId, pricePerNight, maxGuests, bookingMode = "instant", hostId }: BookingWidgetProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const createNotification = useCreateNotification();
  const { dateMap } = useCalendarData(listingId);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [booked, setBooked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wave");
  const [showCalendar, setShowCalendar] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const isRequestMode = bookingMode === "request";

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const handleSelectDate = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(undefined);
    } else {
      if (date > checkIn) {
        // Verify no booked dates in between
        const current = new Date(checkIn);
        current.setDate(current.getDate() + 1);
        while (current < date) {
          const key = format(current, "yyyy-MM-dd");
          const info = dateMap.get(key);
          if (info && (info.status === "booked" || info.status === "blocked")) {
            setCheckIn(date);
            setCheckOut(undefined);
            return;
          }
          current.setDate(current.getDate() + 1);
        }
        setCheckOut(date);
        setShowCalendar(false);
      } else {
        setCheckIn(date);
        setCheckOut(undefined);
      }
    }
  };

  const handleRequestAvailability = async () => {
    if (!user) { toast.error("Connectez-vous pour faire une demande."); navigate("/login"); return; }
    if (!checkIn || !checkOut || nights < 1) { toast.error("Sélectionnez vos dates."); return; }
    try {
      await supabase.from("booking_requests").insert({
        listing_id: listingId, guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"), check_out: format(checkOut, "yyyy-MM-dd"),
        guests, message: requestMessage.trim() || null,
      } as any);
      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "booking_request", title: "Nouvelle demande de réservation",
          message: `Un voyageur souhaite réserver du ${format(checkIn, "d MMM", { locale: fr })} au ${format(checkOut, "d MMM", { locale: fr })}.`,
          data: { listing_id: listingId },
        });
      }
      setRequestSent(true);
      toast.success("Demande envoyée à l'hôte !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi.");
    }
  };

  const handleBook = async () => {
    if (!user) { toast.error("Veuillez vous connecter pour réserver."); navigate("/login"); return; }
    if (!checkIn || !checkOut || nights < 1) { toast.error("Veuillez sélectionner vos dates de séjour."); return; }
    if (!showConfirmForm) {
      setShowConfirmForm(true);
      setGuestEmail(user.email || "");
      setGuestName([user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" "));
      setGuestPhone(user.user_metadata?.phone || "");
      return;
    }
    if (!guestName.trim() || !guestEmail.trim()) { toast.error("Veuillez remplir votre nom et email."); return; }
    try {
      await createBooking.mutateAsync({
        listing_id: listingId, guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"), check_out: format(checkOut, "yyyy-MM-dd"),
        guests, nights, price_per_night: pricePerNight,
        service_fee: serviceFee, total_price: total, payment_method: paymentMethod,
      });
      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "new_booking", title: "Nouvelle réservation",
          message: `Réservation confirmée du ${format(checkIn, "d MMM", { locale: fr })} au ${format(checkOut, "d MMM", { locale: fr })} · ${total.toLocaleString("fr-FR")} F`,
          data: { listing_id: listingId },
        });
      }
      setBooked(true);
      toast.success("Réservation confirmée !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la réservation.");
    }
  };

  if (requestSent) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <MessageCircle className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Demande envoyée !</h3>
        <p className="text-sm text-muted-foreground mb-4">
          L'hôte va examiner votre demande pour le {format(checkIn!, "d MMMM", { locale: fr })} au {format(checkOut!, "d MMMM yyyy", { locale: fr })}.
        </p>
        <Button className="rounded-full bg-primary text-primary-foreground" onClick={() => navigate("/dashboard/my-bookings")}>
          Voir mes demandes
        </Button>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Réservation confirmée !</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Du {format(checkIn!, "d MMMM", { locale: fr })} au {format(checkOut!, "d MMMM yyyy", { locale: fr })}
        </p>
        <Button className="rounded-full bg-primary text-primary-foreground" onClick={() => navigate("/dashboard")}>
          Voir mes réservations
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border overflow-hidden">
      {/* Price header */}
      <div className="p-6 pb-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{pricePerNight.toLocaleString("fr-FR")} F</span>
          <span className="text-muted-foreground text-sm"> / nuit</span>
        </div>
      </div>

      {/* Date selectors */}
      <div className="p-6 pt-4 space-y-3">
        <div
          className="rounded-xl border border-border divide-y divide-border cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Arrivée</label>
              <p className="text-sm text-foreground font-medium mt-0.5">
                {checkIn ? format(checkIn, "d MMM yyyy", { locale: fr }) : "Ajouter"}
              </p>
            </div>
            <div className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Départ</label>
              <p className="text-sm text-foreground font-medium mt-0.5">
                {checkOut ? format(checkOut, "d MMM yyyy", { locale: fr }) : "Ajouter"}
              </p>
            </div>
          </div>
        </div>

        {/* Inline calendar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1">
                <CalendarGrid
                  dateMap={dateMap}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelectDate={handleSelectDate}
                  pricePerNight={pricePerNight}
                />
                {checkIn && !checkOut && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Sélectionnez votre date de départ
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guests selector */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Voyageurs</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{guests} voyageur{guests > 1 ? "s" : ""}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
      <AnimatePresence>
        {nights > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 overflow-hidden"
          >
            <div className="space-y-2 text-sm pb-4">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request mode message */}
      {isRequestMode && nights > 0 && (
        <div className="px-6 pb-4">
          <Textarea
            placeholder="Message à l'hôte (optionnel)..."
            className="rounded-xl"
            rows={3}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />
        </div>
      )}

      {/* Confirm form (instant mode) */}
      {!isRequestMode && showConfirmForm && nights > 0 && (
        <div className="px-6 pb-4 space-y-4">
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          <div className="space-y-3 p-4 rounded-xl bg-secondary border border-border">
            <h4 className="font-display font-semibold text-foreground text-sm">Vos informations</h4>
            <Input placeholder="Nom complet" className="rounded-xl" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            <Input placeholder="Email" type="email" className="rounded-xl" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            <Input placeholder="Téléphone" type="tel" className="rounded-xl" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="p-6 pt-0">
        {isRequestMode ? (
          <Button
            onClick={handleRequestAvailability}
            disabled={!nights}
            className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {nights > 0 ? "Demander la disponibilité" : "Sélectionnez vos dates"}
          </Button>
        ) : (
          <Button
            onClick={handleBook}
            disabled={!nights || createBooking.isPending}
            className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 disabled:opacity-50"
          >
            {createBooking.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Réservation en cours...</>
            ) : showConfirmForm ? (
              `Confirmer la réservation`
            ) : nights > 0 ? (
              `Réserver · ${total.toLocaleString("fr-FR")} F`
            ) : (
              "Sélectionnez vos dates"
            )}
          </Button>
        )}

        {isRequestMode && (
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            L'hôte doit approuver votre demande avant la réservation.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;
