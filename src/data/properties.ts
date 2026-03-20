// Real Unsplash photos — Senegal destinations
// Dakar
const dakar1 = "https://images.unsplash.com/photo-1611258490565-4a06c019e631?w=800&q=80&auto=format";
const dakar2 = "https://images.unsplash.com/photo-1611258490622-458315cddc61?w=800&q=80&auto=format";
const dakar3 = "https://images.unsplash.com/photo-1603646681390-bb763559f730?w=800&q=80&auto=format";
const dakar4 = "https://images.unsplash.com/photo-1648504735618-6b60e3651a2a?w=800&q=80&auto=format";

// Saly
const saly1 = "https://images.unsplash.com/photo-1743518576305-652c0e1a6fdb?w=800&q=80&auto=format";
const saly2 = "https://images.unsplash.com/photo-1743518576324-c0e2c7cf5368?w=800&q=80&auto=format";
const saly3 = "https://images.unsplash.com/photo-1743518576341-565e14b77dcc?w=800&q=80&auto=format";
const saly4 = "https://images.unsplash.com/photo-1657302699239-c350f0372260?w=800&q=80&auto=format";
const saly5 = "https://images.unsplash.com/photo-1686217099527-f94a0b22ad20?w=800&q=80&auto=format";

// Somone
const somone1 = "https://images.unsplash.com/photo-1569103470612-0414542f9355?w=800&q=80&auto=format";
const somone2 = "https://images.unsplash.com/photo-1570651403445-54c2b0f568c0?w=800&q=80&auto=format";
const somone3 = "https://images.unsplash.com/photo-1644772019005-5dc8e8ad66b7?w=800&q=80&auto=format";

// Saint-Louis
const stlouis1 = "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=800&q=80&auto=format";
const stlouis2 = "https://images.unsplash.com/photo-1590232087224-5d421218d69a?w=800&q=80&auto=format";
const stlouis3 = "https://images.unsplash.com/photo-1615486905505-7863587b1c3f?w=800&q=80&auto=format";

// Cap Skirring / Casamance
const capskirring1 = "https://images.unsplash.com/photo-1588262830598-726eaaed0b63?w=800&q=80&auto=format";
const capskirring2 = "https://images.unsplash.com/photo-1630675827442-ad4b02c360e1?w=800&q=80&auto=format";

// Gorée
const goree1 = "https://images.unsplash.com/photo-1629300678017-eb3cb4eb4b77?w=800&q=80&auto=format";
const goree2 = "https://images.unsplash.com/photo-1615478507721-6a0c31244ed1?w=800&q=80&auto=format";

export interface Property {
  id: number;
  image: string;
  images?: string[];
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  type: string;
  bedrooms: number;
  bathrooms?: number;
  guests: number;
  amenities: string[];
  description?: string;
  lat: number;
  lng: number;
}

export const properties: Property[] = [
  {
    id: 1,
    image: saly1,
    images: [saly1, saly2, saly3, saly4, saly5],
    title: "Villa Palmier avec Piscine",
    location: "Saly, Petite Côte",
    price: 85000,
    rating: 4.9,
    reviewCount: 47,
    type: "Villa",
    bedrooms: 4,
    guests: 8,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen"],
    description: "Superbe villa avec piscine privée à Saly, à deux pas de la plage. Profitez d'un cadre tropical avec tout le confort moderne.",
    lat: 14.4474,
    lng: -17.0174,
  },
  {
    id: 2,
    image: dakar1,
    images: [dakar1, dakar2, dakar3, dakar4],
    title: "Appartement Vue Mer",
    location: "Almadies, Dakar",
    price: 45000,
    rating: 4.7,
    reviewCount: 32,
    type: "Appartement",
    bedrooms: 2,
    guests: 4,
    amenities: ["wifi", "ac", "tv", "kitchen"],
    description: "Appartement lumineux avec vue panoramique sur l'océan Atlantique, situé dans le quartier prisé des Almadies.",
    lat: 14.7456,
    lng: -17.5139,
  },
  {
    id: 3,
    image: goree1,
    images: [goree1, goree2],
    title: "Maison d'Hôtes Traditionnelle",
    location: "Gorée, Dakar",
    price: 35000,
    rating: 4.8,
    reviewCount: 61,
    type: "Maison d'hôtes",
    bedrooms: 3,
    guests: 6,
    amenities: ["wifi", "kitchen", "garden"],
    description: "Maison de charme sur l'île historique de Gorée, architecture coloniale et ambiance unique.",
    lat: 14.6672,
    lng: -17.3986,
  },
  {
    id: 4,
    image: stlouis1,
    images: [stlouis1, stlouis2, stlouis3],
    title: "Loft Moderne Vue Fleuve",
    location: "Saint-Louis",
    price: 55000,
    rating: 4.6,
    reviewCount: 23,
    type: "Loft",
    bedrooms: 1,
    guests: 2,
    amenities: ["wifi", "ac", "tv", "security"],
    description: "Loft contemporain avec vue sur le fleuve Sénégal, au cœur de la ville historique de Saint-Louis.",
    lat: 16.0326,
    lng: -16.4896,
  },
  {
    id: 5,
    image: capskirring1,
    images: [capskirring1, capskirring2],
    title: "Éco-Lodge Tropical",
    location: "Cap Skirring, Casamance",
    price: 65000,
    rating: 4.9,
    reviewCount: 38,
    type: "Lodge",
    bedrooms: 2,
    guests: 4,
    amenities: ["wifi", "pool", "garden", "kitchen"],
    description: "Lodge écologique niché dans la végétation luxuriante de la Casamance, à quelques pas des plus belles plages d'Afrique.",
    lat: 12.3933,
    lng: -16.7461,
  },
  {
    id: 6,
    image: dakar3,
    images: [dakar3, dakar4, dakar1],
    title: "Résidence de Luxe Ngor",
    location: "Ngor, Dakar",
    price: 120000,
    rating: 4.9,
    reviewCount: 19,
    type: "Villa",
    bedrooms: 5,
    guests: 10,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen", "security", "garden"],
    description: "Résidence haut de gamme à Ngor avec vue imprenable sur l'île de Ngor et accès direct à la plage.",
    lat: 14.7532,
    lng: -17.5193,
  },
  {
    id: 7,
    image: dakar2,
    title: "Studio Cosy Plateau",
    location: "Plateau, Dakar",
    price: 25000,
    rating: 4.5,
    reviewCount: 56,
    type: "Studio",
    bedrooms: 1,
    guests: 2,
    amenities: ["wifi", "ac", "tv"],
    description: "Studio moderne et bien équipé au cœur du Plateau, idéal pour les voyageurs d'affaires.",
    lat: 14.6752,
    lng: -17.4380,
  },
  {
    id: 8,
    image: somone1,
    images: [somone1, somone2, somone3],
    title: "Villa Bord de Mer",
    location: "Somone, Petite Côte",
    price: 95000,
    rating: 4.8,
    reviewCount: 34,
    type: "Villa",
    bedrooms: 3,
    guests: 6,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen", "garden"],
    description: "Villa de charme en front de mer à Somone, avec accès direct à la lagune et aux plages de sable fin.",
    lat: 14.4860,
    lng: -17.0768,
  },
  {
    id: 9,
    image: saly4,
    images: [saly4, saly5, saly1, saly2, saly3],
    title: "Villa moderne avec piscine à Saly",
    location: "Saly, Mbour",
    price: 50000,
    rating: 4.8,
    reviewCount: 12,
    type: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    guests: 5,
    amenities: ["pool", "ac", "wifi", "kitchen", "parking"],
    description: "Belle villa moderne située à Saly Mbour, idéale pour les vacances en famille ou entre amis. La villa dispose d'une piscine privée, d'un salon spacieux, d'une cuisine équipée et d'une terrasse.",
    lat: 14.4474,
    lng: -17.0174,
  },
];
