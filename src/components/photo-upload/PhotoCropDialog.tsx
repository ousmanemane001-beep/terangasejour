import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PhotoCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const PhotoCropDialog = ({ open, onClose, imageSrc, onCropComplete }: PhotoCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const aspect = 4 / 3;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setCrop(centerAspectCrop(w, h, aspect));
  }, []);

  const handleSave = useCallback(async () => {
    if (!imgRef.current || !crop) return;
    setSaving(true);

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = (crop.unit === "%" ? (crop.x / 100) * image.width : crop.x) * scaleX;
    const cropY = (crop.unit === "%" ? (crop.y / 100) * image.height : crop.y) * scaleY;
    const cropW = (crop.unit === "%" ? (crop.width / 100) * image.width : crop.width) * scaleX;
    const cropH = (crop.unit === "%" ? (crop.height / 100) * image.height : crop.height) * scaleY;

    // Limit output to 1920px
    const maxDim = 1920;
    let outW = cropW;
    let outH = cropH;
    if (outW > maxDim || outH > maxDim) {
      const ratio = Math.min(maxDim / outW, maxDim / outH);
      outW = Math.round(outW * ratio);
      outH = Math.round(outH * ratio);
    }

    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (blob) onCropComplete(blob);
      },
      "image/webp",
      0.85
    );
  }, [crop, onCropComplete]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recadrer la photo de couverture</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={aspect}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recadrage"
              onLoad={onImageLoad}
              className="max-h-[55vh] object-contain"
            />
          </ReactCrop>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Format recommandé : 4:3 — Déplacez et redimensionnez le cadre
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !crop}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCropDialog;
