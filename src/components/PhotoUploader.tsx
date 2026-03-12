import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, Camera, ImageIcon, Sparkles, Home, Sofa, BedDouble, Bath, UtensilsCrossed, TreePalm, Waves, Eye, Loader2, CheckCircle2 } from "lucide-react";
import DropZone from "./photo-upload/DropZone";
import PhotoGrid from "./photo-upload/PhotoGrid";
import PhotoCropDialog from "./photo-upload/PhotoCropDialog";
import {
  compressImage,
  isImageBlurry,
  isImageTooDark,
  generateImageHash,
  areHashesSimilar,
  getImageDimensions,
} from "./photo-upload/imageProcessor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 10;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 800;
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png"];

export type RoomCategory = "exterieur" | "salon" | "chambre" | "salle_de_bain" | "cuisine" | "terrasse" | "piscine" | "vue" | "autre";

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  error?: string | null;
  validated?: boolean;
  hash?: string;
  progress?: number;
  roomCategory?: RoomCategory;
  aiAnalyzing?: boolean;
  aiWarning?: string | null;
  qualityScore?: number;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onValidityChange?: (allValid: boolean) => void;
}

function isAcceptedFormat(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return ACCEPTED_EXTENSIONS.includes(ext);
}

const ROOM_LABELS: Record<RoomCategory, { label: string; icon: React.ElementType }> = {
  exterieur: { label: "Extérieur", icon: Home },
  salon: { label: "Salon", icon: Sofa },
  chambre: { label: "Chambre", icon: BedDouble },
  salle_de_bain: { label: "Salle de bain", icon: Bath },
  cuisine: { label: "Cuisine", icon: UtensilsCrossed },
  terrasse: { label: "Terrasse", icon: TreePalm },
  piscine: { label: "Piscine", icon: Waves },
  vue: { label: "Vue", icon: Eye },
  autre: { label: "Autre", icon: Camera },
};

const RECOMMENDED_ORDER: RoomCategory[] = ["exterieur", "salon", "chambre", "salle_de_bain", "cuisine", "terrasse", "piscine", "vue", "autre"];

const ESSENTIAL_ROOMS: RoomCategory[] = ["exterieur", "salon", "chambre", "salle_de_bain", "cuisine"];

const PHOTO_TIPS = [
  { icon: Home, label: "Façade / Extérieur" },
  { icon: Sofa, label: "Salon" },
  { icon: BedDouble, label: "Chambre" },
  { icon: Bath, label: "Salle de bain" },
  { icon: UtensilsCrossed, label: "Cuisine / Terrasse" },
];

/** Convert File to base64 string (without data: prefix) */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PhotoUploader = ({ photos, onChange, onValidityChange }: PhotoUploaderProps) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [processingItems, setProcessingItems] = useState<{ name: string; progress: number }[]>([]);

  useEffect(() => {
    if (!onValidityChange) return;
    const allValid = photos.length >= MIN_PHOTOS && photos.every((p) => p.validated && !p.error);
    onValidityChange(allValid);
  }, [photos, onValidityChange]);

  const updateItemProgress = (index: number, progress: number) => {
    setProcessingItems((prev) => {
      const copy = [...prev];
      if (copy[index]) copy[index] = { ...copy[index], progress };
      return copy;
    });
  };

  /** Run AI analysis on a photo and update it in-place */
  const analyzeWithAI = useCallback(async (photoId: string, file: File) => {
    // Mark as analyzing
    onChange(
      photos.map((p) => (p.id === photoId ? { ...p, aiAnalyzing: true } : p))
    );

    try {
      // Compress to small JPEG for analysis (save bandwidth)
      const canvas = document.createElement("canvas");
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });

      const maxSize = 512;
      const ratio = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), "image/jpeg", 0.7);
      });

      const analysisFile = new File([blob], "analysis.jpg", { type: "image/jpeg" });
      const base64 = await fileToBase64(analysisFile);

      const { data, error } = await supabase.functions.invoke("analyze-photo", {
        body: { imageBase64: base64 },
      });

      if (error) {
        console.error("AI analysis error:", error);
        return;
      }

      const analysis = data as {
        roomCategory?: RoomCategory;
        isAuthentic?: boolean;
        qualityScore?: number;
        issues?: string[];
        suggestion?: string | null;
      };

      // Build warning message
      let warning: string | null = null;
      if (analysis.isAuthentic === false) {
        const issueMessages: Record<string, string> = {
          ai_generated: "Cette image semble générée par IA.",
          stock_image: "Cette image semble provenir d'une banque d'images.",
          too_retouched: "Cette image semble trop retouchée.",
          not_property: "Cette image ne semble pas représenter un logement.",
        };
        const issues = analysis.issues || [];
        const relevantIssues = issues.filter((i) => issueMessages[i]);
        if (relevantIssues.length > 0) {
          warning = relevantIssues.map((i) => issueMessages[i]).join(" ") +
            " Veuillez ajouter une photo authentique de votre logement.";
        } else {
          warning = "Cette image semble ne pas représenter un logement réel. Veuillez ajouter une photo authentique.";
        }
      }

      // Update the photo with AI results
      onChange((prev: PhotoItem[]) =>
        prev.map((p) =>
          p.id === photoId
            ? {
                ...p,
                aiAnalyzing: false,
                roomCategory: analysis.roomCategory || "autre",
                qualityScore: analysis.qualityScore,
                aiWarning: warning,
                error: warning ? warning : p.error,
                validated: warning ? false : p.validated,
              }
            : p
        )
      );
    } catch (err) {
      console.error("AI analysis failed:", err);
      // Don't block — just mark as done without AI data
      onChange((prev: PhotoItem[]) =>
        prev.map((p) => (p.id === photoId ? { ...p, aiAnalyzing: false } : p))
      );
    }
  }, [photos, onChange]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) {
        setGlobalErrors(["Vous avez atteint le maximum de 10 photos."]);
        return;
      }

      const filesToProcess = fileArray.slice(0, remaining);
      setProcessing(true);
      setProcessingItems(filesToProcess.map((f) => ({ name: f.name, progress: 0 })));

      const newErrors: string[] = [];
      const newPhotos: PhotoItem[] = [];
      const existingHashes = photos.map((p) => p.hash).filter(Boolean) as string[];

      for (let fi = 0; fi < filesToProcess.length; fi++) {
        const rawFile = filesToProcess[fi];
        try {
          updateItemProgress(fi, 5);

          if (!isAcceptedFormat(rawFile)) {
            newErrors.push(`"${rawFile.name}" : format non supporté. Utilisez JPG, JPEG ou PNG.`);
            updateItemProgress(fi, 100);
            continue;
          }

          if (rawFile.size > MAX_SIZE_MB * 1024 * 1024) {
            const sizeMB = (rawFile.size / (1024 * 1024)).toFixed(1);
            newErrors.push(`"${rawFile.name}" (${sizeMB} Mo) : fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 10);

          const dims = await getImageDimensions(rawFile);
          if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
            newErrors.push(
              `"${rawFile.name}" (${dims.width}×${dims.height}) : cette image est trop petite. Minimum ${MIN_WIDTH}×${MIN_HEIGHT} px.`
            );
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 20);

          const hash = await generateImageHash(rawFile);
          const allHashes = [...existingHashes, ...newPhotos.map((p) => p.hash).filter(Boolean) as string[]];
          const isDuplicate = allHashes.some((h) => areHashesSimilar(hash, h));
          if (isDuplicate) {
            newErrors.push(`"${rawFile.name}" : cette image a déjà été ajoutée.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 35);

          const blurry = await isImageBlurry(rawFile);
          if (blurry) {
            newErrors.push(`"${rawFile.name}" : cette photo est de mauvaise qualité. Essayez une photo plus nette et lumineuse.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 50);

          const tooDark = await isImageTooDark(rawFile);
          if (tooDark) {
            newErrors.push(`"${rawFile.name}" : cette photo est de mauvaise qualité. Essayez une photo plus nette et lumineuse.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 65);

          const { blob } = await compressImage(rawFile);
          const optimizedFile = new File([blob], rawFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          const preview = URL.createObjectURL(blob);

          updateItemProgress(fi, 90);

          const photoItem: PhotoItem = {
            id: crypto.randomUUID(),
            file: optimizedFile,
            preview,
            error: null,
            validated: true,
            hash,
            progress: 100,
            roomCategory: "autre",
            aiAnalyzing: true,
          };

          newPhotos.push(photoItem);
          updateItemProgress(fi, 100);
        } catch {
          newErrors.push(`"${rawFile.name}" : impossible de traiter cette image.`);
          updateItemProgress(fi, 100);
        }
      }

      setGlobalErrors(newErrors);
      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        onChange(updatedPhotos);

        // Trigger AI analysis for each new photo (non-blocking)
        for (const photo of newPhotos) {
          analyzeWithAI(photo.id, photo.file);
        }
      }
      setProcessing(false);
      setProcessingItems([]);
    },
    [photos, onChange, analyzeWithAI]
  );

  const handleCropComplete = useCallback(
    (croppedBlob: Blob) => {
      if (cropIndex === null) return;
      const photo = photos[cropIndex];
      if (photo.preview.startsWith("blob:")) URL.revokeObjectURL(photo.preview);

      const newPreview = URL.createObjectURL(croppedBlob);
      const newFile = new File([croppedBlob], photo.file.name, { type: "image/webp" });
      const updated = [...photos];
      updated[cropIndex] = { ...photo, file: newFile, preview: newPreview };
      onChange(updated);
      setCropIndex(null);
    },
    [cropIndex, photos, onChange]
  );

  const handleCategoryChange = useCallback(
    (photoId: string, category: RoomCategory) => {
      onChange(
        photos.map((p) => (p.id === photoId ? { ...p, roomCategory: category } : p))
      );
    },
    [photos, onChange]
  );

  /** Auto-sort photos by recommended room order */
  const autoSortPhotos = useCallback(() => {
    const sorted = [...photos].sort((a, b) => {
      const aIdx = RECOMMENDED_ORDER.indexOf(a.roomCategory || "autre");
      const bIdx = RECOMMENDED_ORDER.indexOf(b.roomCategory || "autre");
      return aIdx - bIdx;
    });
    onChange(sorted);
    toast.success("Photos triées automatiquement par catégorie");
  }, [photos, onChange]);

  const validCount = photos.filter((p) => !p.error && p.validated).length;
  const analyzingCount = photos.filter((p) => p.aiAnalyzing).length;

  // Find missing essential rooms
  const presentCategories = new Set(photos.filter((p) => p.validated && !p.error).map((p) => p.roomCategory));
  const missingRooms = ESSENTIAL_ROOMS.filter((r) => !presentCategories.has(r));

  return (
    <div className="space-y-5" ref={dropZoneRef}>
      {/* Visual guide for hosts */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-accent" />
          <p className="text-sm font-semibold text-foreground">
            Pour attirer plus de voyageurs, ajoutez des photos lumineuses de :
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PHOTO_TIPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5"
            >
              <Icon className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI badge */}
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-xs text-foreground">
          <span className="font-semibold">IA activée</span> — Classement automatique, détection des images suspectes et contrôle qualité
        </p>
      </div>

      {/* Drop zone */}
      <DropZone
        onFiles={handleFiles}
        disabled={photos.length >= MAX_PHOTOS}
        processing={processing}
        photoCount={photos.length}
        maxPhotos={MAX_PHOTOS}
      />

      {/* Per-image progress bars */}
      {processingItems.length > 0 && (
        <div className="space-y-2">
          {processingItems.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium truncate max-w-[70%]">{item.name}</span>
                <span className="text-muted-foreground">{item.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI analyzing indicator */}
      {analyzingCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          Analyse IA en cours pour {analyzingCount} photo{analyzingCount > 1 ? "s" : ""}…
        </div>
      )}

      {/* Global errors */}
      {globalErrors.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1.5">
          {globalErrors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Counter + Sort button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Photos ajoutées :{" "}
            <span className={validCount < MIN_PHOTOS ? "text-destructive" : "text-accent"}>
              {validCount}
            </span>{" "}
            / {MAX_PHOTOS}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {photos.length >= 2 && (
            <button
              type="button"
              onClick={autoSortPhotos}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Trier automatiquement
            </button>
          )}
          {photos.length > 0 && validCount < MIN_PHOTOS && (
            <p className="text-xs text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Ajoutez au moins {MIN_PHOTOS} photos
            </p>
          )}
        </div>
      </div>

      {/* Requirements summary */}
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="bg-muted px-2 py-0.5 rounded">JPG, JPEG, PNG</span>
        <span className="bg-muted px-2 py-0.5 rounded">Max 10 Mo</span>
        <span className="bg-muted px-2 py-0.5 rounded">Min 1200×800 px</span>
        <span className="bg-muted px-2 py-0.5 rounded">Recadrage 3:2 auto</span>
        <span className="bg-muted px-2 py-0.5 rounded">5 à 10 photos</span>
      </div>

      {/* Missing rooms suggestion */}
      {photos.length >= 1 && missingRooms.length > 0 && analyzingCount === 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">
              Les voyageurs préfèrent voir ces espaces :
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {missingRooms.map((room) => {
                const { label, icon: Icon } = ROOM_LABELS[room];
                return (
                  <span
                    key={room}
                    className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Ajoutez ces photos pour augmenter vos réservations.
            </p>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {(photos.length > 0 || photos.length < MIN_PHOTOS) && (
        <PhotoGrid
          photos={photos}
          onChange={onChange}
          onCropRequest={setCropIndex}
          onCategoryChange={handleCategoryChange}
          onAddMore={() => {
            const input = document.querySelector<HTMLInputElement>('input[type="file"][accept*="image"]');
            if (input && photos.length < MAX_PHOTOS) input.click();
          }}
          maxPhotos={MAX_PHOTOS}
          minPhotos={MIN_PHOTOS}
          roomLabels={ROOM_LABELS}
        />
      )}

      {photos.length === 0 && (
        <p className="text-sm text-destructive font-medium text-center">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement
        </p>
      )}

      {/* Crop dialog */}
      {cropIndex !== null && photos[cropIndex] && (
        <PhotoCropDialog
          open={cropIndex !== null}
          onClose={() => setCropIndex(null)}
          imageSrc={photos[cropIndex].preview}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default PhotoUploader;
