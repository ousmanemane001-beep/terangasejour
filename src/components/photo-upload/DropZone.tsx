import { useRef, useCallback } from "react";
import { Upload, Loader2, ImagePlus } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  disabled: boolean;
  processing: boolean;
  photoCount: number;
  maxPhotos: number;
}

const DropZone = ({ onFiles, disabled, processing, photoCount, maxPhotos }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    if (!disabled && !processing) fileInputRef.current?.click();
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
        onClick={openPicker}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-200 ${
          disabled || processing
            ? "border-muted cursor-not-allowed opacity-50"
            : "border-border hover:border-accent hover:bg-accent/5 cursor-pointer active:border-accent group"
        }`}
      >
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="font-semibold text-foreground">Traitement des images…</p>
            <p className="text-sm text-muted-foreground">Compression, vérification qualité et recadrage en cours</p>
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
                {photoCount === 0
                  ? "Glissez vos photos ici ou cliquez pour ajouter"
                  : "Ajouter d'autres photos"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, JPEG ou PNG • Max 10 Mo • Min 1200×800 px
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/*"
        multiple
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
