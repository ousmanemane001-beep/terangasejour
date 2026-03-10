/**
 * Image processing utilities: compression, blur detection, duplicate detection, HEIC conversion
 */

const MAX_DIMENSION = 1920;
const TARGET_QUALITY_MIN = 0.6;
const TARGET_QUALITY_MAX = 0.85;
const TARGET_SIZE_MIN = 300 * 1024; // 300 KB
const TARGET_SIZE_MAX = 500 * 1024; // 500 KB
const BLUR_THRESHOLD = 50;

/** Convert HEIC to JPEG using heic2any */
export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 }) as Blob;
  return new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
}

/** Check if file is HEIC format */
export function isHeic(file: File): boolean {
  return file.type === "image/heic" || file.type === "image/heif" ||
    /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
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

/** Resize and compress image to WebP, targeting 300-500KB, max 1920px */
export async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  let { naturalWidth: w, naturalHeight: h } = img;

  // Scale down if needed
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  // Try to hit target size range with WebP
  let quality = TARGET_QUALITY_MAX;
  let blob = await canvasToBlob(canvas, "image/webp", quality);

  // If too large, reduce quality
  while (blob.size > TARGET_SIZE_MAX && quality > TARGET_QUALITY_MIN) {
    quality -= 0.05;
    blob = await canvasToBlob(canvas, "image/webp", quality);
  }

  return { blob, width: w, height: h };
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
    const size = 256; // Analyze at reduced size for speed
    const canvas = document.createElement("canvas");
    const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight, 1);
    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray = new Float32Array(canvas.width * canvas.height);

    // Convert to grayscale
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * imageData.data[idx] + 0.587 * imageData.data[idx + 1] + 0.114 * imageData.data[idx + 2];
    }

    // Laplacian kernel convolution
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
    return false; // If we can't analyze, don't block
  }
}

/** Generate a perceptual hash (simple average hash) for duplicate detection */
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

/** Compare two hashes - returns true if images are similar (hamming distance < threshold) */
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
