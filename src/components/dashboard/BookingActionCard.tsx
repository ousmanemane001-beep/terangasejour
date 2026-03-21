import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, ChevronDown, ChevronUp, Loader2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { OwnerBooking } from "@/hooks/useOwnerData";

const statusMap: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmée", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  pending: { label: "En attente", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  cancelled: { label: "Annulée", color: "bg-destructive/10 text-destructive border-destructive/20" },
  declined: { label: "Refusée", color: "bg-destructive/10 text-destructive border-destructive/20" },
  expired: { label: "Expirée", color: "bg-muted text-muted-foreground border-border" },
};

interface Props {
  booking: OwnerBooking;
  onStatusChange: () => void;
}

export default function BookingActionCard({ booking, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isPending = booking.status === "pending";
  const status = statusMap[booking.status] || statusMap.pending;

  const handleApprove = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed", updated_at: new Date().toISOString() } as any)
      .eq("id", booking.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation confirmée !");
    onStatusChange();
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Veuillez indiquer un motif de refus.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", booking.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation refusée.");
    setShowDeclineForm(false);
    onStatusChange();
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isPending ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50" : "border-border bg-muted/30",
        expanded && "shadow-sm"
      )}
    >
      {/* Summary row - clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <div>
          <p className="font-medium text-foreground text-sm">
            {format(new Date(booking.check_in), "d MMMM", { locale: fr })} → {format(new Date(booking.check_out), "d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.nights} nuit{booking.nights > 1 ? "s" : ""} · {booking.guests} voyageur{booking.guests > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge variant="outline" className={cn("text-xs border", status.color)}>
              {status.label}
            </Badge>
            <p className="text-sm font-bold text-foreground mt-1">
              {booking.total_price.toLocaleString("fr-FR")} F
            </p>
          </div>
          {isPending && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded actions (only for pending) */}
      <AnimatePresence>
        {expanded && isPending && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {!showDeclineForm ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                    onClick={handleApprove}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Approuver la réservation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full flex-1 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={loading}
                    onClick={() => setShowDeclineForm(true)}
                  >
                    <X className="w-3.5 h-3.5" />
                    Refuser
                  </Button>
                </div>
              ) : (
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
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full flex-1 text-xs"
                      onClick={() => { setShowDeclineForm(false); setDeclineReason(""); }}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full flex-1 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
                      disabled={loading || !declineReason.trim()}
                      onClick={handleDecline}
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
  );
}
