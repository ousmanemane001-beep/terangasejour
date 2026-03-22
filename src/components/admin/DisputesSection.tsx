import { useState } from "react";
import { useAllDisputes, useUpdateDispute } from "@/hooks/useDisputes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X, MessageCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  in_progress: "bg-amber-500/10 text-amber-700",
  resolved: "bg-green-500/10 text-green-700",
  rejected: "bg-muted text-muted-foreground",
};

export default function DisputesSection() {
  const { data: disputes, isLoading } = useAllDisputes();
  const updateDispute = useUpdateDispute();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const handleAction = async (id: string, status: string) => {
    try {
      await updateDispute.mutateAsync({
        id,
        status,
        admin_notes: adminNotes || undefined,
        resolution: resolution || undefined,
      });
      toast.success(`Conflit ${status === "resolved" ? "résolu" : status === "rejected" ? "refusé" : "mis à jour"}`);
      setExpandedId(null);
      setAdminNotes("");
      setResolution("");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Conflits / Litiges</h1>
      <p className="text-sm text-muted-foreground mb-6">Gérez les signalements des voyageurs.</p>

      {(!disputes || disputes.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun conflit signalé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusColors[d.status] || "bg-muted text-muted-foreground"}>
                        {d.status === "open" ? "Ouvert" : d.status === "in_progress" ? "En cours" : d.status === "resolved" ? "Résolu" : "Refusé"}
                      </Badge>
                      {d.urgency === "urgent" && (
                        <Badge className="bg-destructive text-destructive-foreground text-[10px]">🔴 Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{d.problem_type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(d.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  >
                    {expandedId === d.id ? "Fermer" : "Détails"}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>

                {expandedId === d.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Réservation:</span>
                        <span className="ml-1 text-foreground font-mono">{d.booking_id.slice(0, 8)}…</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Urgence:</span>
                        <span className="ml-1 text-foreground">{d.urgency === "urgent" ? "Urgent" : "Normal"}</span>
                      </div>
                    </div>

                    {d.status === "open" || d.status === "in_progress" ? (
                      <>
                        <Textarea
                          placeholder="Notes admin..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={2}
                        />
                        <Textarea
                          placeholder="Résolution (remboursement, relogement, etc.)"
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="rounded-full bg-primary text-primary-foreground gap-1"
                            onClick={() => handleAction(d.id, "resolved")}
                            disabled={updateDispute.isPending}
                          >
                            <Check className="w-3 h-3" /> Valider / Résoudre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full gap-1 text-destructive"
                            onClick={() => handleAction(d.id, "rejected")}
                            disabled={updateDispute.isPending}
                          >
                            <X className="w-3 h-3" /> Refuser
                          </Button>
                          {d.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full gap-1"
                              onClick={() => handleAction(d.id, "in_progress")}
                              disabled={updateDispute.isPending}
                            >
                              <MessageCircle className="w-3 h-3" /> Médiation
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-muted rounded-xl p-3 text-sm">
                        {d.resolution && <p className="text-foreground"><strong>Résolution :</strong> {d.resolution}</p>}
                        {d.admin_notes && <p className="text-muted-foreground mt-1"><strong>Notes :</strong> {d.admin_notes}</p>}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
