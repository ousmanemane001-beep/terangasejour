/**
 * Image processing: resize, convert to WebP, compress.
 */

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = 1000;
const COMPRESSION_QUALITY = 0.80;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const HEIC_EXTENSIONS = ["heic", "heif"];

function getExtension(fileName: string): string {
  return fileName.toLowerCase().split(".").pop() || "";
}

/** Check if file exceeds max size */
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/** Accept standard web formats + HEIC/HEIF */
export function isAcceptedImageFormat(file: File): boolean {
  const ext = getExtension(file.name);
  const type = file.type.toLowerCase();
  if (ACCEPTED_EXTENSIONS.includes(ext) || HEIC_EXTENSIONS.includes(ext)) return true;
  if (["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(type)) return true;
  return false;
}

/** Check HEIC/HEIF formats */
export function isHeicFormat(file: File): boolean {
  const ext = getExtension(file.name);
  const type = file.type.toLowerCase();
  return HEIC_EXTENSIONS.includes(ext) || type === "image/heic" || type === "image/heif";
}

/** Convert HEIC/HEIF to JPEG for browser compatibility */
export async function normalizeImageFile(file: File): Promise<File> {
  if (!isHeicFormat(file)) return file;

  try {
    const heic2any = (await import("heic2any")).default as any;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
    if (!(convertedBlob instanceof Blob)) {
      throw new Error("Conversion HEIC invalide");
    }

    const fileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([convertedBlob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    throw new Error("Format HEIC non pris en charge sur cet appareil. Convertissez l'image en JPG ou PNG.");
  }
}

/** Simple fingerprint for duplicate detection */
export function getFileFingerprint(file: File): string {
  return `${file.size}-${file.lastModified}-${file.type}-${file.name.toLowerCase()}`;
}

/** Load an image from a File */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire cette image."));
    };
    img.src = url;
  });
}

/**
 * Process an image: center-crop to 3:2, resize to 1500×1000, compress to WebP at 80%.
 */
export async function processImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const { naturalWidth: srcW, naturalHeight: srcH } = img;

  // Calculate center crop for 3:2 ratio on source dimensions
  const targetRatio = 3 / 2;
  const srcRatio = srcW / srcH;
  let cropX = 0,
    cropY = 0,
    cropW = srcW,
    cropH = srcH;

  if (srcRatio > targetRatio) {
    cropW = Math.round(srcH * targetRatio);
    cropX = Math.round((srcW - cropW) / 2);
  } else if (srcRatio < targetRatio) {
    cropH = Math.round(srcW / targetRatio);
    cropY = Math.round((srcH - cropH) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), "image/webp", COMPRESSION_QUALITY);
  });

  return { blob, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT };
}
