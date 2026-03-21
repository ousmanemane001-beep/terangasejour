import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Loader2, CheckCircle, MessageCircle, ChevronDown, Shield, Flame,
  CalendarCheck, Zap, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCalendarData } from "@/components/calendar/useCalendarData";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import { useCreateNotification } from "@/hooks/useAdmin";
import PaymentMethodSelector, { type PaymentMethod } from "@/components/PaymentMethodSelector";
import PassengerForm, { type PassengerInfo } from "@/components/booking/PassengerForm";
import CountdownTimer from "@/components/booking/CountdownTimer";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
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
const HOLD_MINUTES = 30;

type BookingStep = "dates" | "info" | "payment" | "hold" | "confirmed" | "expired" | "request-sent" | "request-approved";

const MODE_CONFIG = {
  instant: {
    icon: Zap,
    label: "Réservation instantanée",
    sublabel: "Confirmation immédiate après paiement",
    ctaText: "Réserver maintenant",
    ctaIcon: Zap,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
  request: {
    icon: MessageCircle,
    label: "Sur demande",
    sublabel: "L'hôte doit approuver votre demande",
    ctaText: "Demander la disponibilité",
    ctaIcon: MessageCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  calendar: {
    icon: CalendarCheck,
    label: "Selon disponibilités",
    sublabel: "Sélectionnez parmi les dates disponibles",
    ctaText: "Réserver ces dates",
    ctaIcon: CalendarCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
};

const BookingWidget = ({ listingId, pricePerNight, maxGuests, bookingMode = "instant", hostId }: BookingWidgetProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const createNotification = useCreateNotification();
  const { dateMap, isLoading: calendarLoading } = useCalendarData(listingId);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wave");
  const [showCalendar, setShowCalendar] = useState(bookingMode === "calendar");
  const [step, setStep] = useState<BookingStep>("dates");
  const [bookingId, setBookingId] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<string>();
  const [requestMessage, setRequestMessage] = useState("");

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: "", lastName: "", email: "", phone: "", passport: "", nationality: "",
  });

  const mode = (bookingMode === "instant" || bookingMode === "request" || bookingMode === "calendar")
    ? bookingMode : "instant";
  const config = MODE_CONFIG[mode];

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  // ─── Date selection with gap validation ───
  const handleSelectDate = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(undefined);
    } else {
      if (date > checkIn) {
        const current = new Date(checkIn);
        current.setDate(current.getDate() + 1);
        while (current < date) {
          const key = format(current, "yyyy-MM-dd");
          const info = dateMap.get(key);
          if (info && (info.status === "booked" || info.status === "blocked")) {
            toast.error("Des dates indisponibles se trouvent dans cette plage.");
            setCheckIn(date);
            setCheckOut(undefined);
            return;
          }
          current.setDate(current.getDate() + 1);
        }
        setCheckOut(date);
        if (mode !== "calendar") setShowCalendar(false);
      } else {
        setCheckIn(date);
        setCheckOut(undefined);
      }
    }
  };

  // ─── Proceed to info step ───
  const handleProceedToInfo = () => {
    if (!user) { toast.error("Connectez-vous pour réserver."); navigate("/login"); return; }
    if (!checkIn || !checkOut || nights < 1) { toast.error("Sélectionnez vos dates."); return; }
    setPassengerInfo((prev) => ({
      ...prev,
      firstName: prev.firstName || user.user_metadata?.first_name || "",
      lastName: prev.lastName || user.user_metadata?.last_name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.user_metadata?.phone || "",
    }));
    setStep("info");
  };

  // ─── Create booking (instant & calendar → hold with timer) ───
  const handleCreateHold = async () => {
    if (!user || !checkIn || !checkOut) return;
    if (!passengerInfo.firstName.trim() || !passengerInfo.lastName.trim() || !passengerInfo.email.trim()) {
      toast.error("Veuillez remplir au minimum votre nom et email."); return;
    }
    try {
      const expiry = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();
      const result = await createBooking.mutateAsync({
        listing_id: listingId, guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"), check_out: format(checkOut, "yyyy-MM-dd"),
        guests, nights, price_per_night: pricePerNight,
        service_fee: serviceFee, total_price: total, payment_method: paymentMethod,
      });
      await supabase.from("bookings").update({
        expires_at: expiry,
        guest_name: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
        guest_email: passengerInfo.email,
        guest_phone: passengerInfo.phone,
        passport_number: passengerInfo.passport || null,
        nationality: passengerInfo.nationality || null,
      } as any).eq("id", result.id);

      setBookingId(result.id);
      setExpiresAt(expiry);
      setStep("hold");

      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "new_booking", title: "Nouvelle réservation",
          message: `${passengerInfo.firstName} ${passengerInfo.lastName} · ${format(checkIn, "d MMM", { locale: fr })} → ${format(checkOut, "d MMM", { locale: fr })} · ${total.toLocaleString("fr-FR")} F`,
          data: { listing_id: listingId, booking_id: result.id },
        });
      }
      toast.success("Réservation créée ! Confirmez votre paiement sous 30 minutes.");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la réservation.");
    }
  };

  // ─── Request booking (request mode) ───
  const handleRequestBooking = async () => {
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
      setStep("request-sent");
      toast.success("Demande envoyée à l'hôte !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi.");
    }
  };

  // ─── Confirm payment ───
  const handleConfirmPayment = async () => {
    if (!bookingId) return;
    try {
      await supabase.from("bookings").update({
        payment_status: "paid", status: "confirmed", updated_at: new Date().toISOString(),
      } as any).eq("id", bookingId);
      setStep("confirmed");
      toast.success("Paiement confirmé ! Réservation validée.");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du paiement.");
    }
  };

  // ─── Expiration ───
  const handleExpire = useCallback(async () => {
    if (bookingId) {
      await supabase.from("bookings").update({
        status: "expired", updated_at: new Date().toISOString(),
      } as any).eq("id", bookingId);
    }
    setStep("expired");
  }, [bookingId]);

  // ─── TERMINAL STATES ───

  if (step === "request-sent") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-7 h-7 text-amber-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Demande envoyée !</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {format(checkIn!, "d MMMM", { locale: fr })} → {format(checkOut!, "d MMMM yyyy", { locale: fr })}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          L'hôte va examiner votre demande. Vous serez notifié dès qu'il répond.
        </p>
        <div className="bg-secondary rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Si approuvé, vous pourrez payer pour confirmer.</span>
          </div>
        </div>
        <Button className="rounded-full bg-primary text-primary-foreground w-full" onClick={() => navigate("/dashboard/my-bookings")}>
          Voir mes demandes
        </Button>
      </div>
    );
  }

  if (step === "confirmed") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">Réservation confirmée !</h3>
        <BookingStatusBadge status="confirmed" />
        <p className="text-sm text-muted-foreground mt-3 mb-4">
          {format(checkIn!, "d MMMM", { locale: fr })} → {format(checkOut!, "d MMMM yyyy", { locale: fr })}
        </p>
        <div className="bg-secondary rounded-xl p-4 text-left space-y-1 mb-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total payé</span><span className="font-bold text-foreground">{total.toLocaleString("fr-FR")} F</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nuits</span><span className="text-foreground">{nights}</span></div>
        </div>
        <Button className="rounded-full bg-primary text-primary-foreground w-full" onClick={() => navigate("/dashboard/my-bookings")}>
          Voir mes voyages
        </Button>
      </div>
    );
  }

  if (step === "expired") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <BookingStatusBadge status="expired" />
        <h3 className="font-display text-lg font-bold text-foreground mt-3 mb-1">Réservation expirée</h3>
        <p className="text-sm text-muted-foreground mb-4">Le délai de 30 minutes a été dépassé.</p>
        <Button className="rounded-full bg-primary text-primary-foreground w-full" onClick={() => { setStep("dates"); setBookingId(undefined); setExpiresAt(undefined); }}>
          Recommencer
        </Button>
      </div>
    );
  }

  // ─── HOLD STATE (countdown + payment) ───
  if (step === "hold" && expiresAt) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <BookingStatusBadge status="pending" />
            <h3 className="font-display text-lg font-bold text-foreground mt-3">Réservation en attente</h3>
            <p className="text-sm text-muted-foreground mt-1">Payez pour confirmer votre réservation</p>
          </div>
          <CountdownTimer expiresAt={expiresAt} onExpire={handleExpire} variant="banner" />
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{format(checkIn!, "d MMM", { locale: fr })} → {format(checkOut!, "d MMM", { locale: fr })}</span>
              <span className="text-foreground font-medium">{nights} nuit{nights > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pricePerNight.toLocaleString("fr-FR")} F × {nights}</span>
              <span className="text-foreground">{subtotal.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frais de service</span>
              <span className="text-foreground">{serviceFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-foreground text-lg">{total.toLocaleString("fr-FR")} F</span>
            </div>
          </div>
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          <Button onClick={handleConfirmPayment} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base">
            <Shield className="w-4 h-4 mr-2" />
            Payer et confirmer · {total.toLocaleString("fr-FR")} F
          </Button>
          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Paiement sécurisé · Annulation gratuite sous 24h
          </p>
        </div>
      </div>
    );
  }

  // ─── MAIN BOOKING FLOW ───
  return (
    <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border overflow-hidden">
      {/* Price header */}
      <div className="p-6 pb-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{pricePerNight.toLocaleString("fr-FR")} F</span>
          <span className="text-muted-foreground text-sm"> / nuit</span>
        </div>

        {/* Booking mode badge */}
        <div className={cn("mt-3 flex items-center gap-2 rounded-lg px-3 py-2 border text-xs font-medium", config.bgColor, config.borderColor, config.color)}>
          <config.icon className="w-3.5 h-3.5 shrink-0" />
          <div>
            <p className="font-semibold leading-tight">{config.label}</p>
            <p className="font-normal opacity-80 leading-tight">{config.sublabel}</p>
          </div>
        </div>

        {nights > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Flame className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs text-destructive font-medium">Forte demande · Prix garanti à la réservation</span>
          </div>
        )}
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
                {checkIn ? format(checkIn, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
              </p>
            </div>
            <div className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Départ</label>
              <p className="text-sm text-foreground font-medium mt-0.5">
                {checkOut ? format(checkOut, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
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
                {/* Calendar legend for calendar mode */}
                {mode === "calendar" && (
                  <div className="flex flex-wrap gap-3 mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                      <span className="text-muted-foreground">Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
                      <span className="text-muted-foreground">Réservé</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-muted border border-border" />
                      <span className="text-muted-foreground">Bloqué</span>
                    </div>
                  </div>
                )}
                <CalendarGrid
                  dateMap={dateMap}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelectDate={handleSelectDate}
                  pricePerNight={pricePerNight}
                />
                {checkIn && !checkOut && (
                  <p className="text-xs text-muted-foreground text-center mt-2">Sélectionnez votre date de départ</p>
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

      {/* Step: Passenger info (instant & calendar modes) */}
      <AnimatePresence>
        {step === "info" && nights > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-4 overflow-hidden"
          >
            <PassengerForm data={passengerInfo} onChange={setPassengerInfo} />
            <div className="mt-3">
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request mode: predefined messages */}
      {mode === "request" && nights > 0 && step === "dates" && (
        <div className="px-6 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Message à l'hôte :</p>
          {[
            "Je souhaite vérifier la disponibilité pour ces dates.",
            "Est-il possible d'arriver plus tard ?",
            "Y a-t-il des équipements spécifiques disponibles ?",
            "Je voyage en famille, est-ce adapté ?",
          ].map((msg) => (
            <button
              key={msg}
              type="button"
              onClick={() => setRequestMessage(msg)}
              className={cn(
                "w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all",
                requestMessage === msg
                  ? "border-primary bg-primary/5 text-foreground font-medium"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* CTA Button area */}
      <div className="p-6 pt-0">
        {mode === "request" && step === "dates" ? (
          <>
            <Button
              onClick={handleRequestBooking}
              disabled={!nights}
              className={cn(
                "w-full rounded-xl h-12 font-medium text-base",
                "bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
              )}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {nights > 0 ? `Demander la disponibilité · ${total.toLocaleString("fr-FR")} F` : "Sélectionnez vos dates"}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Aucun paiement maintenant · L'hôte doit d'abord approuver
            </p>
          </>
        ) : step === "dates" ? (
          <>
            <Button
              onClick={handleProceedToInfo}
              disabled={!nights}
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 disabled:opacity-50"
            >
              <config.ctaIcon className="w-4 h-4 mr-2" />
              {nights > 0 ? `${config.ctaText} · ${total.toLocaleString("fr-FR")} F` : "Sélectionnez vos dates"}
            </Button>
            {mode === "instant" && (
              <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Confirmation immédiate après paiement
              </p>
            )}
            {mode === "calendar" && (
              <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <CalendarCheck className="w-3 h-3" /> Paiement direct · Dates garanties
              </p>
            )}
          </>
        ) : step === "info" ? (
          <>
            <Button
              onClick={handleCreateHold}
              disabled={createBooking.isPending}
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90"
            >
              {createBooking.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Réservation en cours...</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" /> Réserver · {total.toLocaleString("fr-FR")} F</>
              )}
            </Button>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Votre réservation sera bloquée 30 min pour le paiement
              </p>
              <button onClick={() => setStep("dates")} className="text-xs text-primary hover:underline w-full text-center">
                ← Modifier les dates
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BookingWidget;
