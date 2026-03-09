/**
 * Detects and blocks phone numbers, emails, external links, and social media handles.
 */

const PHONE_REGEX = /(\+?\d[\d\s\-().]{6,}\d)|(\b0[1-9][\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}\b)/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9\-]+\.(com|net|org|fr|sn|io|co|info|biz|me)[^\s]*)/i;
const SOCIAL_REGEX = /\b(whatsapp|instagram|insta|snapchat|snap|telegram|facebook|fb|tiktok)\b/i;
const SOCIAL_HANDLE_REGEX = /@[a-zA-Z0-9_.]{2,}/;
const OBFUSCATED_PATTERNS = [
  /\bat\b.*\bdot\b/i,
  /\barobase\b/i,
  /\b(zéro|zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf)\b.*\b(zéro|zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf)\b/i,
];

const LISTING_BLOCKED_REASON =
  "Pour des raisons de sécurité, il est interdit d'ajouter un numéro de téléphone, email ou contact externe dans la description du logement. Les échanges avec les voyageurs doivent se faire uniquement via la messagerie Teranga Séjour.";

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
  if (SOCIAL_REGEX.test(text) || SOCIAL_HANDLE_REGEX.test(text)) {
    return { blocked: true, reason: "Les références aux réseaux sociaux ne sont pas autorisées." };
  }
  for (const pattern of OBFUSCATED_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "Ce message contient des informations de contact non autorisées." };
    }
  }
  return { blocked: false, reason: "" };
}

/**
 * Validates listing text fields (title, description) for personal contact info.
 * Returns the blocked reason or empty string if OK.
 */
export function validateListingText(text: string): string {
  if (!text || !text.trim()) return "";
  if (PHONE_REGEX.test(text)) return LISTING_BLOCKED_REASON;
  if (EMAIL_REGEX.test(text)) return LISTING_BLOCKED_REASON;
  if (URL_REGEX.test(text)) return LISTING_BLOCKED_REASON;
  if (SOCIAL_REGEX.test(text) || SOCIAL_HANDLE_REGEX.test(text)) return LISTING_BLOCKED_REASON;
  for (const pattern of OBFUSCATED_PATTERNS) {
    if (pattern.test(text)) return LISTING_BLOCKED_REASON;
  }
  return "";
}
