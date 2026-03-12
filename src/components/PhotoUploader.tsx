import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, Camera, ImageIcon, Sparkles, Home, Sofa, BedDouble, Bath, UtensilsCrossed, TreePalm, Waves, Eye, Loader2, CheckCircle2, WifiOff } from "lucide-react";
import DropZone from "./photo-upload/DropZone";
import PhotoGrid from "./photo-upload/PhotoGrid";
import PhotoCropDialog from "./photo-upload/PhotoCropDialog";
import {
  compressImage,
  generateImageVariants,
  isImageBlurry,
  isImageTooDark,
  generateImageHash,
  areHashesSimilar,
  getImageDimensions,
  ensureCompatibleFormat,
} from "./photo-upload/imageProcessor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 2;
const MIN_WIDTH = 800;
const MIN_HEIGHT = 1; // No minimum height — ratio handled by auto-crop
const DRAFT_KEY = "photo_upload_draft";

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
  thumbnailBlob?: Blob;
  mediumBlob?: Blob;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onValidityChange?: (allValid: boolean) => void;
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
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
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("");
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    if (!onValidityChange) return;
    const allValid = photos.length >= MIN_PHOTOS && photos.every((p) => p.validated && !p.error);
    onValidityChange(allValid);
  }, [photos, onValidityChange]);

  // Auto-save draft metadata (not blobs) to localStorage
  useEffect(() => {
    if (photos.length > 0) {
      const draftMeta = photos.map((p) => ({
        id: p.id,
        roomCategory: p.roomCategory,
        validated: p.validated,
        qualityScore: p.qualityScore,
      }));
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftMeta));
      } catch { /* storage full or private browsing */ }
    }
  }, [photos]);

  /** Run AI analysis on a photo */
  const analyzeWithAI = useCallback(async (photoId: string, file: File) => {
    const currentPhotos = photosRef.current;
    onChange(currentPhotos.map((p) => (p.id === photoId ? { ...p, aiAnalyzing: true } : p)));

    try {
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
        onChange(photosRef.current.map((p) => (p.id === photoId ? { ...p, aiAnalyzing: false } : p)));
        return;
      }

      const analysis = data as {
        roomCategory?: RoomCategory;
        isAuthentic?: boolean;
        qualityScore?: number;
        issues?: string[];
        suggestion?: string | null;
      };

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
        warning = relevantIssues.length > 0
          ? relevantIssues.map((i) => issueMessages[i]).join(" ") + " Veuillez ajouter une photo authentique."
          : "Cette image semble ne pas représenter un logement réel.";
      }

      onChange(
        photosRef.current.map((p) =>
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
      onChange(photosRef.current.map((p) => (p.id === photoId ? { ...p, aiAnalyzing: false } : p)));
    }
  }, [onChange]);

  /** Process files one by one (sequential for mobile stability) */
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
      setTotalFiles(filesToProcess.length);
      setCurrentFileIndex(0);

      const newErrors: string[] = [];
      const existingHashes = photos.map((p) => p.hash).filter(Boolean) as string[];
      const newPhotoHashes: string[] = [];

      // Process one image at a time for mobile stability
      for (let fi = 0; fi < filesToProcess.length; fi++) {
        let rawFile = filesToProcess[fi];
        setCurrentFileIndex(fi + 1);
        setCurrentFileName(rawFile.name);

        try {
          // Step 1: Format conversion
          setCurrentStep("Conversion du format…");
          const { file: compatFile, converted, message } = await ensureCompatibleFormat(rawFile);
          rawFile = compatFile;
          if (converted && message) {
            toast.info(message, { duration: 2000 });
          }

          // Step 2: Size check — auto-compress if > 2MB instead of rejecting
          if (rawFile.size > MAX_SIZE_MB * 1024 * 1024) {
            // We'll let the compression step handle it rather than rejecting
            // The compressImage function will bring it under target size
          }

          // Step 3: Resolution check
          setCurrentStep("Vérification de la résolution…");
          const dims = await getImageDimensions(rawFile);
          if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
            newErrors.push(
              `"${rawFile.name}" (${dims.width}×${dims.height}) est trop petite. Minimum ${MIN_WIDTH}×${MIN_HEIGHT} px.`
            );
            continue;
          }

          // Step 4: Duplicate check
          setCurrentStep("Vérification des doublons…");
          const hash = await generateImageHash(rawFile);
          const allHashes = [...existingHashes, ...newPhotoHashes];
          if (allHashes.some((h) => areHashesSimilar(hash, h))) {
            newErrors.push(`"${rawFile.name}" a déjà été ajoutée.`);
            continue;
          }

          // Step 5: Quality checks
          setCurrentStep("Contrôle qualité…");
          const blurry = await isImageBlurry(rawFile);
          if (blurry) {
            newErrors.push(`"${rawFile.name}" est floue. Essayez une photo plus nette.`);
            continue;
          }

          const tooDark = await isImageTooDark(rawFile);
          if (tooDark) {
            newErrors.push(`"${rawFile.name}" est trop sombre. Essayez une photo plus lumineuse.`);
            continue;
          }

          // Step 6: Compression + multi-size generation
          setCurrentStep("Optimisation des images…");
          const variants = await generateImageVariants(rawFile);
          const optimizedFile = new File([variants.full], rawFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          const preview = URL.createObjectURL(variants.full);

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
            thumbnailBlob: variants.thumbnail,
            mediumBlob: variants.medium,
          };

          newPhotoHashes.push(hash);

          // Add photo immediately (one at a time for instant feedback)
          const updatedPhotos = [...photosRef.current, photoItem];
          onChange(updatedPhotos);

          // Non-blocking AI analysis
          analyzeWithAI(photoItem.id, photoItem.file);

        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Impossible de traiter cette image.";
          newErrors.push(`"${rawFile.name}" : ${errorMsg}`);
        }
      }

      setGlobalErrors(newErrors);
      setProcessing(false);
      setTotalFiles(0);
      setCurrentFileIndex(0);
      setCurrentFileName("");
      setCurrentStep("");
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
      onChange(photos.map((p) => (p.id === photoId ? { ...p, roomCategory: category } : p)));
    },
    [photos, onChange]
  );

  const autoSortPhotos = useCallback(() => {
    const sorted = [...photos].sort((a, b) => {
      const aIdx = RECOMMENDED_ORDER.indexOf(a.roomCategory || "autre");
      const bIdx = RECOMMENDED_ORDER.indexOf(b.roomCategory || "autre");
      return aIdx - bIdx;
    });
    onChange(sorted);
    toast.success("Photos triées automatiquement");
  }, [photos, onChange]);

  const validCount = photos.filter((p) => !p.error && p.validated).length;
  const analyzingCount = photos.filter((p) => p.aiAnalyzing).length;
  const presentCategories = new Set(photos.filter((p) => p.validated && !p.error).map((p) => p.roomCategory));
  const missingRooms = ESSENTIAL_ROOMS.filter((r) => !presentCategories.has(r));

  return (
    <div className="space-y-4" ref={dropZoneRef}>
      {/* Visual guide */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-accent" />
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Pour attirer plus de voyageurs, ajoutez des photos lumineuses de :
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {PHOTO_TIPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1 sm:px-3 sm:py-1.5"
            >
              <Icon className="w-3 h-3 text-accent" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI badge */}
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[10px] sm:text-xs text-foreground">
          <span className="font-semibold">IA activée</span> — Classement auto, détection des images suspectes et contrôle qualité
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

      {/* Sequential processing indicator */}
      {processing && totalFiles > 0 && (
        <div className="bg-muted/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Photo {currentFileIndex}/{totalFiles}
            </span>
            <span className="text-muted-foreground truncate max-w-[40%] text-right">{currentFileName}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentFileIndex / totalFiles) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{currentStep}</p>
        </div>
      )}

      {/* AI analyzing indicator */}
      {analyzingCount > 0 && !processing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          Analyse IA en cours pour {analyzingCount} photo{analyzingCount > 1 ? "s" : ""}…
        </div>
      )}

      {/* Errors */}
      {globalErrors.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1.5">
          {globalErrors.map((err, i) => (
            <p key={i} className="text-[10px] sm:text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Counter + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs sm:text-sm font-medium text-foreground">
            Photos :{" "}
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
              className="text-[10px] sm:text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Trier auto
            </button>
          )}
          {photos.length > 0 && validCount < MIN_PHOTOS && (
            <p className="text-[10px] sm:text-xs text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Min {MIN_PHOTOS} photos
            </p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="flex flex-wrap gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
        <span className="bg-muted px-2 py-0.5 rounded">JPG, PNG, HEIC</span>
        <span className="bg-muted px-2 py-0.5 rounded">Min 5 · Max 10 photos</span>
        <span className="bg-muted px-2 py-0.5 rounded">Optimisation auto</span>
      </div>

      {/* Missing rooms suggestion */}
      {photos.length >= 1 && missingRooms.length > 0 && analyzingCount === 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-foreground">
              Les voyageurs préfèrent voir ces espaces :
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {missingRooms.map((room) => {
                const { label, icon: Icon } = ROOM_LABELS[room];
                return (
                  <span key={room} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md">
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                );
              })}
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
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

      {photos.length < MIN_PHOTOS && (
        <p className="text-xs sm:text-sm text-destructive font-medium text-center py-2">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement.
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
