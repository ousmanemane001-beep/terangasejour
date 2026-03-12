import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, Camera, ImageIcon, Home, Sofa, BedDouble, Bath, UtensilsCrossed } from "lucide-react";
import DropZone from "./photo-upload/DropZone";
import PhotoGrid from "./photo-upload/PhotoGrid";
import PhotoCropDialog from "./photo-upload/PhotoCropDialog";
import {
  compressImage,
  isImageBlurry,
  isImageTooDark,
  hasTextOrLogo,
  generateImageHash,
  areHashesSimilar,
  getImageDimensions,
} from "./photo-upload/imageProcessor";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 10;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 800;
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png"];

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  error?: string | null;
  validated?: boolean;
  hash?: string;
  progress?: number;
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

const PHOTO_TIPS = [
  { icon: Home, label: "Façade / Extérieur" },
  { icon: Sofa, label: "Salon" },
  { icon: BedDouble, label: "Chambre" },
  { icon: Bath, label: "Salle de bain" },
  { icon: UtensilsCrossed, label: "Cuisine / Terrasse" },
];

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

          // Format check
          if (!isAcceptedFormat(rawFile)) {
            newErrors.push(`"${rawFile.name}" : format non supporté. Utilisez JPG, JPEG ou PNG.`);
            updateItemProgress(fi, 100);
            continue;
          }

          // Size check
          if (rawFile.size > MAX_SIZE_MB * 1024 * 1024) {
            const sizeMB = (rawFile.size / (1024 * 1024)).toFixed(1);
            newErrors.push(`"${rawFile.name}" (${sizeMB} Mo) : fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 10);

          // Check dimensions
          const dims = await getImageDimensions(rawFile);
          if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
            newErrors.push(
              `"${rawFile.name}" (${dims.width}×${dims.height}) : cette image est trop petite. Veuillez ajouter une photo de meilleure qualité (min ${MIN_WIDTH}×${MIN_HEIGHT} px).`
            );
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 20);

          // Duplicate detection
          const hash = await generateImageHash(rawFile);
          const allHashes = [...existingHashes, ...newPhotos.map((p) => p.hash).filter(Boolean) as string[]];
          const isDuplicate = allHashes.some((h) => areHashesSimilar(hash, h));
          if (isDuplicate) {
            newErrors.push(`"${rawFile.name}" : cette image a déjà été ajoutée.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 35);

          // Blur detection
          const blurry = await isImageBlurry(rawFile);
          if (blurry) {
            newErrors.push(`"${rawFile.name}" : image trop floue. Veuillez utiliser une photo plus nette.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 50);

          // Darkness detection
          const tooDark = await isImageTooDark(rawFile);
          if (tooDark) {
            newErrors.push(`"${rawFile.name}" : image trop sombre. Utilisez une photo plus lumineuse.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 60);

          // Text / logo detection
          const textDetected = await hasTextOrLogo(rawFile);
          if (textDetected) {
            newErrors.push(`"${rawFile.name}" : cette image semble contenir du texte ou un logo. Veuillez utiliser une photo sans texte promotionnel.`);
            updateItemProgress(fi, 100);
            continue;
          }

          updateItemProgress(fi, 70);

          // Compress, auto-crop 3:2, optimize to WebP
          const { blob } = await compressImage(rawFile);
          const optimizedFile = new File([blob], rawFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          const preview = URL.createObjectURL(blob);

          updateItemProgress(fi, 95);

          newPhotos.push({
            id: crypto.randomUUID(),
            file: optimizedFile,
            preview,
            error: null,
            validated: true,
            hash,
            progress: 100,
          });

          updateItemProgress(fi, 100);
        } catch {
          newErrors.push(`"${rawFile.name}" : impossible de traiter cette image.`);
          updateItemProgress(fi, 100);
        }
      }

      setGlobalErrors(newErrors);
      if (newPhotos.length > 0) {
        onChange([...photos, ...newPhotos]);
      }
      setProcessing(false);
      setProcessingItems([]);
    },
    [photos, onChange]
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

  const validCount = photos.filter((p) => !p.error && p.validated).length;

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

      {/* Counter */}
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
        {photos.length > 0 && validCount < MIN_PHOTOS && (
          <p className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ajoutez au moins {MIN_PHOTOS} photos
          </p>
        )}
      </div>

      {/* Requirements summary */}
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="bg-muted px-2 py-0.5 rounded">JPG, JPEG, PNG</span>
        <span className="bg-muted px-2 py-0.5 rounded">Max 10 Mo</span>
        <span className="bg-muted px-2 py-0.5 rounded">Min 1200×800 px</span>
        <span className="bg-muted px-2 py-0.5 rounded">Recadrage 3:2 auto</span>
        <span className="bg-muted px-2 py-0.5 rounded">5 à 10 photos</span>
      </div>

      {/* Photo grid */}
      {(photos.length > 0 || photos.length < MIN_PHOTOS) && (
        <PhotoGrid
          photos={photos}
          onChange={onChange}
          onCropRequest={setCropIndex}
          onAddMore={() => {
            const input = document.querySelector<HTMLInputElement>('input[type="file"][accept*="image"]');
            if (input && photos.length < MAX_PHOTOS) input.click();
          }}
          maxPhotos={MAX_PHOTOS}
          minPhotos={MIN_PHOTOS}
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
