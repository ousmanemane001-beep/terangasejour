import { useRef, useCallback, useState, useEffect } from "react";
import { AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import DropZone from "./photo-upload/DropZone";
import PhotoGrid from "./photo-upload/PhotoGrid";
import {
  isFileTooLarge,
  getFileFingerprint,
  isAcceptedImageFormat,
} from "./photo-upload/imageProcessor";

const MAX_PHOTOS = 5;
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
  onProcessingChange?: (processing: boolean) => void;
}

const PhotoUploader = ({ photos, onChange, onProcessingChange }: PhotoUploaderProps) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIndexRef = useRef<number | null>(null);

  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const photosRef = useRef(photos);
  photosRef.current = photos;

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
            if (!isAcceptedImageFormat(rawFile)) {
              addInvalidPhoto(rawFile, "Format non accepté. Utilisez JPG, PNG, HEIC ou WEBP.");
              continue;
            }

            if (isFileTooLarge(rawFile)) {
              addInvalidPhoto(rawFile, "Image trop lourde. Taille maximale : 20 MB.");
              continue;
            }

            const fingerprint = getFileFingerprint(rawFile);
            const isDuplicate = updatedPhotos.some((p) => p.fingerprint === fingerprint);
            if (isDuplicate) {
              addInvalidPhoto(rawFile, "Image dupliquée : cette photo existe déjà.", fingerprint);
              continue;
            }

            // No client-side processing — just create a preview from the raw file
            const preview = URL.createObjectURL(rawFile);

            const photoItem: PhotoItem = {
              id: crypto.randomUUID(),
              file: rawFile,
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

  const validCount = photos.filter((p) => !p.error && p.validated).length;

  return (
    <div className="space-y-4">
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

      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs sm:text-sm font-medium text-foreground">
          Photos : <span className="text-accent">{validCount}</span> / {MAX_PHOTOS}
        </p>
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
      />

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
