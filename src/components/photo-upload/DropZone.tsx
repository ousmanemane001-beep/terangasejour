import { useRef, useCallback } from "react";
import { Upload, Loader2, ImagePlus, Camera, Image } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  disabled: boolean;
  processing: boolean;
  photoCount: number;
  maxPhotos: number;
}

const DropZone = ({ onFiles, disabled, processing, photoCount, maxPhotos }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const openPicker = useCallback(() => {
    if (!disabled && !processing) fileInputRef.current?.click();
  }, [disabled, processing]);

  const openCamera = useCallback(() => {
    if (!disabled && !processing) cameraInputRef.current?.click();
  }, [disabled, processing]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !processing) onFiles(e.dataTransfer.files);
    },
    [onFiles, disabled, processing]
  );

  return (
    <>
      <div
        onClick={!isMobile ? openPicker : undefined}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-2xl text-center transition-all duration-200 ${
          isMobile ? "p-6" : "p-10 sm:p-14"
        } ${
          disabled || processing
            ? "border-muted cursor-not-allowed opacity-50"
            : isMobile
            ? "border-border"
            : "border-border hover:border-accent hover:bg-accent/5 cursor-pointer active:border-accent group"
        }`}
      >
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="font-semibold text-foreground text-sm">Traitement en cours…</p>
            <p className="text-xs text-muted-foreground">Compression et vérification qualité</p>
          </div>
        ) : isMobile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              {photoCount === 0 ? (
                <Upload className="w-7 h-7 text-accent" />
              ) : (
                <ImagePlus className="w-7 h-7 text-accent" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {photoCount === 0 ? "Ajouter des photos" : "Ajouter d'autres photos"}
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={openCamera}
                disabled={disabled}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-4 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Caméra
              </button>
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-3 px-4 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
              >
                <Image className="w-4 h-4" />
                Galerie
              </button>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 text-center">
              <p>Formats acceptés : JPG, PNG, WEBP</p>
              <p>Dimension recommandée : 1500 × 1000 px</p>
              <p>Taille maximale : 2 Mo</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              {photoCount === 0 ? (
                <Upload className="w-8 h-8 text-accent" />
              ) : (
                <ImagePlus className="w-8 h-8 text-accent" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">
                {photoCount === 0 ? "Ajouter une image" : "Ajouter d'autres photos"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Glissez vos photos ici ou cliquez pour parcourir
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Formats acceptés : JPG, PNG, WEBP</p>
              <p>Dimension recommandée : 1500 × 1000 px</p>
              <p>Taille maximale : 2 Mo</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
};

export default DropZone;
