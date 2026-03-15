/**
 * Image validation utilities — lightweight, no canvas/blob processing.
 * All heavy processing (resize, compress, HEIC conversion) happens server-side.
 */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

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

export function getFileFingerprint(file: File): string {
  return `${file.size}-${file.lastModified}-${file.type}-${file.name.toLowerCase()}`;
}
