/**
 * Image processing utilities: compression, blur detection, darkness detection,
 * text/logo detection, duplicate detection, format conversion
 */
import heic2any from "heic2any";

const MAX_DIMENSION = 1920;
const TARGET_QUALITY_MIN = 0.6;
const TARGET_QUALITY_MAX = 0.85;
const TARGET_SIZE_MAX = 800 * 1024; // 800 KB for mobile optimization
const BLUR_THRESHOLD = 50;
const DARKNESS_THRESHOLD = 55;
const ASPECT_RATIO = 3 / 2;

/** Convert HEIC/HEIF files to JPEG */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 }) as Blob;
    const name = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    throw new Error("Impossible de convertir cette image HEIC. Essayez un autre format.");
  }
}

/** Convert any image to JPEG via canvas (for WEBP or other formats) */
export async function convertToJpeg(file: File): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
  const name = file.name.replace(/\.\w+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

/** Detect file format and convert if needed. Returns a JPG/PNG file. */
export async function ensureCompatibleFormat(file: File): Promise<{ file: File; converted: boolean; message?: string }> {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  const type = file.type.toLowerCase();

  // HEIC/HEIF (iPhone)
  if (ext === "heic" || ext === "heif" || type === "image/heic" || type === "image/heif") {
    const converted = await convertHeicToJpeg(file);
    return { file: converted, converted: true, message: "Image HEIC convertie en JPG automatiquement" };
  }

  // WEBP → convert to JPEG for broader compat
  if (ext === "webp" || type === "image/webp") {
    const converted = await convertToJpeg(file);
    return { file: converted, converted: true, message: "Image WEBP convertie en JPG automatiquement" };
  }

  // BMP, TIFF, etc → convert
  if (!["jpg", "jpeg", "png"].includes(ext)) {
    try {
      const converted = await convertToJpeg(file);
      return { file: converted, converted: true, message: `Image ${ext.toUpperCase()} convertie en JPG automatiquement` };
    } catch {
      return { file, converted: false };
    }
  }

  return { file, converted: false };
}

/** Load an image from a File and return the HTMLImageElement */
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

/** Resize, auto-crop to 3:2 ratio, and compress image to WebP */
export async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const result = await generateImageVariant(file, MAX_DIMENSION);
  return result;
}

/** Generate multiple size variants of an image */
export async function generateImageVariants(file: File): Promise<{
  thumbnail: Blob;
  medium: Blob;
  full: Blob;
  width: number;
  height: number;
}> {
  const [thumbnail, medium, full] = await Promise.all([
    generateImageVariant(file, 400),
    generateImageVariant(file, 900),
    generateImageVariant(file, 1500),
  ]);

  return {
    thumbnail: thumbnail.blob,
    medium: medium.blob,
    full: full.blob,
    width: full.width,
    height: full.height,
  };
}

/** Generate a single size variant with 3:2 crop and WebP compression */
async function generateImageVariant(file: File, maxWidth: number): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  let { naturalWidth: w, naturalHeight: h } = img;

  // Scale down to target max width
  if (w > maxWidth) {
    const ratio = maxWidth / w;
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  // Auto-crop to 3:2 aspect ratio (center crop)
  const currentRatio = w / h;
  let cropX = 0, cropY = 0, cropW = w, cropH = h;

  if (currentRatio > ASPECT_RATIO) {
    cropW = Math.round(h * ASPECT_RATIO);
    cropX = Math.round((w - cropW) / 2);
  } else if (currentRatio < ASPECT_RATIO) {
    cropH = Math.round(w / ASPECT_RATIO);
    cropY = Math.round((h - cropH) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d")!;

  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = w;
  tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.drawImage(img, 0, 0, w, h);

  ctx.drawImage(tmpCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // Compress to WebP
  let quality = TARGET_QUALITY_MAX;
  let blob = await canvasToBlob(canvas, "image/webp", quality);

  while (blob.size > TARGET_SIZE_MAX && quality > TARGET_QUALITY_MIN) {
    quality -= 0.05;
    blob = await canvasToBlob(canvas, "image/webp", quality);
  }

  return { blob, width: cropW, height: cropH };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b || new Blob()),
      type,
      quality
    );
  });
}

/** Detect blur using Laplacian variance on grayscale image */
export async function isImageBlurry(file: File): Promise<boolean> {
  try {
    const img = await loadImage(file);
    const size = 256;
    const canvas = document.createElement("canvas");
    const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray = new Float32Array(canvas.width * canvas.height);

    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * imageData.data[idx] + 0.587 * imageData.data[idx + 1] + 0.114 * imageData.data[idx + 2];
    }

    const w = canvas.width;
    const h = canvas.height;
    let sum = 0;
    let count = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const laplacian =
          -gray[(y - 1) * w + x] -
          gray[y * w + (x - 1)] +
          4 * gray[y * w + x] -
          gray[y * w + (x + 1)] -
          gray[(y + 1) * w + x];
        sum += laplacian * laplacian;
        count++;
      }
    }

    const variance = sum / count;
    return variance < BLUR_THRESHOLD;
  } catch {
    return false;
  }
}

/** Detect if the image is too dark */
export async function isImageTooDark(file: File): Promise<boolean> {
  try {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    const size = 128;
    const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let totalBrightness = 0;
    const pixelCount = canvas.width * canvas.height;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      totalBrightness += 0.299 * imageData.data[idx] + 0.587 * imageData.data[idx + 1] + 0.114 * imageData.data[idx + 2];
    }

    const avgBrightness = totalBrightness / pixelCount;
    return avgBrightness < DARKNESS_THRESHOLD;
  } catch {
    return false;
  }
}

/** Generate a perceptual hash for duplicate detection */
export async function generateImageHash(file: File): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 8, 8);

  const imageData = ctx.getImageData(0, 0, 8, 8);
  const gray: number[] = [];
  for (let i = 0; i < 64; i++) {
    const idx = i * 4;
    gray.push(0.299 * imageData.data[idx] + 0.587 * imageData.data[idx + 1] + 0.114 * imageData.data[idx + 2]);
  }

  const avg = gray.reduce((a, b) => a + b, 0) / 64;
  return gray.map((v) => (v >= avg ? "1" : "0")).join("");
}

/** Compare two hashes */
export function areHashesSimilar(hash1: string, hash2: string, threshold = 10): boolean {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance < threshold;
}

/** Get image dimensions without full processing */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}
