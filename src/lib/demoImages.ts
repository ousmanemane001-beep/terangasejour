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
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80",
  "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
];

const BEDROOMS = [
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
];

const BATHROOMS = [
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&q=80",
  "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80",
];

const KITCHENS = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80",
  "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
  "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
  "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80",
];

const POOLS_TERRACES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32f1e27e13c?w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
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
