import { useState } from "react";
import { X, Star, GripVertical, AlertCircle, Crop, Camera } from "lucide-react";
import type { PhotoItem } from "../PhotoUploader";

interface PhotoGridProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onCropRequest: (index: number) => void;
  onAddMore: () => void;
  maxPhotos: number;
  minPhotos: number;
}

const PhotoGrid = ({ photos, onChange, onCropRequest, onAddMore, maxPhotos, minPhotos }: PhotoGridProps) => {
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
    if (index === 0 || photos[index].error) return;
    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange(updated);
  };

  const emptySlots = Math.max(0, minPhotos - photos.length);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative rounded-xl overflow-hidden group border-2 transition-all ${
            photo.error ? "border-destructive" : index === 0 ? "border-accent" : "border-border"
          } ${dragIndex === index ? "opacity-50 scale-95" : "hover:shadow-md"}`}
          style={{ aspectRatio: "4/3" }}
        >
          <img
            src={photo.preview}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Error overlay */}
          {photo.error && (
            <div className="absolute inset-0 bg-destructive/30 flex items-end">
              <p className="w-full text-[9px] leading-tight text-destructive-foreground bg-destructive/90 px-2 py-1.5 font-medium flex items-start gap-1">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                {photo.error}
              </p>
            </div>
          )}

          {/* Drag handle */}
          <div className="absolute top-1.5 left-1.5 w-7 h-7 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="w-3.5 h-3.5 text-foreground" />
          </div>

          {/* Primary badge */}
          {index === 0 && !photo.error && (
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-md flex items-center gap-1">
              <Star className="w-2.5 h-2.5" />
              Couverture
            </div>
          )}

          {/* Action buttons overlay */}
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="w-7 h-7 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center hover:bg-destructive/90"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {index === 0 && !photo.error && (
              <button
                type="button"
                onClick={() => onCropRequest(index)}
                className="w-7 h-7 bg-background/80 backdrop-blur-sm text-foreground rounded-lg flex items-center justify-center hover:bg-background"
                title="Recadrer"
              >
                <Crop className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Set as primary button (non-primary photos) */}
          {index !== 0 && !photo.error && (
            <button
              type="button"
              onClick={() => setAsPrimary(index)}
              className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background flex items-center gap-1"
            >
              <Star className="w-2.5 h-2.5" />
              Définir couverture
            </button>
          )}
        </div>
      ))}

      {/* Empty slots */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          onClick={onAddMore}
          className="rounded-xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 active:border-accent transition-colors"
          style={{ aspectRatio: "4/3" }}
        >
          <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/40">{photos.length + i + 1}</span>
        </div>
      ))}

      {/* Add more button if slots filled but not at max */}
      {emptySlots === 0 && photos.length < maxPhotos && (
        <div
          onClick={onAddMore}
          className="rounded-xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 active:border-accent transition-colors"
          style={{ aspectRatio: "4/3" }}
        >
          <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/40">+</span>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
