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
  normalizeImageFile,
  isAcceptedImageFormat,
} from "./photo-upload/imageProcessor";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 1;
const ACCEPTED_INPUT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

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
  onProcessingChange?: (processing: boolean) => void;
}

const PhotoUploader = ({ photos, onChange, onValidityChange, onProcessingChange }: PhotoUploaderProps) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIndexRef = useRef<number | null>(null);

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

  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  const processFiles = useCallback(
    async (files: FileList | File[], replaceIndex?: number) => {
      const incomingFiles = Array.from(files);
      let updatedPhotos = [...photosRef.current];
      const newErrors: string[] = [];

      if (typeof replaceIndex === "number" && replaceIndex >= 0 && replaceIndex < updatedPhotos.length) {
        const replaced = updatedPhotos[replaceIndex];
        if (replaced.preview.startsWith("blob:")) URL.revokeObjectURL(replaced.preview);
        updatedPhotos.splice(replaceIndex, 1);
      }

      const remaining = MAX_PHOTOS - updatedPhotos.length;
      if (remaining <= 0) {
        setGlobalErrors(["Vous avez atteint le maximum de 10 photos."]);
        return;
      }

      if (incomingFiles.length > remaining) {
        newErrors.push(`Maximum ${MAX_PHOTOS} photos autorisées. ${incomingFiles.length - remaining} image(s) ignorée(s).`);
      }

      const filesToProcess = incomingFiles.slice(0, remaining);
      if (filesToProcess.length === 0) {
        setGlobalErrors(newErrors);
        return;
      }

      const addInvalidPhoto = (file: File, error: string, fingerprint?: string) => {
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";

        const invalidPhoto: PhotoItem = {
          id: crypto.randomUUID(),
          file,
          preview,
          error,
          validated: false,
          progress: 0,
          fingerprint: fingerprint ?? getFileFingerprint(file),
        };

        updatedPhotos = [...updatedPhotos, invalidPhoto];
        onChange(updatedPhotos);
      };

      setProcessing(true);
      setTotalFiles(filesToProcess.length);
      setCurrentFileIndex(0);

      try {
        for (let fi = 0; fi < filesToProcess.length; fi++) {
          const rawFile = filesToProcess[fi];
          setCurrentFileIndex(fi + 1);

          try {
            const normalizedFile = await normalizeImageFile(rawFile);

            if (!isAcceptedImageFormat(normalizedFile)) {
              addInvalidPhoto(rawFile, "Format non accepté. Utilisez JPG, PNG ou WEBP.");
              continue;
            }

            if (isFileTooLarge(normalizedFile)) {
              addInvalidPhoto(normalizedFile, "Image trop lourde. Taille maximale : 2 MB.");
              continue;
            }

            if (isScreenshot(normalizedFile.name)) {
              addInvalidPhoto(normalizedFile, "Capture d'écran non acceptée.");
              continue;
            }

            const fingerprint = getFileFingerprint(normalizedFile);
            const isDuplicate = updatedPhotos.some((p) => p.fingerprint === fingerprint);
            if (isDuplicate) {
              addInvalidPhoto(normalizedFile, "Image dupliquée : cette photo existe déjà.", fingerprint);
              continue;
            }

            const dims = await getImageDimensions(normalizedFile);

            if (isTooSmall(dims.width, dims.height)) {
              addInvalidPhoto(normalizedFile, "Image trop petite. Dimension minimale : 300 × 200 px.", fingerprint);
              continue;
            }

            if (isScreenshotRatio(dims.width, dims.height)) {
              addInvalidPhoto(normalizedFile, "Format vertical type capture d'écran non accepté.", fingerprint);
              continue;
            }

            const { blob } = await processImage(normalizedFile);
            const optimizedFile = new File([blob], normalizedFile.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
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

            updatedPhotos = [...updatedPhotos, photoItem];
            onChange(updatedPhotos);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Impossible de traiter cette image.";
            addInvalidPhoto(rawFile, errorMsg);
          }
        }
      } finally {
        setGlobalErrors(newErrors);
        setProcessing(false);
        setTotalFiles(0);
        setCurrentFileIndex(0);
      }
    },
    [onChange]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      await processFiles(files);
    },
    [processFiles]
  );

  const handleReplaceRequest = useCallback(
    (index: number) => {
      if (processing) return;
      replaceTargetIndexRef.current = index;
      replaceInputRef.current?.click();
    },
    [processing]
  );

  return (
    <div className="space-y-4" ref={dropZoneRef}>
      <DropZone
        onFiles={handleFiles}
        disabled={photos.length >= MAX_PHOTOS}
        processing={processing}
        photoCount={photos.length}
        maxPhotos={MAX_PHOTOS}
      />

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

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs sm:text-sm font-medium text-foreground">
            Photos :{" "}
            <span className={validCount < MIN_PHOTOS ? "text-destructive" : "text-accent"}>{validCount}</span> / {MAX_PHOTOS}
          </p>
        </div>
        {photos.length > 0 && (validCount < MIN_PHOTOS || hasErrors) && (
          <p className="text-[10px] sm:text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {hasErrors ? "Corrigez les images invalides" : `Min ${MIN_PHOTOS} photos`}
          </p>
        )}
      </div>

      <PhotoGrid
        photos={photos}
        onChange={onChange}
        onReplace={handleReplaceRequest}
        onAddMore={() => {
          const input = document.querySelector<HTMLInputElement>('input[data-photo-picker="gallery"]');
          if (input && photos.length < MAX_PHOTOS && !processing) input.click();
        }}
        maxPhotos={MAX_PHOTOS}
        minPhotos={MIN_PHOTOS}
      />

      {photos.length > 0 && !isValid && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
          <p className="text-xs sm:text-sm text-destructive font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {hasErrors
              ? "Veuillez corriger les images avant de continuer."
              : `Ajoutez au moins ${MIN_PHOTOS} photos pour publier votre logement.`}
          </p>
        </div>
      )}

      {photos.length === 0 && (
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-2">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement.
        </p>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED_INPUT}
        className="hidden"
        onChange={(e) => {
          const replaceIndex = replaceTargetIndexRef.current;
          replaceTargetIndexRef.current = null;

          if (e.target.files?.length && replaceIndex !== null) {
            void processFiles([e.target.files[0]], replaceIndex);
          }

          e.target.value = "";
        }}
      />
    </div>
  );
};

export default PhotoUploader;
