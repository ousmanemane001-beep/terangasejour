import { useRef, useCallback, useState } from "react";
import { Camera, Upload, X, Star, GripVertical, AlertCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

function SortablePhoto({ photo, index, onRemove }: { photo: PhotoItem; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-border">
      <img src={photo.preview} alt="" className="w-full h-full object-cover" />
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 w-7 h-7 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3.5 h-3.5 text-foreground" />
      </div>

      {/* Main photo badge */}
      {index === 0 && (
        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-md flex items-center gap-1">
          <Star className="w-2.5 h-2.5" />
          Principale
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-7 h-7 bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const PhotoUploader = ({ photos, onChange }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) {
        setErrors(["Vous avez atteint le maximum de 10 photos."]);
        return;
      }

      const newErrors: string[] = [];
      const validFiles: File[] = [];

      fileArray.slice(0, remaining).forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newErrors.push(`"${file.name}" : format non accepté (JPG ou PNG uniquement)`);
        } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          newErrors.push(`"${file.name}" : taille trop grande (max ${MAX_SIZE_MB} Mo)`);
        } else {
          validFiles.push(file);
        }
      });

      setErrors(newErrors);

      if (validFiles.length === 0) return;

      const newPhotos: PhotoItem[] = [];
      let loaded = 0;

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          newPhotos.push({
            id: crypto.randomUUID(),
            file,
            preview: ev.target?.result as string,
          });
          loaded++;
          if (loaded === validFiles.length) {
            onChange([...photos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [photos, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onChange(arrayMove(photos, oldIndex, newIndex));
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const emptySlots = Math.max(0, MIN_PHOTOS - photos.length);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => photos.length < MAX_PHOTOS && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
          photos.length >= MAX_PHOTOS
            ? "border-muted cursor-not-allowed opacity-50"
            : "border-border hover:border-accent cursor-pointer"
        }`}
      >
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground mb-1">Glissez vos photos ici</p>
        <p className="text-sm text-muted-foreground">ou cliquez pour parcourir</p>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG • Min 5, max 10 photos • 5 Mo par photo</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Photos ajoutées : <span className={photos.length < MIN_PHOTOS ? "text-destructive" : "text-accent"}>{photos.length}</span> / {MAX_PHOTOS}
        </p>
        {photos.length > 0 && photos.length < MIN_PHOTOS && (
          <p className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement
          </p>
        )}
      </div>

      {/* Photo grid with drag & drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <SortablePhoto key={photo.id} photo={photo} index={index} onRemove={() => removePhoto(index)} />
            ))}
            {/* Empty placeholder slots */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors"
              >
                <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
                <span className="text-[10px] text-muted-foreground/40">{photos.length + i + 1}</span>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {photos.length === 0 && (
        <p className="text-sm text-destructive font-medium text-center">
          Ajoutez au moins {MIN_PHOTOS} photos pour publier votre logement
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;
