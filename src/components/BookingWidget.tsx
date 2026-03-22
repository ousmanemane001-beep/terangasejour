import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Loader2, CheckCircle, MessageCircle, ChevronDown, Shield, Flame,
  CalendarCheck, Zap, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useTranslation } from "react-i18next";

interface BookingWidgetProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
  bookingMode?: string;
  hostId?: string;
  cancellationPolicy?: string;
}

const SERVICE_FEE_RATE = 0.15;
const HOLD_MINUTES = 30;

type BookingStep = "dates" | "info" | "payment" | "hold" | "confirmed" | "expired" | "request-sent" | "request-approved";

const BookingWidget = ({ listingId, pricePerNight, maxGuests, bookingMode = "instant", hostId, cancellationPolicy = "flexible" }: BookingWidgetProps) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const createNotification = useCreateNotification();
  const { dateMap, isLoading: calendarLoading } = useCalendarData(listingId);

  const CANCELLATION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    flexible: { label: t("bookingWidget.cancelFlexible"), icon: "✅", color: "text-emerald-600" },
    moderate: { label: t("bookingWidget.cancelModerate"), icon: "⚠️", color: "text-amber-600" },
    strict: { label: t("bookingWidget.cancelStrict"), icon: "🚫", color: "text-red-600" },
  };

  const MODE_CONFIG = {
    instant: {
      icon: Zap, label: t("booking.instantBooking"), sublabel: t("booking.instantConfirm"),
      ctaText: t("listing.bookNow"), ctaIcon: Zap,
      color: "text-primary", bgColor: "bg-primary/5", borderColor: "border-primary/20",
    },
    request: {
      icon: MessageCircle, label: t("bookingWidget.onRequest"), sublabel: t("bookingWidget.hostMustApprove"),
      ctaText: t("bookingWidget.checkAvailability"), ctaIcon: MessageCircle,
      color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200",
    },
    calendar: {
      icon: CalendarCheck, label: t("bookingWidget.byAvailability"), sublabel: t("bookingWidget.selectAvailDates"),
      ctaText: t("bookingWidget.bookDates"), ctaIcon: CalendarCheck,
      color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    },
  };

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

  const guestLabel = `${guests} ${guests > 1 ? t("search.travelers_plural") : t("search.traveler")}`;

  const handleSelectDate = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date); setCheckOut(undefined);
    } else {
      if (date > checkIn) {
        const current = new Date(checkIn);
        current.setDate(current.getDate() + 1);
        while (current < date) {
          const key = format(current, "yyyy-MM-dd");
          const info = dateMap.get(key);
          if (info && (info.status === "booked" || info.status === "blocked")) {
            toast.error(t("bookingWidget.unavailableDates"));
            setCheckIn(date); setCheckOut(undefined); return;
          }
          current.setDate(current.getDate() + 1);
        }
        setCheckOut(date);
        if (mode !== "calendar") setShowCalendar(false);
      } else { setCheckIn(date); setCheckOut(undefined); }
    }
  };

  const handleProceedToInfo = () => {
    if (!user) { toast.error(t("bookingWidget.loginToBook")); navigate("/login"); return; }
    if (!checkIn || !checkOut || nights < 1) { toast.error(t("listing.selectDates")); return; }
    setPassengerInfo((prev) => ({
      ...prev,
      firstName: prev.firstName || user.user_metadata?.first_name || "",
      lastName: prev.lastName || user.user_metadata?.last_name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.user_metadata?.phone || "",
    }));
    setStep("info");
  };

  const handleCreateHold = async () => {
    if (!user || !checkIn || !checkOut) return;
    if (!passengerInfo.firstName.trim() || !passengerInfo.lastName.trim() || !passengerInfo.email.trim()) {
      toast.error(t("bookingWidget.fillNameEmail")); return;
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
      } as any).eq("id", result.id);
      await supabase.from("booking_guest_details").insert({
        booking_id: result.id, guest_email: passengerInfo.email,
        guest_phone: passengerInfo.phone, passport_number: passengerInfo.passport || null,
        nationality: passengerInfo.nationality || null,
      } as any);
      setBookingId(result.id); setExpiresAt(expiry); setStep("hold");
      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "new_booking", title: t("bookingWidget.newBookingNotif"),
          message: `${passengerInfo.firstName} ${passengerInfo.lastName} · ${format(checkIn, "d MMM", { locale: dateLocale })} → ${format(checkOut, "d MMM", { locale: dateLocale })} · ${total.toLocaleString("fr-FR")} F`,
          data: { listing_id: listingId, booking_id: result.id },
        });
      }
      toast.success(t("bookingWidget.bookingCreated"));
    } catch (err: any) { toast.error(err.message || t("bookingWidget.bookingError")); }
  };

  const handleRequestBooking = async () => {
    if (!user) { toast.error(t("bookingWidget.loginToRequest")); navigate("/login"); return; }
    if (!checkIn || !checkOut || nights < 1) { toast.error(t("listing.selectDates")); return; }
    try {
      await supabase.from("booking_requests").insert({
        listing_id: listingId, guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"), check_out: format(checkOut, "yyyy-MM-dd"),
        guests, message: requestMessage.trim() || null,
      } as any);
      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "booking_request", title: t("bookingWidget.newRequestNotif"),
          message: t("bookingWidget.requestNotifMsg", { from: format(checkIn, "d MMM", { locale: dateLocale }), to: format(checkOut, "d MMM", { locale: dateLocale }) }),
          data: { listing_id: listingId },
        });
      }
      setStep("request-sent");
      toast.success(t("bookingWidget.requestSent"));
    } catch (err: any) { toast.error(err.message || t("bookingWidget.sendError")); }
  };

  const handleConfirmPayment = async () => {
    if (!bookingId) return;
    try {
      await supabase.from("bookings").update({
        payment_status: "paid", status: "confirmed", updated_at: new Date().toISOString(),
      } as any).eq("id", bookingId);
      setStep("confirmed");
      toast.success(t("bookingWidget.paymentConfirmed"));
    } catch (err: any) { toast.error(err.message || t("bookingWidget.paymentError")); }
  };

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
        <h3 className="font-display text-lg font-bold text-foreground mb-1">{t("bookingWidget.requestSentTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {format(checkIn!, "d MMMM", { locale: dateLocale })} → {format(checkOut!, "d MMMM yyyy", { locale: dateLocale })}
        </p>
        <p className="text-xs text-muted-foreground mb-4">{t("bookingWidget.hostWillReview")}</p>
        <div className="bg-secondary rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{t("bookingWidget.ifApproved")}</span>
          </div>
        </div>
        <Button className="rounded-full bg-primary text-primary-foreground w-full" onClick={() => navigate("/dashboard/my-bookings")}>
          {t("bookingWidget.viewMyRequests")}
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
        <h3 className="font-display text-lg font-bold text-foreground mb-1">{t("bookingWidget.confirmedTitle")}</h3>
        <BookingStatusBadge status="confirmed" />
        <p className="text-sm text-muted-foreground mt-3 mb-4">
          {format(checkIn!, "d MMMM", { locale: dateLocale })} → {format(checkOut!, "d MMMM yyyy", { locale: dateLocale })}
        </p>
        <div className="bg-secondary rounded-xl p-4 text-left space-y-1 mb-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("bookingWidget.totalPaid")}</span><span className="font-bold text-foreground">{total.toLocaleString("fr-FR")} F</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("booking.nights")}</span><span className="text-foreground">{nights}</span></div>
        </div>
        <Button className="rounded-full bg-primary text-primary-foreground w-full mb-4" onClick={() => navigate("/dashboard/my-bookings")}>
          {t("bookingWidget.viewMyTrips")}
        </Button>
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-left">
          <p className="text-sm font-semibold text-foreground mb-1">🏠 {t("bookingWidget.haveProperty")}</p>
          <p className="text-xs text-muted-foreground mb-3">{t("listing.publishEarn")}</p>
          <Button variant="outline" size="sm" className="rounded-full border-primary text-primary hover:bg-primary/10 w-full" onClick={() => navigate("/become-host")}>
            {t("home.becomeHost")}
          </Button>
        </div>
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
        <h3 className="font-display text-lg font-bold text-foreground mt-3 mb-1">{t("bookingWidget.expiredTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("bookingWidget.expiredDesc")}</p>
        <Button className="rounded-full bg-primary text-primary-foreground w-full" onClick={() => { setStep("dates"); setBookingId(undefined); setExpiresAt(undefined); }}>
          {t("bookingWidget.startOver")}
        </Button>
      </div>
    );
  }

  if (step === "hold" && expiresAt) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <BookingStatusBadge status="pending" />
            <h3 className="font-display text-lg font-bold text-foreground mt-3">{t("bookingWidget.pendingTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("bookingWidget.payToConfirm")}</p>
          </div>
          <CountdownTimer expiresAt={expiresAt} onExpire={handleExpire} variant="banner" />
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{format(checkIn!, "d MMM", { locale: dateLocale })} → {format(checkOut!, "d MMM", { locale: dateLocale })}</span>
              <span className="text-foreground font-medium">{nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pricePerNight.toLocaleString("fr-FR")} F × {nights}</span>
              <span className="text-foreground">{subtotal.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("booking.serviceFee")}</span>
              <span className="text-foreground">{serviceFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">{t("booking.total")}</span>
              <span className="font-bold text-foreground text-lg">{total.toLocaleString("fr-FR")} F</span>
            </div>
          </div>
          {CANCELLATION_LABELS[cancellationPolicy] && (
            <div className="flex items-center gap-2 text-xs py-2">
              <span>{CANCELLATION_LABELS[cancellationPolicy].icon}</span>
              <span className={CANCELLATION_LABELS[cancellationPolicy].color}>
                {CANCELLATION_LABELS[cancellationPolicy].label}
              </span>
            </div>
          )}
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          <Button onClick={handleConfirmPayment} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base">
            <Shield className="w-4 h-4 mr-2" />
            {t("bookingWidget.payAndConfirm")} · {total.toLocaleString("fr-FR")} F
          </Button>
          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> {t("bookingWidget.securePayment")}
          </p>
        </div>
      </div>
    );
  }

  // ─── MAIN BOOKING FLOW ───
  return (
    <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{pricePerNight.toLocaleString("fr-FR")} F</span>
          <span className="text-muted-foreground text-sm"> {t("listing.perNight")}</span>
        </div>

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
            <span className="text-xs text-destructive font-medium">{t("bookingWidget.highDemand")}</span>
          </div>
        )}
      </div>

      <div className="p-6 pt-4 space-y-3">
        <div
          className="rounded-xl border border-border divide-y divide-border cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.arrival")}</label>
              <p className="text-sm text-foreground font-medium mt-0.5">
                {checkIn ? format(checkIn, "d MMM yyyy", { locale: dateLocale }) : t("bookingWidget.select")}
              </p>
            </div>
            <div className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.departure")}</label>
              <p className="text-sm text-foreground font-medium mt-0.5">
                {checkOut ? format(checkOut, "d MMM yyyy", { locale: dateLocale }) : t("bookingWidget.select")}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCalendar && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="pt-2 pb-1">
                {mode === "calendar" && (
                  <div className="flex flex-wrap gap-3 mb-3 px-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                      <span className="text-muted-foreground">{t("bookingWidget.available")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
                      <span className="text-muted-foreground">{t("bookingWidget.booked")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-3 h-3 rounded-sm bg-muted border border-border" />
                      <span className="text-muted-foreground">{t("bookingWidget.blocked")}</span>
                    </div>
                  </div>
                )}
                <CalendarGrid dateMap={dateMap} checkIn={checkIn} checkOut={checkOut} onSelectDate={handleSelectDate} pricePerNight={pricePerNight} />
                {checkIn && !checkOut && (
                  <p className="text-xs text-muted-foreground text-center mt-2">{t("bookingWidget.selectDeparture")}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.travelers")}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{guestLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-4" align="start">
            <p className="text-sm font-medium text-foreground mb-3">{t("search.travelers")}</p>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
              <span className="font-medium text-foreground">{guests}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuests(Math.min(maxGuests, guests + 1))}>+</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <AnimatePresence>
        {nights > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 overflow-hidden">
            <div className="space-y-2 text-sm pb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>{pricePerNight.toLocaleString("fr-FR")} F × {nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</span>
                <span>{subtotal.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("booking.serviceFee")} (15%)</span>
                <span>{serviceFee.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                <span>{t("booking.total")}</span>
                <span>{total.toLocaleString("fr-FR")} F</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step === "info" && nights > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-4 overflow-hidden">
            <PassengerForm data={passengerInfo} onChange={setPassengerInfo} />
            <div className="mt-3">
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "request" && nights > 0 && step === "dates" && (
        <div className="px-6 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">{t("bookingWidget.messageToHost")}:</p>
          {[
            t("bookingWidget.msg1"), t("bookingWidget.msg2"), t("bookingWidget.msg3"), t("bookingWidget.msg4"),
          ].map((msg) => (
            <button key={msg} type="button" onClick={() => setRequestMessage(msg)}
              className={cn("w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all",
                requestMessage === msg ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
              )}>{msg}</button>
          ))}
        </div>
      )}

      <div className="p-6 pt-0">
        {mode === "request" && step === "dates" ? (
          <>
            <Button onClick={handleRequestBooking} disabled={!nights}
              className={cn("w-full rounded-xl h-12 font-medium text-base", "bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {nights > 0 ? `${t("bookingWidget.checkAvailability")} · ${total.toLocaleString("fr-FR")} F` : t("listing.selectDates")}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">{t("bookingWidget.noPaymentNow")}</p>
          </>
        ) : step === "dates" ? (
          <>
            <Button onClick={handleProceedToInfo} disabled={!nights}
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 disabled:opacity-50">
              <config.ctaIcon className="w-4 h-4 mr-2" />
              {nights > 0 ? `${config.ctaText} · ${total.toLocaleString("fr-FR")} F` : t("listing.selectDates")}
            </Button>
            {mode === "instant" && (
              <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> {t("booking.instantConfirm")}
              </p>
            )}
            {mode === "calendar" && (
              <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <CalendarCheck className="w-3 h-3" /> {t("bookingWidget.directPayment")}
              </p>
            )}
          </>
        ) : step === "info" ? (
          <>
            <Button onClick={handleCreateHold} disabled={createBooking.isPending}
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90">
              {createBooking.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("bookingWidget.bookingInProgress")}</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" /> {t("listing.bookNow")} · {total.toLocaleString("fr-FR")} F</>
              )}
            </Button>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> {t("bookingWidget.holdNote")}
              </p>
              <button onClick={() => setStep("dates")} className="text-xs text-primary hover:underline w-full text-center">
                ← {t("bookingWidget.editDates")}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BookingWidget;
