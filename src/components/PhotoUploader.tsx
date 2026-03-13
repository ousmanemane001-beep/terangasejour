import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, Camera, ImageIcon, Loader2 } from "lucide-react";
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
  ensureCompatibleFormat,
} from "./photo-upload/imageProcessor";
import { toast } from "sonner";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 2;
const MIN_WIDTH = 900;
const MIN_HEIGHT = 600;

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

const PhotoUploader = ({ photos, onChange, onValidityChange }: PhotoUploaderProps) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    if (!onValidityChange) return;
    const allValid = photos.length >= MIN_PHOTOS && photos.every((p) => p.validated && !p.error);
    onValidityChange(allValid);
  }, [photos, onValidityChange]);

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

      for (let fi = 0; fi < filesToProcess.length; fi++) {
        let rawFile = filesToProcess[fi];
        setCurrentFileIndex(fi + 1);
        setCurrentFileName(rawFile.name);

        try {
          // Step 1: Format conversion (HEIC → JPG, WEBP → JPG, etc.)
          setCurrentStep("Conversion du format…");
          const { file: compatFile, converted, message } = await ensureCompatibleFormat(rawFile);
          rawFile = compatFile;
          if (converted && message) {
            toast.info(message, { duration: 2000 });
          }

          // Step 2: Resolution check
          setCurrentStep("Vérification de la résolution…");
          const dims = await getImageDimensions(rawFile);
          if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
            newErrors.push(
              `"${rawFile.name}" (${dims.width}×${dims.height}) est trop petite. Minimum ${MIN_WIDTH}×${MIN_HEIGHT} px.`
            );
            continue;
          }

          // Step 3: Duplicate check
          setCurrentStep("Vérification des doublons…");
          const hash = await generateImageHash(rawFile);
          const allHashes = [...existingHashes, ...newPhotoHashes];
          if (allHashes.some((h) => areHashesSimilar(hash, h))) {
            newErrors.push(`"${rawFile.name}" a déjà été ajoutée.`);
            continue;
          }

          // Step 4: Blur check
          setCurrentStep("Contrôle qualité…");
          const blurry = await isImageBlurry(rawFile);
          if (blurry) {
            newErrors.push(`"${rawFile.name}" est floue. Essayez une photo plus nette.`);
            continue;
          }

          // Step 5: Darkness check
          const tooDark = await isImageTooDark(rawFile);
          if (tooDark) {
            newErrors.push(`"${rawFile.name}" est trop sombre. Essayez une photo plus lumineuse.`);
            continue;
          }

          // Step 6: Compress, resize to max 1500px, crop to 3:2, convert to WebP
          setCurrentStep("Compression et optimisation…");
          const { blob, width, height } = await compressImage(rawFile);
          const optimizedFile = new File([blob], rawFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
          const preview = URL.createObjectURL(blob);

          const photoItem: PhotoItem = {
            id: crypto.randomUUID(),
            file: optimizedFile,
            preview,
            error: null,
            validated: true,
            hash,
            progress: 100,
          };

          newPhotoHashes.push(hash);
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
      setCurrentFileName("");
      setCurrentStep("");
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
    [photos, onChange]
  );

  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const validCount = photos.filter((p) => !p.error && p.validated).length;

  return (
    <div className="space-y-4" ref={dropZoneRef}>
      {/* Upload instructions */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-accent" />
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Pour attirer plus de voyageurs, ajoutez des photos lumineuses de votre logement.
          </p>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Formats acceptés : JPG, PNG, WEBP</p>
          <p>Dimension recommandée : 1500 × 1000 px</p>
          <p>Dimension minimale : 900 × 600 px</p>
          <p>Taille maximale : 2 MB</p>
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

      {/* Processing indicator */}
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
