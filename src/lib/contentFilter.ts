/**
 * Detects and blocks phone numbers, emails, and external links in messages.
 */

const PHONE_REGEX = /(\+?\d[\d\s\-().]{6,}\d)|(\b0[1-9][\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}\b)/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9\-]+\.(com|net|org|fr|sn|io|co|info|biz|me)[^\s]*)/i;
const OBFUSCATED_PATTERNS = [
  /\bat\b.*\bdot\b/i,
  /\barobase\b/i,
  /\b(zéro|zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf)\b.*\b(zéro|zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf)\b/i,
];

export function containsBlockedContent(text: string): { blocked: boolean; reason: string } {
  if (PHONE_REGEX.test(text)) {
    return { blocked: true, reason: "Les numéros de téléphone ne sont pas autorisés dans les messages." };
  }
  if (EMAIL_REGEX.test(text)) {
    return { blocked: true, reason: "Les adresses email ne sont pas autorisées dans les messages." };
  }
  if (URL_REGEX.test(text)) {
    return { blocked: true, reason: "Les liens externes ne sont pas autorisés dans les messages." };
  }
  for (const pattern of OBFUSCATED_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "Ce message contient des informations de contact non autorisées." };
    }
  }
  return { blocked: false, reason: "" };
}
