import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateDispute } from "@/hooks/useDisputes";
import { useCreateNotification } from "@/hooks/useAdmin";
import { toast } from "sonner";

const PROBLEM_TYPES = [
  "Logement non conforme",
  "Propreté insuffisante",
  "Équipements manquants",
  "Problème de sécurité",
  "Hôte injoignable",
  "Autre",
];

interface Props {
  bookingId: string;
  reporterId: string;
  hostId: string;
}

export default function ReportProblemDialog({ bookingId, reporterId, hostId }: Props) {
  const [open, setOpen] = useState(false);
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const createDispute = useCreateDispute();
  const createNotification = useCreateNotification();

  const handleSubmit = async () => {
    if (!problemType) { toast.error("Sélectionnez un type de problème"); return; }
    if (!description.trim()) { toast.error("La description est obligatoire"); return; }

    try {
      await createDispute.mutateAsync({
        booking_id: bookingId,
        reporter_id: reporterId,
        host_id: hostId,
        problem_type: problemType,
        description: description.trim(),
        urgency,
      });

      // Notify admins
      await createNotification.mutateAsync({
        user_id: hostId,
        type: "dispute",
        title: "Signalement reçu",
        message: `Un voyageur a signalé un problème : ${problemType}`,
        data: { booking_id: bookingId },
      });

      toast.success("Signalement envoyé. Nous vous répondrons sous 24h.");
      setOpen(false);
      setProblemType("");
      setDescription("");
      setUrgency("normal");
    } catch {
      toast.error("Erreur lors de l'envoi du signalement.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Signaler un problème
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Type de problème</label>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setProblemType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    problemType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Niveau d'urgence</label>
            <div className="flex gap-3">
              {(["normal", "urgent"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    urgency === u
                      ? u === "urgent"
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  }`}
                >
                  {u === "urgent" ? "🔴 Urgent" : "🟢 Normal"}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createDispute.isPending}
            className="w-full rounded-xl h-11 bg-primary text-primary-foreground"
          >
            {createDispute.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le signalement"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Délai de réponse maximum : 24h. Aucun remboursement automatique.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
