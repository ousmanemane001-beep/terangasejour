import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, X, Clock, Users, CalendarDays, MapPin, Flame,
  AlertTriangle, Loader2, Inbox, CheckCircle2, XCircle, CreditCard, MessageCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { format, differenceInHours, differenceInMinutes, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useBookingRequests, useRespondToRequest, type BookingRequest } from "@/hooks/useAdmin";
import { useOwnerListings, useOwnerBookings, type OwnerBooking } from "@/hooks/useOwnerData";
import CountdownTimer from "@/components/booking/CountdownTimer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const EXPIRY_HOURS = 24;

interface GuestProfile {
  first_name: string | null;
  last_name: string | null;
}

function useGuestProfiles(guestIds: string[]) {
  return useQuery({
    queryKey: ["guest-profiles", guestIds.sort().join(",")],
    queryFn: async () => {
      if (guestIds.length === 0) return {};
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", guestIds);
      const map: Record<string, GuestProfile> = {};
      data?.forEach((p) => { map[p.id] = p; });
      return map;
    },
    enabled: guestIds.length > 0,
  });
}

// For requests: expires 24h after creation. For bookings: use expires_at field (null = no expiry).
function getTimeLeft(item: { type?: string; created_at: string; expires_at?: string | null }) {
  let expiresAt: Date;
  if (item.type === "booking") {
    if (!item.expires_at) return { expired: false, text: "", hours: 99, minutes: 0, urgent: false, hasTimer: false };
    expiresAt = new Date(item.expires_at);
  } else {
    expiresAt = new Date(new Date(item.created_at).getTime() + EXPIRY_HOURS * 60 * 60 * 1000);
  }
  const now = new Date();
  if (isPast(expiresAt)) return { expired: true, text: "Expirée", hours: 0, minutes: 0, urgent: false, hasTimer: true };
  const hours = differenceInHours(expiresAt, now);
  const minutes = differenceInMinutes(expiresAt, now) % 60;
  const urgent = hours < 2;
  return { expired: false, text: `${hours}h ${minutes}min`, hours, minutes, urgent, hasTimer: true };
}

function getGuestName(id: string, profiles: Record<string, GuestProfile> | undefined) {
  const p = profiles?.[id];
  return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Voyageur" : "Voyageur";
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
}

// ─── Unified Item type ───
interface UnifiedBooking {
  id: string;
  type: "booking" | "request";
  listing_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  status: string; // pending | confirmed | cancelled | expired | approved | rejected
  created_at: string;
  expires_at?: string | null;
  message?: string | null;
  payment_status?: string;
  guest_name?: string | null;
}

function unifyData(bookings: OwnerBooking[], requests: BookingRequest[]): UnifiedBooking[] {
  const fromBookings: UnifiedBooking[] = bookings.map((b) => ({
    id: b.id,
    type: "booking",
    listing_id: b.listing_id,
    guest_id: b.guest_id,
    check_in: b.check_in,
    check_out: b.check_out,
    guests: b.guests,
    nights: b.nights,
    total_price: b.total_price,
    status: b.status,
    created_at: b.created_at,
    expires_at: (b as any).expires_at,
    payment_status: (b as any).payment_status,
    guest_name: (b as any).guest_name,
  }));

  const fromRequests: UnifiedBooking[] = requests.map((r) => {
    const nights = Math.ceil(
      (new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: r.id,
      type: "request",
      listing_id: r.listing_id,
      guest_id: r.guest_id,
      check_in: r.check_in,
      check_out: r.check_out,
      guests: r.guests,
      nights,
      total_price: 0,
      status: r.status === "approved" ? "confirmed" : r.status === "rejected" ? "cancelled" : r.status,
      created_at: r.created_at,
      message: r.message,
    };
  });

  return [...fromBookings, ...fromRequests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

const statusBadgeConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  confirmed: { label: "Confirmée", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  cancelled: { label: "Refusée", color: "bg-destructive/10 text-destructive border-destructive/20" },
  declined: { label: "Refusée", color: "bg-destructive/10 text-destructive border-destructive/20" },
  expired: { label: "Expirée", color: "bg-muted text-muted-foreground border-border" },
};

// ─── Unified Booking Card ───
function UnifiedBookingCard({
  item,
  listingTitle,
  guestName,
  profiles,
  onAccept,
  onDecline,
  loading,
}: {
  item: UnifiedBooking;
  listingTitle: string;
  guestName: string;
  profiles: Record<string, GuestProfile> | undefined;
  onAccept: () => void;
  onDecline: (reason: string) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Check if actually expired
  const isPending = item.status === "pending";
  const timeLeft = isPending ? getTimeLeft(item.created_at) : null;
  const isExpired = timeLeft?.expired;
  const effectiveStatus = isExpired ? "expired" : item.status;
  const badge = statusBadgeConfig[effectiveStatus] || statusBadgeConfig.pending;
  const canAct = isPending && !isExpired;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "rounded-xl border transition-all cursor-pointer group",
          canAct
            ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:shadow-md"
            : "border-border bg-card hover:bg-muted/30",
          expanded && "shadow-sm",
          timeLeft?.urgent && canAct && "ring-1 ring-destructive/30"
        )}
      >
        {/* Summary row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(guestName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{guestName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(item.check_in), "d MMM", { locale: fr })} → {format(new Date(item.check_out), "d MMM", { locale: fr })}
                {" · "}{item.nights} nuit{item.nights > 1 ? "s" : ""} · {item.guests} voyageur{item.guests > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" /> {listingTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <Badge variant="outline" className={cn("text-xs border", badge.color)}>
                {badge.label}
              </Badge>
              {item.total_price > 0 && (
                <p className="text-sm font-bold text-foreground mt-1">
                  {item.total_price.toLocaleString("fr-FR")} F
                </p>
              )}
            </div>
            {canAct && (
              <div className="flex items-center gap-2">
                {timeLeft?.urgent && (
                  <Badge variant="destructive" className="text-[10px] gap-1 animate-pulse shrink-0">
                    <Flame className="w-3 h-3" /> Urgent
                  </Badge>
                )}
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            )}
          </div>
        </button>

        {/* Timer bar for pending */}
        {canAct && timeLeft && (
          <div className="px-4 pb-2">
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit",
              timeLeft.urgent
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-500/10 text-amber-600"
            )}>
              <Clock className="w-3 h-3" />
              Expire dans {timeLeft.text}
            </div>
          </div>
        )}

        {/* Expanded details + actions */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                {/* Payment info for bookings */}
                {item.type === "booking" && (
                  <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> {item.payment_status === "paid" ? "Payé" : "Non payé"}
                    </span>
                    <span className="font-bold text-foreground text-sm">{item.total_price.toLocaleString("fr-FR")} F</span>
                  </div>
                )}

                {/* Message from guest */}
                {item.message && (
                  <p className="text-xs text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2 line-clamp-3">
                    "{item.message}"
                  </p>
                )}

                {/* Countdown for booking with expires_at */}
                {item.expires_at && isPending && (
                  <CountdownTimer expiresAt={item.expires_at} variant="banner" />
                )}

                {/* Actions */}
                {canAct && !showDeclineForm && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-full flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      disabled={loading}
                      onClick={(e) => { e.stopPropagation(); onAccept(); }}
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full flex-1 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={loading}
                      onClick={(e) => { e.stopPropagation(); setShowDeclineForm(true); }}
                    >
                      <X className="w-3.5 h-3.5" />
                      Refuser
                    </Button>
                  </div>
                )}

                {canAct && showDeclineForm && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <MessageCircle className="w-4 h-4" />
                      Motif du refus
                    </div>
                    <Textarea
                      placeholder="Expliquez la raison du refus (ex: dates indisponibles, travaux en cours...)"
                      className="rounded-xl text-sm"
                      rows={3}
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full flex-1 text-xs"
                        onClick={(e) => { e.stopPropagation(); setShowDeclineForm(false); setDeclineReason(""); }}
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full flex-1 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
                        disabled={loading || !declineReason.trim()}
                        onClick={(e) => { e.stopPropagation(); onDecline(declineReason); }}
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        Confirmer le refus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Swipeable wrapper for mobile ───
function SwipeableBookingCard({
  item, listingTitle, guestName, profiles, onAccept, onDecline, loading,
}: {
  item: UnifiedBooking;
  listingTitle: string;
  guestName: string;
  profiles: Record<string, GuestProfile> | undefined;
  onAccept: () => void;
  onDecline: (reason: string) => void;
  loading: boolean;
}) {
  const x = useMotionValue(0);
  const bgColor = useTransform(x, [-150, -50, 0, 50, 150], [
    "hsl(0 84% 60% / 0.15)", "hsl(0 84% 60% / 0.05)", "transparent",
    "hsl(142 71% 45% / 0.05)", "hsl(142 71% 45% / 0.15)",
  ]);
  const leftIcon = useTransform(x, [-150, -30, 0], [1, 0, 0]);
  const rightIcon = useTransform(x, [0, 30, 150], [0, 0, 1]);

  const canSwipe = item.status === "pending" && !getTimeLeft(item.created_at).expired;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!canSwipe) return;
    if (info.offset.x > 100) onAccept();
    else if (info.offset.x < -100) onDecline("Refusé par l'hôte");
  };

  if (!canSwipe) {
    return (
      <UnifiedBookingCard
        item={item}
        listingTitle={listingTitle}
        guestName={guestName}
        profiles={profiles}
        onAccept={onAccept}
        onDecline={onDecline}
        loading={loading}
      />
    );
  }

  return (
    <motion.div className="relative overflow-hidden rounded-xl" style={{ backgroundColor: bgColor }}>
      <motion.div className="absolute left-3 top-1/2 -translate-y-1/2 z-0" style={{ opacity: rightIcon }}>
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
      </motion.div>
      <motion.div className="absolute right-3 top-1/2 -translate-y-1/2 z-0" style={{ opacity: leftIcon }}>
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <X className="w-5 h-5 text-destructive" />
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <UnifiedBookingCard
          item={item}
          listingTitle={listingTitle}
          guestName={guestName}
          profiles={profiles}
          onAccept={onAccept}
          onDecline={onDecline}
          loading={loading}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───
export default function HostBookingManager() {
  const { data: requests, isLoading: requestsLoading } = useBookingRequests();
  const { data: listings } = useOwnerListings();
  const { data: ownerBookings, isLoading: bookingsLoading } = useOwnerBookings();
  const respondToRequest = useRespondToRequest();
  const isMobile = useIsMobile();
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<"pending" | "confirmed" | "declined">("pending");

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("host-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_requests" }, () => {
        qc.invalidateQueries({ queryKey: ["booking-requests"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  // Build listings map
  const listingsMap: Record<string, string> = {};
  listings?.forEach((l) => { listingsMap[l.id] = l.title; });

  // Unify data
  const allItems = unifyData(ownerBookings || [], requests || []);

  // Gather guest IDs
  const guestIds = [...new Set(allItems.map((i) => i.guest_id))];
  const { data: guestProfiles } = useGuestProfiles(guestIds);

  // Filter by status
  const pendingItems = allItems.filter((i) => {
    if (i.status !== "pending") return false;
    const tl = getTimeLeft(i.created_at);
    return !tl.expired;
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const confirmedItems = allItems.filter((i) => i.status === "confirmed");

  const declinedItems = allItems.filter((i) => {
    if (i.status === "cancelled" || i.status === "expired" || i.status === "declined") return true;
    if (i.status === "pending") return getTimeLeft(i.created_at).expired;
    return false;
  });

  const handleAction = async (item: UnifiedBooking, action: "accept" | "decline", reason?: string) => {
    if (item.type === "request") {
      respondToRequest.mutate(
        { requestId: item.id, status: action === "accept" ? "approved" : "rejected", response: reason },
        { onSuccess: () => toast.success(action === "accept" ? "Demande acceptée !" : "Demande refusée.") }
      );
    } else {
      const newStatus = action === "accept" ? "confirmed" : "cancelled";
      const { error } = await supabase.from("bookings").update({
        status: newStatus, updated_at: new Date().toISOString(),
      } as any).eq("id", item.id);
      if (error) { toast.error(error.message); return; }
      toast.success(action === "accept" ? "Réservation confirmée !" : "Réservation refusée.");
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
    }
  };

  const isLoading = requestsLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const filters = [
    { key: "pending" as const, label: "En attente", count: pendingItems.length, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { key: "confirmed" as const, label: "Confirmées", count: confirmedItems.length, icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
    { key: "declined" as const, label: "Refusées / Expirées", count: declinedItems.length, icon: XCircle, color: "bg-destructive/10 text-destructive" },
  ];

  const currentItems = activeFilter === "pending" ? pendingItems : activeFilter === "confirmed" ? confirmedItems : declinedItems;

  const emptyConfig = {
    pending: { icon: Inbox, text: "Aucune réservation en attente" },
    confirmed: { icon: CheckCircle2, text: "Aucune réservation confirmée" },
    declined: { icon: XCircle, text: "Aucune réservation refusée" },
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeFilter === f.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <f.icon className="w-4 h-4 shrink-0 hidden sm:block" />
            {f.label}
            {f.count > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] h-5 px-1.5",
                  f.key === "pending" && f.count > 0 && "bg-amber-500/20 text-amber-700"
                )}
              >
                {f.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Swipe hint on mobile for pending */}
      {isMobile && activeFilter === "pending" && pendingItems.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          ← Glissez pour refuser · Glissez pour accepter →
        </p>
      )}

      {/* Items list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {currentItems.length > 0 ? (
            currentItems.map((item) =>
              isMobile && activeFilter === "pending" ? (
                <SwipeableBookingCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  listingTitle={listingsMap[item.listing_id] || "Logement"}
                  guestName={getGuestName(item.guest_id, guestProfiles)}
                  profiles={guestProfiles}
                  onAccept={() => handleAction(item, "accept")}
                  onDecline={(reason) => handleAction(item, "decline", reason)}
                  loading={respondToRequest.isPending}
                />
              ) : (
                <UnifiedBookingCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  listingTitle={listingsMap[item.listing_id] || "Logement"}
                  guestName={getGuestName(item.guest_id, guestProfiles)}
                  profiles={guestProfiles}
                  onAccept={() => handleAction(item, "accept")}
                  onDecline={(reason) => handleAction(item, "decline", reason)}
                  loading={respondToRequest.isPending}
                />
              )
            )
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              {(() => { const E = emptyConfig[activeFilter]; return <><E.icon className="w-12 h-12 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">{E.text}</p></>; })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
