import { useState } from "react";
import { X, Star, Camera, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw } from "lucide-react";
import type { PhotoItem } from "../PhotoUploader";

interface PhotoGridProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onAddMore: () => void;
  onReplace: (index: number) => void;
  maxPhotos: number;
}

const PhotoGrid = ({ photos, onChange, onAddMore, onReplace, maxPhotos }: PhotoGridProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...photos];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIndex(index);
  };

  const handleDragEnd = () => setDragIndex(null);

  const removePhoto = (index: number) => {
    const removed = photos[index];
    if (removed.preview.startsWith("blob:")) URL.revokeObjectURL(removed.preview);
    onChange(photos.filter((_, i) => i !== index));
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange(updated);
  };

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;
    const updated = [...photos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo, index) => {
        const isPrimary = index === 0;

        return (
          <div key={photo.id} className="space-y-1">
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative rounded-xl overflow-hidden group border-2 transition-all ${
                photo.error
                  ? "border-destructive ring-2 ring-destructive/20"
                  : isPrimary
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border"
              } ${dragIndex === index ? "opacity-50 scale-95" : "hover:shadow-md"}`}
              style={{ aspectRatio: "3/2" }}
            >
              {photo.preview ? (
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {isPrimary && !photo.error && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Principale
                </div>
              )}

              {photo.error && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Invalide
                </div>
              )}

              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center hover:bg-destructive/90 shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                title="Supprimer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-1">
                {photo.error ? (
                  <button
                    type="button"
                    onClick={() => onReplace(index)}
                    className="px-2 py-0.5 bg-background/85 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-md hover:bg-background flex items-center gap-1 shadow-sm"
                  >
                    <RefreshCcw className="w-2.5 h-2.5" />
                    Remplacer
                  </button>
                ) : index !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(index)}
                    className="px-2 py-0.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-md hover:bg-background flex items-center gap-1 shadow-sm"
                  >
                    <Star className="w-2.5 h-2.5" />
                    Principale
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-0.5">
                  {index > 0 && !photo.error && (
                    <button
                      type="button"
                      onClick={() => movePhoto(index, "left")}
                      className="w-6 h-6 bg-background/80 backdrop-blur-sm text-foreground rounded-md flex items-center justify-center hover:bg-background shadow-sm"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < photos.length - 1 && !photo.error && (
                    <button
                      type="button"
                      onClick={() => movePhoto(index, "right")}
                      className="w-6 h-6 bg-background/80 backdrop-blur-sm text-foreground rounded-md flex items-center justify-center hover:bg-background shadow-sm"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {photo.error && (
              <p className="text-[10px] sm:text-xs text-destructive flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {photo.error}
              </p>
            )}
          </div>
        );
      })}

      {photos.length < maxPhotos && (
        <div
          onClick={onAddMore}
          className="rounded-xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 active:border-accent transition-colors"
          style={{ aspectRatio: "3/2" }}
        >
          <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/40">+</span>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
