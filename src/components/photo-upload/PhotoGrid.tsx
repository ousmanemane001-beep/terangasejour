import { useState } from "react";
import { X, Star, AlertCircle, Crop, Camera, Loader2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import type { PhotoItem, RoomCategory } from "../PhotoUploader";

interface PhotoGridProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onCropRequest: (index: number) => void;
  onCategoryChange: (photoId: string, category: RoomCategory) => void;
  onAddMore: () => void;
  maxPhotos: number;
  minPhotos: number;
  roomLabels: Record<RoomCategory, { label: string; icon: React.ElementType }>;
}

const PhotoGrid = ({ photos, onChange, onCropRequest, onCategoryChange, onAddMore, maxPhotos, minPhotos, roomLabels }: PhotoGridProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

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

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;
    const updated = [...photos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const emptySlots = Math.max(0, minPhotos - photos.length);
  const allCategories = Object.keys(roomLabels) as RoomCategory[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {photos.map((photo, index) => {
        const category = photo.roomCategory || "autre";
        const { label: catLabel, icon: CatIcon } = roomLabels[category];
        const isPrimary = index === 0 && !photo.error && !photo.aiWarning;

        return (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative rounded-xl overflow-hidden group border-2 transition-all ${
              photo.error || photo.aiWarning
                ? "border-destructive"
                : isPrimary
                ? "border-accent ring-2 ring-accent/30"
                : "border-border"
            } ${dragIndex === index ? "opacity-50 scale-95" : "hover:shadow-md"}`}
            style={{ aspectRatio: "3/2" }}
          >
            <img
              src={photo.preview}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* AI analyzing overlay */}
            {photo.aiAnalyzing && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-[9px] font-medium text-primary">Analyse IA…</span>
              </div>
            )}

            {/* Error / AI warning overlay */}
            {(photo.error || photo.aiWarning) && !photo.aiAnalyzing && (
              <div className="absolute inset-0 bg-destructive/30 flex items-end">
                <p className="w-full text-[9px] leading-tight text-destructive-foreground bg-destructive/90 px-2 py-1.5 font-medium flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  {photo.aiWarning || photo.error}
                </p>
              </div>
            )}

            {/* Primary badge */}
            {isPrimary && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-current" />
                Photo principale
              </div>
            )}

            {/* Room category badge */}
            {!photo.aiAnalyzing && !photo.error && !photo.aiWarning && (
              <div className="absolute bottom-1.5 left-1.5 relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(editingCategory === photo.id ? null : photo.id);
                  }}
                  className="flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-[9px] font-medium rounded-md px-1.5 py-0.5 hover:bg-background transition-colors"
                >
                  <CatIcon className="w-2.5 h-2.5" />
                  {catLabel}
                  <ChevronDown className="w-2 h-2" />
                </button>

                {editingCategory === photo.id && (
                  <div className="absolute bottom-6 left-0 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                    {allCategories.map((cat) => {
                      const { label, icon: Icon } = roomLabels[cat];
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryChange(photo.id, cat);
                            setEditingCategory(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors ${
                            cat === category ? "text-primary font-medium" : "text-foreground"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Top-right action buttons: delete + crop */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="w-7 h-7 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center hover:bg-destructive/90 shadow-sm"
                title="Supprimer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onCropRequest(index)}
                className="w-7 h-7 bg-background/80 backdrop-blur-sm text-foreground rounded-lg flex items-center justify-center hover:bg-background shadow-sm"
                title="Recadrer"
              >
                <Crop className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reorder arrows */}
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => movePhoto(index, "left")}
                  className="w-6 h-6 bg-background/80 backdrop-blur-sm text-foreground rounded-md flex items-center justify-center hover:bg-background shadow-sm"
                  title="Déplacer à gauche"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {index < photos.length - 1 && (
                <button
                  type="button"
                  onClick={() => movePhoto(index, "right")}
                  className="w-6 h-6 bg-background/80 backdrop-blur-sm text-foreground rounded-md flex items-center justify-center hover:bg-background shadow-sm"
                  title="Déplacer à droite"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Set as primary button (non-primary photos) */}
            {index !== 0 && !photo.error && !photo.aiWarning && (
              <button
                type="button"
                onClick={() => setAsPrimary(index)}
                className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background flex items-center gap-1 shadow-sm"
                title="Définir comme photo principale"
              >
                <Star className="w-2.5 h-2.5" />
                Principale
              </button>
            )}

            {/* Quality score badge */}
            {photo.qualityScore != null && !photo.aiAnalyzing && !photo.error && !photo.aiWarning && (
              <div className={`absolute top-1.5 right-10 px-1.5 py-0.5 rounded text-[9px] font-bold md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                photo.qualityScore >= 7 ? "bg-green-500/90 text-white" :
                photo.qualityScore >= 4 ? "bg-amber-500/90 text-white" :
                "bg-destructive/90 text-white"
              }`}>
                {photo.qualityScore}/10
              </div>
            )}
          </div>
        );
      })}

      {/* Empty slots */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          onClick={onAddMore}
          className="rounded-xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 active:border-accent transition-colors"
          style={{ aspectRatio: "3/2" }}
        >
          <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/40">{photos.length + i + 1}</span>
        </div>
      ))}

      {/* Add more button */}
      {emptySlots === 0 && photos.length < maxPhotos && (
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
