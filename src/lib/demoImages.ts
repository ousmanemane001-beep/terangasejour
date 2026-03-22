import living1 from "@/assets/rooms/living1.jpg";
import living2 from "@/assets/rooms/living2.jpg";
import living3 from "@/assets/rooms/living3.jpg";
import living4 from "@/assets/rooms/living4.jpg";
import bedroom1 from "@/assets/rooms/bedroom1.jpg";
import bedroom2 from "@/assets/rooms/bedroom2.jpg";
import bedroom3 from "@/assets/rooms/bedroom3.jpg";
import bedroom4 from "@/assets/rooms/bedroom4.jpg";
import bathroom1 from "@/assets/rooms/bathroom1.jpg";
import bathroom2 from "@/assets/rooms/bathroom2.jpg";
import bathroom3 from "@/assets/rooms/bathroom3.jpg";
import kitchen1 from "@/assets/rooms/kitchen1.jpg";
import kitchen2 from "@/assets/rooms/kitchen2.jpg";
import kitchen3 from "@/assets/rooms/kitchen3.jpg";
import pool1 from "@/assets/rooms/pool1.jpg";
import pool2 from "@/assets/rooms/pool2.jpg";
import terrace1 from "@/assets/rooms/terrace1.jpg";
import terrace2 from "@/assets/rooms/terrace2.jpg";
import exterior1 from "@/assets/rooms/exterior1.jpg";
import exterior2 from "@/assets/rooms/exterior2.jpg";
import exterior3 from "@/assets/rooms/exterior3.jpg";
import exterior4 from "@/assets/rooms/exterior4.jpg";
import exterior5 from "@/assets/rooms/exterior5.jpg";
import exterior6 from "@/assets/rooms/exterior6.jpg";
import exterior7 from "@/assets/rooms/exterior7.jpg";
import exterior8 from "@/assets/rooms/exterior8.jpg";

// All generated simulation images
const EXTERIORS = [exterior1, exterior2, exterior3, exterior4, exterior5, exterior6, exterior7, exterior8];
const LIVING_ROOMS = [living1, living2, living3, living4];
const BEDROOMS = [bedroom1, bedroom2, bedroom3, bedroom4];
const BATHROOMS = [bathroom1, bathroom2, bathroom3];
const KITCHENS = [kitchen1, kitchen2, kitchen3];
const POOLS_TERRACES = [pool1, pool2, terrace1, terrace2];

/** Simple hash from string to number */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns 5 unique photos for a listing:
 * 1. Extérieur, 2. Salon, 3. Chambre, 4. Salle de bain, 5. Cuisine ou piscine
 */
export function getDemoPhotos(propertyType: string, listingId: string): string[] {
  const h = hashId(listingId);
  const t = propertyType.toLowerCase();

  const isHotel = t.includes("hotel") || t.includes("hôtel") || t.includes("résidence") || t.includes("residence");

  return [
    EXTERIORS[h % EXTERIORS.length],
    LIVING_ROOMS[(h + 1) % LIVING_ROOMS.length],
    BEDROOMS[(h + 2) % BEDROOMS.length],
    BATHROOMS[(h + 3) % BATHROOMS.length],
    isHotel
      ? POOLS_TERRACES[(h + 4) % POOLS_TERRACES.length]
      : KITCHENS[(h + 4) % KITCHENS.length],
  ];
}
