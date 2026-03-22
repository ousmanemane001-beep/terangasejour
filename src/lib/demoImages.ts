// Real photos from Unsplash (free, high-quality, royalty-free)
const ALL_APARTMENT = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", // modern living room
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", // bright apartment
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", // cozy bedroom
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80", // apartment interior
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80", // stylish studio
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80", // modern kitchen
];

const ALL_VILLA = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", // luxury villa pool
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // villa exterior
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", // villa garden
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", // modern villa
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80", // villa front
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", // beach villa
];

const ALL_HOTEL = [
  "https://images.unsplash.com/photo-1618773928121-c32f1e27e13c?w=800&q=80", // hotel room bed
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", // resort pool
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", // hotel lobby
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", // hotel exterior
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", // luxury hotel
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80", // hotel suite
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
 * Returns a unique set of 3 real photos for a listing,
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

  const photos: string[] = [];
  for (let i = 0; i < 3; i++) {
    photos.push(pool[(start + i) % pool.length]);
  }

  return photos;
}
