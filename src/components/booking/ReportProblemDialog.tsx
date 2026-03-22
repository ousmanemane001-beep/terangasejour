import { useState, useRef } from "react";
import { AlertTriangle, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateDispute } from "@/hooks/useDisputes";
import { useCreateNotification } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createDispute = useCreateDispute();
  const createNotification = useCreateNotification();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const total = files.length + selected.length;
    if (total > 5) {
      toast.error("Maximum 5 fichiers");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadEvidence = async (disputeId: string) => {
    if (!files.length || !user) return;
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `disputes/${disputeId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: true });
      if (uploadError) continue;

      const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
      await supabase.from("dispute_evidence").insert({
        dispute_id: disputeId,
        uploaded_by: user.id,
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith("video") ? "video" : "image",
      });
    }
  };

  const handleSubmit = async () => {
    if (!problemType) { toast.error("Sélectionnez un type de problème"); return; }
    if (!description.trim()) { toast.error("La description est obligatoire"); return; }

    try {
      setUploading(true);
      const dispute = await createDispute.mutateAsync({
        booking_id: bookingId,
        reporter_id: reporterId,
        host_id: hostId,
        problem_type: problemType,
        description: description.trim(),
        urgency,
      });

      // Upload evidence files
      if (files.length > 0) {
        await uploadEvidence(dispute.id);
      }

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
      setFiles([]);
    } catch {
      toast.error("Erreur lors de l'envoi du signalement.");
    } finally {
      setUploading(false);
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

          {/* Evidence upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Preuves (photos / vidéos)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 transition-colors"
            >
              <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Ajouter des fichiers (max 5)</p>
            </button>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {f.type.startsWith("image") ? (
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={createDispute.isPending || uploading}
            className="w-full rounded-xl h-11 bg-primary text-primary-foreground"
          >
            {(createDispute.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le signalement"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Délai de réponse maximum : 24h. Aucun remboursement automatique.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
