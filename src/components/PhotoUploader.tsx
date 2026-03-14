import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import DropZone from "./photo-upload/DropZone";
import PhotoGrid from "./photo-upload/PhotoGrid";
import {
  processImage,
  getImageDimensions,
  isScreenshot,
  isScreenshotRatio,
  isTooSmall,
  isFileTooLarge,
  getFileFingerprint,
} from "./photo-upload/imageProcessor";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  error?: string | null;
  validated?: boolean;
  progress?: number;
  fingerprint?: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onValidityChange?: (allValid: boolean) => void;
}

const PhotoUploader = ({ photos, onChange, onValidityChange }: PhotoUploaderProps) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const validCount = photos.filter((p) => !p.error && p.validated).length;
  const hasErrors = photos.some((p) => !!p.error);
  const isValid = validCount >= MIN_PHOTOS && !hasErrors;

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_PHOTOS - photosRef.current.length;
      if (remaining <= 0) {
        setGlobalErrors(["Vous avez atteint le maximum de 10 photos."]);
        return;
      }

      const filesToProcess = fileArray.slice(0, remaining);
      setProcessing(true);
      setTotalFiles(filesToProcess.length);
      setCurrentFileIndex(0);

      const newErrors: string[] = [];

      for (let fi = 0; fi < filesToProcess.length; fi++) {
        const rawFile = filesToProcess[fi];
        setCurrentFileIndex(fi + 1);

        try {
          // Check format
          const ext = rawFile.name.toLowerCase().split(".").pop() || "";
          if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
            newErrors.push(`"${rawFile.name}" : Format non accepté. Utilisez JPG, PNG ou WEBP.`);
            continue;
          }

          // Check file size
          if (isFileTooLarge(rawFile)) {
            newErrors.push(`"${rawFile.name}" : Image trop lourde. Taille maximale : 2 MB.`);
            continue;
          }

          // Reject screenshots by name
          if (isScreenshot(rawFile.name)) {
            newErrors.push(`"${rawFile.name}" : les captures d'écran ne sont pas acceptées.`);
            continue;
          }

          // Check for duplicates
          const fingerprint = getFileFingerprint(rawFile);
          const isDuplicate = photosRef.current.some((p) => p.fingerprint === fingerprint);
          if (isDuplicate) {
            newErrors.push(`"${rawFile.name}" : cette image a déjà été ajoutée.`);
            continue;
          }

          // Check dimensions
          const dims = await getImageDimensions(rawFile);

          if (isTooSmall(dims.width, dims.height)) {
            newErrors.push(`"${rawFile.name}" : Image trop petite. Dimension minimale : 300 × 200 px.`);
            continue;
          }

          // Reject screenshot ratio
          if (isScreenshotRatio(dims.width, dims.height)) {
            newErrors.push(`"${rawFile.name}" : le format ressemble à une capture d'écran.`);
            continue;
          }

          // Process: crop 3:2, resize 1500×1000, compress WebP 75%
          const { blob } = await processImage(rawFile);
          const optimizedFile = new File([blob], rawFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          const preview = URL.createObjectURL(blob);

          const photoItem: PhotoItem = {
            id: crypto.randomUUID(),
            file: optimizedFile,
            preview,
            error: null,
            validated: true,
            progress: 100,
            fingerprint,
          };

          const updatedPhotos = [...photosRef.current, photoItem];
          onChange(updatedPhotos);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Impossible de traiter cette image.";
          newErrors.push(`"${rawFile.name}" : ${errorMsg}`);
        }
      }

      setGlobalErrors(newErrors);
      setProcessing(false);
      setTotalFiles(0);
      setCurrentFileIndex(0);
    },
    [onChange]
  );

  return (
    <div className="space-y-4" ref={dropZoneRef}>
      {/* Drop zone */}
      <DropZone
        onFiles={handleFiles}
        disabled={photos.length >= MAX_PHOTOS}
        processing={processing}
        photoCount={photos.length}
        maxPhotos={MAX_PHOTOS}
      />

      {/* Processing indicator */}
      {processing && totalFiles > 0 && (
        <div className="bg-muted/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Photo {currentFileIndex}/{totalFiles}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentFileIndex / totalFiles) * 100}%` }}
            />
          </div>
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

      {/* Counter */}
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
        {photos.length > 0 && validCount < MIN_PHOTOS && (
          <p className="text-[10px] sm:text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Min {MIN_PHOTOS} photos
          </p>
        )}
      </div>

      {/* Photo grid */}
      <PhotoGrid
        photos={photos}
        onChange={onChange}
        onAddMore={() => {
          const input = document.querySelector<HTMLInputElement>('input[type="file"][accept*="image"]');
          if (input && photos.length < MAX_PHOTOS) input.click();
        }}
        maxPhotos={MAX_PHOTOS}
        minPhotos={MIN_PHOTOS}
      />

      {/* Validation message */}
      {photos.length > 0 && !isValid && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
          <p className="text-xs sm:text-sm text-destructive font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {validCount < MIN_PHOTOS
              ? `Ajoutez au moins ${MIN_PHOTOS} photos pour publier votre logement.`
              : "Veuillez corriger les images avant de continuer."}
          </p>
        </div>
      )}

      {photos.length === 0 && (
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-2">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement.
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;
