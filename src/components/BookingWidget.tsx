import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Loader2, CheckCircle, ChevronDown, Shield,
  Zap, Clock, AlertTriangle, CalendarDays, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { useBookedDates, getDisabledDates } from "@/hooks/useAvailability";
import { useBlockedDates } from "@/hooks/useBlockedDates";
import { useCreateNotification } from "@/hooks/useAdmin";
import PaymentMethodSelector, { type PaymentMethod } from "@/components/PaymentMethodSelector";
import CountdownTimer from "@/components/booking/CountdownTimer";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface BookingWidgetProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
  bookingMode?: string;
  hostId?: string;
  cancellationPolicy?: string;
  listingImage?: string;
  listingTitle?: string;
}

const SERVICE_FEE_RATE = 0.15;
const HOLD_MINUTES = 30;

type BookingStep = "dates" | "confirm" | "payment" | "confirmed" | "expired";

const STORAGE_KEY = "teranga_booking_draft";

interface BookingDraft {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  savedAt: number;
}

const saveDraft = (draft: BookingDraft) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch {}
};

const loadDraft = (listingId: string): BookingDraft | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft: BookingDraft = JSON.parse(raw);
    if (draft.listingId !== listingId) return null;
    // Expire after 1 hour
    if (Date.now() - draft.savedAt > 3600000) { sessionStorage.removeItem(STORAGE_KEY); return null; }
    return draft;
  } catch { return null; }
};

const clearDraft = () => {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
};

const BookingWidget = ({
  listingId, pricePerNight, maxGuests, bookingMode = "instant",
  hostId, listingImage, listingTitle,
}: BookingWidgetProps) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const { user } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const createNotification = useCreateNotification();

  const { data: bookedRanges = [] } = useBookedDates(listingId);
  const { data: blockedDatesData = [] } = useBlockedDates(listingId);
  const blockedDateStrings = blockedDatesData.map((d: any) => d.date);
  const disabledDates = getDisabledDates(bookedRanges, blockedDateStrings);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wave");
  const [step, setStep] = useState<BookingStep>("dates");
  const [bookingId, setBookingId] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<string>();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  // Login dialog state
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Restore draft on mount or after login
  useEffect(() => {
    const draft = loadDraft(listingId);
    if (draft && user) {
      setCheckIn(new Date(draft.checkIn));
      setCheckOut(new Date(draft.checkOut));
      setGuests(draft.guests);
      clearDraft();
      toast.success(t("bookingWidget.dataSaved"));
      setTimeout(() => setStep("confirm"), 300);
    } else if (draft && !user) {
      setCheckIn(new Date(draft.checkIn));
      setCheckOut(new Date(draft.checkOut));
      setGuests(draft.guests);
    }
  }, [listingId, user]);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    if (date < today) return true;
    return disabledDates.some(d => d.toDateString() === date.toDateString());
  };

  const isCheckOutDisabled = (date: Date) => {
    if (!checkIn) return true;
    if (date <= checkIn) return true;
    if (date < today) return true;
    const current = new Date(checkIn);
    current.setDate(current.getDate() + 1);
    while (current < date) {
      if (disabledDates.some(d => d.toDateString() === current.toDateString())) return true;
      current.setDate(current.getDate() + 1);
    }
    return disabledDates.some(d => d.toDateString() === date.toDateString());
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    if (!date) return;
    setCheckIn(date);
    setCheckOut(undefined);
    setCheckInOpen(false);
    setTimeout(() => setCheckOutOpen(true), 200);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (!date) return;
    setCheckOut(date);
    setCheckOutOpen(false);
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut || nights < 1) { toast.error(t("listing.selectDates")); return; }
    if (!user) {
      // Save draft and show login dialog
      saveDraft({ listingId, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), guests, savedAt: Date.now() });
      setShowLoginDialog(true);
      return;
    }
    setStep("confirm");
  };

  const handleDialogLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error(t("auth.fillAllFields")); return; }
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? t("auth.invalidCredentials") : error.message);
        return;
      }
      setShowLoginDialog(false);
      toast.success(t("bookingWidget.dataSaved"));
      // The useEffect will restore draft and go to confirm
    } catch { toast.error(t("auth.error")); }
    finally { setLoginLoading(false); }
  };

  const handleConfirmBooking = async () => {
    if (!user || !checkIn || !checkOut) return;
    try {
      const expiry = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();
      const result = await createBooking.mutateAsync({
        listing_id: listingId, guest_id: user.id,
        check_in: format(checkIn, "yyyy-MM-dd"), check_out: format(checkOut, "yyyy-MM-dd"),
        guests, nights, price_per_night: pricePerNight,
        service_fee: serviceFee, total_price: total, payment_method: paymentMethod,
      });
      await supabase.from("bookings").update({ expires_at: expiry } as any).eq("id", result.id);
      setBookingId(result.id);
      setExpiresAt(expiry);
      setStep("payment");
      clearDraft();
      if (hostId) {
        await createNotification.mutateAsync({
          user_id: hostId, type: "new_booking", title: t("bookingWidget.newBookingNotif"),
          message: `${format(checkIn, "d MMM", { locale: dateLocale })} → ${format(checkOut, "d MMM", { locale: dateLocale })} · ${total.toLocaleString("fr-FR")} F`,
          data: { listing_id: listingId, booking_id: result.id },
        });
      }
      toast.success(t("bookingWidget.bookingCreated"));
    } catch (err: any) { toast.error(err.message || t("bookingWidget.bookingError")); }
  };

  const handlePaymentDone = async () => {
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

  const formatDateRange = () => {
    if (!checkIn || !checkOut) return "";
    return `${format(checkIn, "d MMM", { locale: dateLocale })} → ${format(checkOut, "d MMM", { locale: dateLocale })}`;
  };

  // ─── CONFIRMED ───
  if (step === "confirmed") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-lg border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{t("bookingWidget.confirmedTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{formatDateRange()} · {nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</p>
        <div className="bg-secondary rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm font-semibold">
            <span>{t("booking.total")}</span>
            <span>{total.toLocaleString("fr-FR")} F</span>
          </div>
        </div>
        <Button className="w-full rounded-xl h-11 bg-primary text-primary-foreground" onClick={() => navigate("/dashboard/my-bookings")}>
          {t("bookingWidget.viewMyTrips")}
        </Button>
      </div>
    );
  }

  // ─── EXPIRED ───
  if (step === "expired") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-lg border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{t("bookingWidget.expiredTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("bookingWidget.expiredDesc")}</p>
        <Button className="w-full rounded-xl h-11 bg-primary text-primary-foreground" onClick={() => { setStep("dates"); setBookingId(undefined); setExpiresAt(undefined); }}>
          {t("bookingWidget.startOver")}
        </Button>
      </div>
    );
  }

  // ─── PAYMENT ───
  if (step === "payment" && expiresAt) {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <BookingStatusBadge status="pending" />
            <h3 className="font-display text-lg font-bold text-foreground mt-3">{t("bookingWidget.pendingTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("bookingWidget.payToConfirm")}</p>
          </div>
          <CountdownTimer expiresAt={expiresAt} onExpire={handleExpire} variant="banner" />
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{formatDateRange()}</span>
              <span className="text-foreground font-medium">{nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pricePerNight.toLocaleString("fr-FR")} F × {nights}</span>
              <span>{subtotal.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("booking.serviceFee")}</span>
              <span>{serviceFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
              <span>{t("booking.total")}</span>
              <span className="text-lg">{total.toLocaleString("fr-FR")} F</span>
            </div>
          </div>
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          <Button onClick={handlePaymentDone} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base">
            <CheckCircle className="w-4 h-4 mr-2" />
            {t("bookingWidget.iHavePaid")} · {total.toLocaleString("fr-FR")} F
          </Button>
          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> {t("bookingWidget.securePayment")}
          </p>
        </div>
      </div>
    );
  }

  // ─── CONFIRMATION PAGE ───
  if (step === "confirm") {
    return (
      <div className="sticky top-24 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        {listingImage && (
          <img src={listingImage} alt={listingTitle || ""} className="w-full h-40 object-cover" />
        )}
        <div className="p-6 space-y-4">
          {listingTitle && <h3 className="font-display text-lg font-bold text-foreground">{listingTitle}</h3>}
          
          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-medium">{formatDateRange()}</span>
              <span className="text-muted-foreground">· {nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</span>
            </div>
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pricePerNight.toLocaleString("fr-FR")} F × {nights}</span>
                <span>{subtotal.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("booking.serviceFee")}</span>
                <span>{serviceFee.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>{t("booking.total")}</span>
                <span>{total.toLocaleString("fr-FR")} F</span>
              </div>
            </div>
          </div>

          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />

          <Button onClick={handleConfirmBooking} disabled={createBooking.isPending}
            className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base">
            {createBooking.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("bookingWidget.bookingInProgress")}</>
            ) : (
              t("bookingWidget.confirmReservation")
            )}
          </Button>
          <button onClick={() => setStep("dates")} className="text-xs text-primary hover:underline w-full text-center">
            ← {t("bookingWidget.editDates")}
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN: DATE SELECTION ───
  return (
    <div className="sticky top-24 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{pricePerNight.toLocaleString("fr-FR")} F</span>
          <span className="text-muted-foreground text-sm">{t("listing.perNight")}</span>
        </div>

        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-2">
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button className="text-left rounded-xl border border-border p-3 hover:border-primary/40 transition-colors">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.arrival")}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {checkIn ? format(checkIn, "d MMM yyyy", { locale: dateLocale }) : t("bookingWidget.select")}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={handleCheckInSelect}
                disabled={isDateDisabled}
                locale={dateLocale}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button className="text-left rounded-xl border border-border p-3 hover:border-primary/40 transition-colors">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.departure")}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {checkOut ? format(checkOut, "d MMM yyyy", { locale: dateLocale }) : t("bookingWidget.select")}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={handleCheckOutSelect}
                disabled={isCheckOutDisabled}
                locale={dateLocale}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="rounded-xl border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("search.travelers")}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {guests} {guests > 1 ? t("search.travelers_plural") : t("search.traveler")}
                </p>
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

        {/* Price summary */}
        {nights > 0 && (
          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between text-muted-foreground">
              <span>{pricePerNight.toLocaleString("fr-FR")} F × {nights} {nights > 1 ? t("booking.nights") : t("dashboard.night")}</span>
              <span>{subtotal.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t("booking.serviceFee")}</span>
              <span>{serviceFee.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
              <span>{t("booking.total")}</span>
              <span>{total.toLocaleString("fr-FR")} F</span>
            </div>
          </div>
        )}

        {/* Reserve button */}
        <Button onClick={handleReserve} disabled={!nights}
          className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 disabled:opacity-50">
          <Zap className="w-4 h-4 mr-2" />
          {nights > 0 ? `${t("listing.bookNow")}` : t("listing.selectDates")}
        </Button>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-center">{t("bookingWidget.loginToBook")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground text-center">{t("bookingWidget.loginToBookDesc")}</p>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-primary font-medium">✓ {t("bookingWidget.dataSaved")}</p>
            </div>
            <form onSubmit={handleDialogLogin} className="space-y-3">
              <Input
                type="email" placeholder={t("auth.email")}
                className="h-11 rounded-lg" value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showLoginPassword ? "text" : "password"} placeholder={t("auth.password")}
                  className="h-11 rounded-lg pr-10" value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" disabled={loginLoading}
                className="w-full rounded-xl h-11 bg-primary text-primary-foreground font-medium">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.loginBtn")}
              </Button>
            </form>
            <SocialLoginButtons variant="icon-only" />
            <p className="text-xs text-center text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline" onClick={() => setShowLoginDialog(false)}>
                {t("nav.signupCreate")}
              </Link>
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingWidget;
