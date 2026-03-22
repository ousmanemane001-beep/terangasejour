import apt1 from "@/assets/demo/apartment-1.jpg";
import apt2 from "@/assets/demo/apartment-2.jpg";
import apt3 from "@/assets/demo/apartment-3.jpg";
import villa1 from "@/assets/demo/villa-1.jpg";
import villa2 from "@/assets/demo/villa-2.jpg";
import villa3 from "@/assets/demo/villa-3.jpg";
import hotel1 from "@/assets/demo/hotel-1.jpg";
import hotel2 from "@/assets/demo/hotel-2.jpg";
import hotel3 from "@/assets/demo/hotel-3.jpg";

const DEMO_PHOTOS: Record<string, string[]> = {
  apartment: [apt1, apt2, apt3],
  villa: [villa1, villa2, villa3],
  hotel: [hotel1, hotel2, hotel3],
};

/**
 * Returns demo photos based on property type.
 * Uses a stable index derived from listing id to vary which set of photos each card gets.
 */
export function getDemoPhotos(propertyType: string, listingId: string): string[] {
  const t = propertyType.toLowerCase();

  let key = "apartment";
  if (t.includes("villa") || t.includes("maison")) key = "villa";
  else if (t.includes("hotel") || t.includes("hôtel") || t.includes("résidence") || t.includes("residence") || t.includes("loft")) key = "hotel";

  const photos = DEMO_PHOTOS[key];

  // Rotate starting photo based on id to add variety
  const hash = listingId.charCodeAt(0) + (listingId.charCodeAt(listingId.length - 1) || 0);
  const offset = hash % photos.length;
  return [...photos.slice(offset), ...photos.slice(0, offset)];
}
