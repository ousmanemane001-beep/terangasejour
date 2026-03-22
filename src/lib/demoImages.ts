// Generated property images - local assets
import ext1 from "@/assets/properties/exterior-1.jpg";
import ext2 from "@/assets/properties/exterior-2.jpg";
import ext3 from "@/assets/properties/exterior-3.jpg";
import ext4 from "@/assets/properties/exterior-4.jpg";
import ext5 from "@/assets/properties/exterior-5.jpg";
import ext6 from "@/assets/properties/exterior-6.jpg";
import ext7 from "@/assets/properties/exterior-7.jpg";
import ext8 from "@/assets/properties/exterior-8.jpg";

import liv1 from "@/assets/properties/living-1.jpg";
import liv2 from "@/assets/properties/living-2.jpg";
import liv3 from "@/assets/properties/living-3.jpg";
import liv4 from "@/assets/properties/living-4.jpg";
import liv5 from "@/assets/properties/living-5.jpg";
import liv6 from "@/assets/properties/living-6.jpg";
import liv7 from "@/assets/properties/living-7.jpg";
import liv8 from "@/assets/properties/living-8.jpg";

import bed1 from "@/assets/properties/bedroom-1.jpg";
import bed2 from "@/assets/properties/bedroom-2.jpg";
import bed3 from "@/assets/properties/bedroom-3.jpg";
import bed4 from "@/assets/properties/bedroom-4.jpg";
import bed5 from "@/assets/properties/bedroom-5.jpg";
import bed6 from "@/assets/properties/bedroom-6.jpg";
import bed7 from "@/assets/properties/bedroom-7.jpg";
import bed8 from "@/assets/properties/bedroom-8.jpg";

import bath1 from "@/assets/properties/bathroom-1.jpg";
import bath2 from "@/assets/properties/bathroom-2.jpg";
import bath3 from "@/assets/properties/bathroom-3.jpg";
import bath4 from "@/assets/properties/bathroom-4.jpg";

import kit1 from "@/assets/properties/kitchen-1.jpg";
import kit2 from "@/assets/properties/kitchen-2.jpg";

import pool1 from "@/assets/properties/pool-1.jpg";
import pool2 from "@/assets/properties/pool-2.jpg";

const EXTERIORS = [ext1, ext2, ext3, ext4, ext5, ext6, ext7, ext8];
const LIVING_ROOMS = [liv1, liv2, liv3, liv4, liv5, liv6, liv7, liv8];
const BEDROOMS = [bed1, bed2, bed3, bed4, bed5, bed6, bed7, bed8];
const BATHROOMS = [bath1, bath2, bath3, bath4];
const KITCHENS = [kit1, kit2];
const POOLS_TERRACES = [pool1, pool2];

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
 * 1. Exterior, 2. Salon, 3. Chambre, 4. Salle de bain, 5. Cuisine ou piscine
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
