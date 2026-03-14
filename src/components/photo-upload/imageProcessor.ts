/**
 * Simple rule-based image processing: resize, center-crop to 3:2, compress to WebP.
 * No AI, no blur/darkness detection, no perceptual hashing.
 */

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = 1000;
const COMPRESSION_QUALITY = 0.75;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const SCREENSHOT_PATTERNS = ["screenshot", "screen", "capture"];

/** Check if a filename looks like a screenshot */
export function isScreenshot(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SCREENSHOT_PATTERNS.some((p) => lower.includes(p));
}

/** Check if image dimensions suggest a phone screenshot (9:16 or 19.5:9 style ratios) */
export function isScreenshotRatio(width: number, height: number): boolean {
  const ratio = height / width;
  // Portrait phone screenshots: ratio >= 1.7 (roughly 9:16 = 1.78, 19.5:9 = 2.17)
  return ratio >= 1.7;
}

/** Validate minimum dimensions */
export function isTooSmall(width: number, height: number): boolean {
  return width < MIN_WIDTH || height < MIN_HEIGHT;
}

/** Check if file exceeds max size */
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/** Simple hash for duplicate detection based on file size + name length */
export function getFileFingerprint(file: File): string {
  return `${file.size}-${file.name.length}-${file.type}`;
}

/** Load an image from a File */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Impossible de lire cette image.")); };
    img.src = url;
  });
}

/** Get image dimensions without full processing */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Process an image: center-crop to 3:2, resize to 1500×1000, compress to WebP at 75%.
 */
export async function processImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const { naturalWidth: srcW, naturalHeight: srcH } = img;

  // Calculate center crop for 3:2 ratio on source dimensions
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
