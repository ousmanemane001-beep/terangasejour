import { useRef, useCallback, useState, useEffect } from "react";
import { Camera, Upload, X, Star, GripVertical, AlertCircle, Loader2 } from "lucide-react";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 8;
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  error?: string | null;
  validated?: boolean;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onValidityChange?: (allValid: boolean) => void;
}

function getExtension(name: string): string {
  return (name.toLowerCase().split(".").pop() || "");
}

function isAcceptedFormat(file: File): boolean {
  if (ACCEPTED_MIME.includes(file.type)) return true;
  return ACCEPTED_EXTENSIONS.includes(getExtension(file.name));
}

/** Load image into canvas to validate dimensions and fix EXIF orientation.
 *  Modern browsers auto-correct EXIF in <img> and canvas drawImage. */
function validateImageDimensions(file: File): Promise<{ width: number; height: number; preview: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Draw through canvas to flatten EXIF orientation
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight, preview: url });
        return;
      }
      ctx.drawImage(img, 0, 0);

      // Create a corrected blob URL for preview
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const correctedUrl = URL.createObjectURL(blob);
            resolve({ width: img.naturalWidth, height: img.naturalHeight, preview: correctedUrl });
          } else {
            // Fallback to original URL
            resolve({ width: img.naturalWidth, height: img.naturalHeight, preview: URL.createObjectURL(file) });
          }
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire cette image."));
    };
    img.src = url;
  });
}

const PhotoUploader = ({ photos, onChange, onValidityChange }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // Notify parent of validity changes
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

      setProcessing(true);
      const newErrors: string[] = [];
      const newPhotos: PhotoItem[] = [];
      const filesToProcess = fileArray.slice(0, remaining);

      for (const file of filesToProcess) {
        // Format check
        if (!isAcceptedFormat(file)) {
          newErrors.push(`"${file.name}" : format non supporté. Utilisez JPG, PNG ou WEBP.`);
          continue;
        }

        // Size check
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          newErrors.push(`"${file.name}" (${sizeMB} Mo) : image trop lourde. Maximum ${MAX_SIZE_MB} Mo.`);
          continue;
        }

        // Dimension check + EXIF correction
        try {
          const { width, height, preview } = await validateImageDimensions(file);

          let error: string | null = null;
          if (width < MIN_WIDTH || height < MIN_HEIGHT) {
            error = `Dimensions trop petites (${width}×${height}). Minimum ${MIN_WIDTH}×${MIN_HEIGHT} px.`;
          }

          newPhotos.push({
            id: crypto.randomUUID(),
            file,
            preview,
            error,
            validated: true,
          });
        } catch {
          newErrors.push(`"${file.name}" : impossible de lire cette image.`);
        }
      }

      setGlobalErrors(newErrors);
      if (newPhotos.length > 0) {
        onChange([...photos, ...newPhotos]);
      }
      setProcessing(false);
    },
    [photos, onChange]
  );

  const openFilePicker = useCallback(() => {
    if (!processing && photos.length < MAX_PHOTOS) {
      fileInputRef.current?.click();
    }
  }, [processing, photos.length]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handlePhotoDragStart = (index: number) => setDragIndex(index);

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...photos];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIndex(index);
  };

  const handlePhotoDragEnd = () => setDragIndex(null);

  const removePhoto = (index: number) => {
    const removed = photos[index];
    if (removed.preview.startsWith("blob:")) {
      URL.revokeObjectURL(removed.preview);
    }
    onChange(photos.filter((_, i) => i !== index));
  };

  const hasInvalidPhotos = photos.some((p) => !!p.error);
  const emptySlots = Math.max(0, MIN_PHOTOS - photos.length);

  return (
    <div className="space-y-4">
      {/* Drop zone / tap zone */}
      <div
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors ${
          photos.length >= MAX_PHOTOS || processing
            ? "border-muted cursor-not-allowed opacity-50"
            : "border-border hover:border-accent cursor-pointer active:border-accent"
        }`}
      >
        {processing ? (
          <>
            <Loader2 className="w-10 h-10 text-accent mx-auto mb-3 animate-spin" />
            <p className="font-medium text-foreground mb-1">Validation des images…</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">Appuyez pour ajouter des photos</p>
            <p className="text-sm text-muted-foreground">depuis votre galerie ou appareil photo</p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG, WEBP • Min {MIN_WIDTH}×{MIN_HEIGHT} px • Min {MIN_PHOTOS}, max {MAX_PHOTOS} photos • {MAX_SIZE_MB} Mo max
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        capture={undefined}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {/* Global errors */}
      {globalErrors.length > 0 && (
        <div className="space-y-1">
          {globalErrors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-1">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Counter + invalid warning */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium text-foreground">
          Photos ajoutées :{" "}
          <span className={photos.length < MIN_PHOTOS ? "text-destructive" : "text-accent"}>
            {photos.length}
          </span>{" "}
          / {MAX_PHOTOS}
        </p>
        {photos.length > 0 && photos.length < MIN_PHOTOS && (
          <p className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ajoutez au moins {MIN_PHOTOS} photos
          </p>
        )}
      </div>

      {/* Invalid photos warning */}
      {hasInvalidPhotos && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">
            Veuillez remplacer les images non conformes avant de continuer.
          </p>
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handlePhotoDragStart(index)}
            onDragOver={(e) => handlePhotoDragOver(e, index)}
            onDragEnd={handlePhotoDragEnd}
            className={`relative rounded-xl overflow-hidden group border-2 ${
              photo.error ? "border-destructive" : "border-border"
            } ${dragIndex === index ? "opacity-50" : ""}`}
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={photo.preview}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Per-photo error overlay */}
            {photo.error && (
              <div className="absolute inset-0 bg-destructive/20 flex items-end">
                <p className="w-full text-[9px] leading-tight text-destructive-foreground bg-destructive/90 px-1.5 py-1 font-medium">
                  {photo.error}
                </p>
              </div>
            )}
            <div className="absolute top-1 left-1 w-7 h-7 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5 text-foreground" />
            </div>
            {index === 0 && !photo.error && (
              <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-md flex items-center gap-1">
                <Star className="w-2.5 h-2.5" />
                Principale
              </div>
            )}
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 w-7 h-7 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            onClick={openFilePicker}
            className="rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 active:border-accent transition-colors"
            style={{ aspectRatio: "4/3" }}
          >
            <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
            <span className="text-[10px] text-muted-foreground/40">{photos.length + i + 1}</span>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="text-sm text-destructive font-medium text-center">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;
