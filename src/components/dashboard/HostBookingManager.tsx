import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Check, X, Clock, Users, CalendarDays, MapPin, Flame,
  AlertTriangle, Loader2, Inbox, CheckCircle2, XCircle, CreditCard,
} from "lucide-react";
import { format, differenceInHours, differenceInMinutes, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useBookingRequests, useRespondToRequest, type BookingRequest } from "@/hooks/useAdmin";
import { useOwnerListings, useOwnerBookings } from "@/hooks/useOwnerData";
import CountdownTimer from "@/components/booking/CountdownTimer";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
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

function getTimeLeft(createdAt: string) {
  const expiresAt = new Date(new Date(createdAt).getTime() + EXPIRY_HOURS * 60 * 60 * 1000);
  const now = new Date();
  if (isPast(expiresAt)) return { expired: true, text: "Expirée", hours: 0, minutes: 0 };
  const hours = differenceInHours(expiresAt, now);
  const minutes = differenceInMinutes(expiresAt, now) % 60;
  const urgent = hours < 3;
  return { expired: false, text: `${hours}h ${minutes}min`, hours, minutes, urgent };
}

function getGuestName(id: string, profiles: Record<string, GuestProfile> | undefined) {
  const p = profiles?.[id];
  return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Voyageur" : "Voyageur";
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
}

// ─── Swipeable Card (Mobile) ───
function SwipeableRequestCard({
  request, listingTitle, guestName, onAccept, onDecline, isPending,
}: {
  request: BookingRequest;
  listingTitle: string;
  guestName: string;
  onAccept: () => void;
  onDecline: () => void;
  isPending: boolean;
}) {
  const x = useMotionValue(0);
  const bgColor = useTransform(x, [-150, -50, 0, 50, 150], [
    "hsl(0 84% 60% / 0.15)", "hsl(0 84% 60% / 0.05)", "transparent",
    "hsl(142 71% 45% / 0.05)", "hsl(142 71% 45% / 0.15)",
  ]);
  const leftIcon = useTransform(x, [-150, -30, 0], [1, 0, 0]);
  const rightIcon = useTransform(x, [0, 30, 150], [0, 0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) onAccept();
    else if (info.offset.x < -100) onDecline();
  };

  const timeLeft = getTimeLeft(request.created_at);

  return (
    <motion.div className="relative overflow-hidden rounded-xl" style={{ backgroundColor: bgColor }}>
      {/* Swipe indicators */}
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
        className="relative z-10 bg-card rounded-xl border border-border p-4 cursor-grab active:cursor-grabbing"
      >
        <RequestCardContent
          request={request}
          listingTitle={listingTitle}
          guestName={guestName}
          timeLeft={timeLeft}
          onAccept={onAccept}
          onDecline={onDecline}
          isPending={isPending}
          compact
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Card Content (shared) ───
function RequestCardContent({
  request, listingTitle, guestName, timeLeft, onAccept, onDecline, isPending, compact = false,
}: {
  request: BookingRequest;
  listingTitle: string;
  guestName: string;
  timeLeft: ReturnType<typeof getTimeLeft>;
  onAccept: () => void;
  onDecline: () => void;
  isPending: boolean;
  compact?: boolean;
}) {
  const nights = Math.ceil(
    (new Date(request.check_out).getTime() - new Date(request.check_in).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(guestName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{guestName}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" /> {listingTitle}
            </p>
          </div>
        </div>
        {!timeLeft.expired && timeLeft.urgent && (
          <Badge variant="destructive" className="shrink-0 text-[10px] gap-1 animate-pulse">
            <Flame className="w-3 h-3" /> Urgent
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5 text-primary/60" />
          <span>
            {format(new Date(request.check_in), "d MMM", { locale: fr })} → {format(new Date(request.check_out), "d MMM", { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-primary/60" />
          <span>{request.guests} voyageur{request.guests > 1 ? "s" : ""} · {nights} nuit{nights > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <p className="text-xs text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2 line-clamp-2">
          "{request.message}"
        </p>
      )}

      {/* Timer + Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
          timeLeft.expired
            ? "bg-muted text-muted-foreground"
            : timeLeft.urgent
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-500/10 text-amber-600"
        )}>
          <Clock className="w-3 h-3" />
          {timeLeft.expired ? "Expirée" : `Expire dans ${timeLeft.text}`}
        </div>

        {request.status === "pending" && !timeLeft.expired && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="rounded-full h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
              disabled={isPending}
              onClick={onAccept}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 px-3 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
              disabled={isPending}
              onClick={onDecline}
            >
              <X className="w-3 h-3" /> Refuser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Column ───
function RequestColumn({
  title, icon: Icon, requests, listings, profiles, onAccept, onDecline, respondPending, emptyText, emptyIcon: EmptyIcon, color,
}: {
  title: string;
  icon: React.ElementType;
  requests: BookingRequest[];
  listings: Record<string, string>;
  profiles: Record<string, GuestProfile> | undefined;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  respondPending: boolean;
  emptyText: string;
  emptyIcon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex flex-col min-h-0">
      <div className={cn("flex items-center gap-2 px-1 mb-3")}>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">{requests.length}</Badge>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        <AnimatePresence mode="popLayout">
          {requests.length > 0 ? requests.map((req) => {
            const timeLeft = getTimeLeft(req.created_at);
            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <RequestCardContent
                      request={req}
                      listingTitle={listings[req.listing_id] || "Logement"}
                      guestName={getGuestName(req.guest_id, profiles)}
                      timeLeft={timeLeft}
                      onAccept={() => onAccept(req.id)}
                      onDecline={() => onDecline(req.id)}
                      isPending={respondPending}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          }) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <EmptyIcon className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">{emptyText}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function HostBookingManager() {
  const { data: requests, isLoading } = useBookingRequests();
  const { data: listings } = useOwnerListings();
  const respondToRequest = useRespondToRequest();
  const isMobile = useIsMobile();
  const [activeColumn, setActiveColumn] = useState<"pending" | "confirmed" | "declined">("pending");

  // Build listings map
  const listingsMap: Record<string, string> = {};
  listings?.forEach((l) => { listingsMap[l.id] = l.title; });

  // Gather guest IDs
  const guestIds = [...new Set(requests?.map((r) => r.guest_id) || [])];
  const { data: guestProfiles } = useGuestProfiles(guestIds);

  // Categorize requests
  const pending = requests?.filter((r) => {
    if (r.status !== "pending") return false;
    const tl = getTimeLeft(r.created_at);
    return !tl.expired;
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || [];

  const confirmed = requests?.filter((r) => r.status === "approved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  const declined = requests?.filter((r) => {
    if (r.status === "rejected") return true;
    if (r.status === "pending") {
      const tl = getTimeLeft(r.created_at);
      return tl.expired;
    }
    return false;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  const handleAccept = (id: string) => {
    respondToRequest.mutate(
      { requestId: id, status: "approved" },
      { onSuccess: () => toast.success("Demande acceptée !") }
    );
  };

  const handleDecline = (id: string) => {
    respondToRequest.mutate(
      { requestId: id, status: "rejected" },
      { onSuccess: () => toast.success("Demande refusée.") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Mobile: Tabs + Swipeable Cards ───
  if (isMobile) {
    const columns = [
      { key: "pending" as const, label: "En attente", count: pending.length, data: pending },
      { key: "confirmed" as const, label: "Confirmées", count: confirmed.length, data: confirmed },
      { key: "declined" as const, label: "Refusées", count: declined.length, data: declined },
    ];

    const activeData = columns.find((c) => c.key === activeColumn)?.data || [];

    return (
      <div className="space-y-4">
        {/* Mobile column switcher */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => setActiveColumn(col.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all",
                activeColumn === col.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {col.label}
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{col.count}</Badge>
            </button>
          ))}
        </div>

        {/* Swipe hint */}
        {activeColumn === "pending" && pending.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            ← Glissez pour refuser · Glissez pour accepter →
          </p>
        )}

        {/* Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeData.length > 0 ? activeData.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                {activeColumn === "pending" ? (
                  <SwipeableRequestCard
                    request={req}
                    listingTitle={listingsMap[req.listing_id] || "Logement"}
                    guestName={getGuestName(req.guest_id, guestProfiles)}
                    onAccept={() => handleAccept(req.id)}
                    onDecline={() => handleDecline(req.id)}
                    isPending={respondToRequest.isPending}
                  />
                ) : (
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <RequestCardContent
                        request={req}
                        listingTitle={listingsMap[req.listing_id] || "Logement"}
                        guestName={getGuestName(req.guest_id, guestProfiles)}
                        timeLeft={getTimeLeft(req.created_at)}
                        onAccept={() => handleAccept(req.id)}
                        onDecline={() => handleDecline(req.id)}
                        isPending={respondToRequest.isPending}
                      />
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Inbox className="w-12 h-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Aucune demande ici</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Desktop: 3-column layout ───
  return (
    <div className="grid grid-cols-3 gap-6 min-h-[500px]">
      <RequestColumn
        title="En attente"
        icon={Clock}
        requests={pending}
        listings={listingsMap}
        profiles={guestProfiles}
        onAccept={handleAccept}
        onDecline={handleDecline}
        respondPending={respondToRequest.isPending}
        emptyText="Aucune demande en attente"
        emptyIcon={Inbox}
        color="bg-amber-500/10 text-amber-600"
      />
      <RequestColumn
        title="Confirmées"
        icon={CheckCircle2}
        requests={confirmed}
        listings={listingsMap}
        profiles={guestProfiles}
        onAccept={handleAccept}
        onDecline={handleDecline}
        respondPending={respondToRequest.isPending}
        emptyText="Aucune réservation confirmée"
        emptyIcon={CheckCircle2}
        color="bg-green-500/10 text-green-600"
      />
      <RequestColumn
        title="Refusées / Expirées"
        icon={XCircle}
        requests={declined}
        listings={listingsMap}
        profiles={guestProfiles}
        onAccept={handleAccept}
        onDecline={handleDecline}
        respondPending={respondToRequest.isPending}
        emptyText="Aucune demande refusée"
        emptyIcon={XCircle}
        color="bg-destructive/10 text-destructive"
      />
    </div>
  );
}
