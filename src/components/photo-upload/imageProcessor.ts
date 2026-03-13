/**
 * Simple rule-based image processing: resize, center-crop to 3:2, compress to WebP.
 * No AI, no blur/darkness detection, no perceptual hashing.
 */

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = 1000;
const COMPRESSION_QUALITY = 0.75;
const MIN_WIDTH = 80;
const MIN_HEIGHT = 80;

const SCREENSHOT_PATTERNS = ["screenshot", "screen", "capture"];

/** Check if a filename looks like a screenshot */
export function isScreenshot(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SCREENSHOT_PATTERNS.some((p) => lower.includes(p));
}

/** Check if image dimensions suggest a screenshot (height/width > 2.2) */
export function isScreenshotRatio(width: number, height: number): boolean {
  return height / width > 2.2;
}

/** Validate minimum dimensions */
export function isTooSmall(width: number, height: number): boolean {
  return width < MIN_WIDTH || height < MIN_HEIGHT;
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
    // Too wide → crop sides
    cropW = Math.round(srcH * targetRatio);
    cropX = Math.round((srcW - cropW) / 2);
  } else if (srcRatio < targetRatio) {
    // Too tall → crop top/bottom
    cropH = Math.round(srcW / targetRatio);
    cropY = Math.round((srcH - cropH) / 2);
  }

  // Draw cropped region resized to 1500×1000
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
