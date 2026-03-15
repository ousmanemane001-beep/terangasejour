/**
 * Image processing: resize, convert to WebP, compress.
 * Mobile-safe: uses progressive downscaling to prevent memory crashes.
 */

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = 1000;
const COMPRESSION_QUALITY = 0.80;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/** Max canvas dimension before progressive downscale (prevents mobile OOM) */
const MOBILE_SAFE_MAX_DIM = 4096;

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const HEIC_EXTENSIONS = ["heic", "heif"];

function getExtension(fileName: string): string {
  return fileName.toLowerCase().split(".").pop() || "";
}

export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

export function isAcceptedImageFormat(file: File): boolean {
  const ext = getExtension(file.name);
  const type = file.type.toLowerCase();
  if (ACCEPTED_EXTENSIONS.includes(ext) || HEIC_EXTENSIONS.includes(ext)) return true;
  if (["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(type)) return true;
  return false;
}

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
      quality: 0.85,
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

export function getFileFingerprint(file: File): string {
  return `${file.size}-${file.lastModified}-${file.type}-${file.name.toLowerCase()}`;
}

/** Load an image from a File with timeout for mobile safety */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Chargement de l'image trop long."));
    }, 30000);
    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire cette image."));
    };
    img.src = url;
  });
}

/**
 * Progressive downscale: if the source is very large, first draw it to a
 * smaller intermediate canvas to avoid mobile browser OOM crashes.
 * Returns a canvas-compatible source at a safe size.
 */
function safeDownscale(
  img: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number
): { source: CanvasImageSource; sx: number; sy: number; sw: number; sh: number } {
  // If cropped region is small enough, use image directly
  if (cropW <= MOBILE_SAFE_MAX_DIM && cropH <= MOBILE_SAFE_MAX_DIM) {
    return { source: img, sx: cropX, sy: cropY, sw: cropW, sh: cropH };
  }

  // Calculate intermediate size (halve until under limit)
  let scale = 1;
  let w = cropW;
  let h = cropH;
  while (w > MOBILE_SAFE_MAX_DIM || h > MOBILE_SAFE_MAX_DIM) {
    scale *= 0.5;
    w = Math.round(cropW * scale);
    h = Math.round(cropH * scale);
  }

  const intermediateCanvas = document.createElement("canvas");
  intermediateCanvas.width = w;
  intermediateCanvas.height = h;
  const ctx = intermediateCanvas.getContext("2d");
  if (!ctx) {
    return { source: img, sx: cropX, sy: cropY, sw: cropW, sh: cropH };
  }
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, w, h);
  return { source: intermediateCanvas, sx: 0, sy: 0, sw: w, sh: h };
}

/**
 * Process an image: center-crop to 3:2, resize to 1500×1000, compress to WebP at 80%.
 * Uses progressive downscaling for mobile safety.
 */
export async function processImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const { naturalWidth: srcW, naturalHeight: srcH } = img;

  if (srcW === 0 || srcH === 0) {
    throw new Error("Image invalide (dimensions nulles).");
  }

  // Calculate center crop for 3:2 ratio
  const targetRatio = 3 / 2;
  const srcRatio = srcW / srcH;
  let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;

  if (srcRatio > targetRatio) {
    cropW = Math.round(srcH * targetRatio);
    cropX = Math.round((srcW - cropW) / 2);
  } else if (srcRatio < targetRatio) {
    cropH = Math.round(srcW / targetRatio);
    cropY = Math.round((srcH - cropH) / 2);
  }

  // Progressive downscale for mobile safety
  const { source, sx, sy, sw, sh } = safeDownscale(img, cropX, cropY, cropW, cropH);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de créer le contexte graphique.");
  }
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (b) => {
          if (b && b.size > 0) {
            resolve(b);
          } else {
            reject(new Error("Échec de la compression de l'image."));
          }
        },
        "image/webp",
        COMPRESSION_QUALITY
      );
    } catch {
      reject(new Error("Échec de la compression de l'image."));
    }
  });

  return { blob, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT };
}
