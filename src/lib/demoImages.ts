// Real photos from Unsplash - organized by room type for variety
const EXTERIORS = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
];

const LIVING_ROOMS = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ez637a26a?w=800&q=80",
  "https://images.unsplash.com/photo-1616137466211-f73a09ec1032?w=800&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
];

const BEDROOMS = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32f1e27e13c?w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
  "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
  "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&q=80",
];

const BATHROOMS = [
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&q=80",
  "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80",
];

const KITCHENS = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800&q=80",
  "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80",
  "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
  "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
];

const POOLS_TERRACES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32f1e27e13c?w=800&q=80",
];

/** Simple hash from string to number */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns 5 unique real photos for a listing:
 * 1. Exterior/facade, 2. Salon, 3. Chambre, 4. Salle de bain, 5. Cuisine ou terrasse
 * Each listing gets a different photo from each category based on its ID.
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
