import apt1 from "@/assets/demo/apartment-1.jpg";
import apt2 from "@/assets/demo/apartment-2.jpg";
import apt3 from "@/assets/demo/apartment-3.jpg";
import apt4 from "@/assets/demo/apartment-4.jpg";
import apt5 from "@/assets/demo/apartment-5.jpg";
import apt6 from "@/assets/demo/apartment-6.jpg";
import villa1 from "@/assets/demo/villa-1.jpg";
import villa2 from "@/assets/demo/villa-2.jpg";
import villa3 from "@/assets/demo/villa-3.jpg";
import villa4 from "@/assets/demo/villa-4.jpg";
import villa5 from "@/assets/demo/villa-5.jpg";
import villa6 from "@/assets/demo/villa-6.jpg";
import hotel1 from "@/assets/demo/hotel-1.jpg";
import hotel2 from "@/assets/demo/hotel-2.jpg";
import hotel3 from "@/assets/demo/hotel-3.jpg";
import hotel4 from "@/assets/demo/hotel-4.jpg";
import hotel5 from "@/assets/demo/hotel-5.jpg";
import hotel6 from "@/assets/demo/hotel-6.jpg";

const ALL_APARTMENT = [apt1, apt2, apt3, apt4, apt5, apt6];
const ALL_VILLA = [villa1, villa2, villa3, villa4, villa5, villa6];
const ALL_HOTEL = [hotel1, hotel2, hotel3, hotel4, hotel5, hotel6];

/** Simple hash from string to number */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns a unique set of 3 demo photos for a listing,
 * based on property type and listing id for deterministic variety.
 */
export function getDemoPhotos(propertyType: string, listingId: string): string[] {
  const t = propertyType.toLowerCase();

  let pool: string[];
  if (t.includes("villa") || t.includes("maison")) {
    pool = ALL_VILLA;
  } else if (
    t.includes("hotel") || t.includes("hôtel") ||
    t.includes("résidence") || t.includes("residence") ||
    t.includes("loft")
  ) {
    pool = ALL_HOTEL;
  } else {
    pool = ALL_APARTMENT;
  }

  const h = hashId(listingId);
  const start = h % pool.length;

  // Pick 3 photos starting from a unique offset
  const photos: string[] = [];
  for (let i = 0; i < 3; i++) {
    photos.push(pool[(start + i) % pool.length]);
  }

  return photos;
}
