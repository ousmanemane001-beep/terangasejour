import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pending" | "confirmed" | "declined" | "expired" | "cancelled";

const statusConfig: Record<Status, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "En attente", icon: Clock, className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  confirmed: { label: "Confirmée", icon: CheckCircle2, className: "bg-green-500/10 text-green-700 border-green-500/20" },
  declined: { label: "Refusée", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  expired: { label: "Expirée", icon: AlertTriangle, className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Annulée", icon: XCircle, className: "bg-muted text-muted-foreground border-border" },
};

export default function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs border", config.className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
