import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";

// Villa Saly images (public folder)
const villaSaly1 = "/images/villa-saly-1.jpg";
const villaSaly2 = "/images/villa-saly-2.jfif";
const villaSaly3 = "/images/villa-saly-3.jfif";
const villaSaly4 = "/images/villa-saly-4.jfif";
const villaSaly5 = "/images/villa-saly-5.jfif";

export interface Property {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  type: string;
  bedrooms: number;
  guests: number;
  amenities: string[];
  lat: number;
  lng: number;
}

export const properties: Property[] = [
  {
    id: 1,
    image: property1,
    title: "Villa Palmier avec Piscine",
    location: "Saly, Petite Côte",
    price: 85000,
    rating: 4.9,
    reviewCount: 47,
    type: "Villa",
    bedrooms: 4,
    guests: 8,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen"],
    lat: 14.4474,
    lng: -17.0174,
  },
  {
    id: 2,
    image: property2,
    title: "Appartement Vue Mer",
    location: "Almadies, Dakar",
    price: 45000,
    rating: 4.7,
    reviewCount: 32,
    type: "Appartement",
    bedrooms: 2,
    guests: 4,
    amenities: ["wifi", "ac", "tv", "kitchen"],
    lat: 14.7456,
    lng: -17.5139,
  },
  {
    id: 3,
    image: property3,
    title: "Maison d'Hôtes Traditionnelle",
    location: "Gorée, Dakar",
    price: 35000,
    rating: 4.8,
    reviewCount: 61,
    type: "Maison d'hôtes",
    bedrooms: 3,
    guests: 6,
    amenities: ["wifi", "kitchen", "garden"],
    lat: 14.6672,
    lng: -17.3986,
  },
  {
    id: 4,
    image: property4,
    title: "Loft Moderne Vue Fleuve",
    location: "Saint-Louis",
    price: 55000,
    rating: 4.6,
    reviewCount: 23,
    type: "Loft",
    bedrooms: 1,
    guests: 2,
    amenities: ["wifi", "ac", "tv", "security"],
    lat: 16.0326,
    lng: -16.4896,
  },
  {
    id: 5,
    image: property5,
    title: "Éco-Lodge Tropical",
    location: "Cap Skirring, Casamance",
    price: 65000,
    rating: 4.9,
    reviewCount: 38,
    type: "Lodge",
    bedrooms: 2,
    guests: 4,
    amenities: ["wifi", "pool", "garden", "kitchen"],
    lat: 12.3933,
    lng: -16.7461,
  },
  {
    id: 6,
    image: property1,
    title: "Résidence de Luxe Ngor",
    location: "Ngor, Dakar",
    price: 120000,
    rating: 4.9,
    reviewCount: 19,
    type: "Villa",
    bedrooms: 5,
    guests: 10,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen", "security", "garden"],
    lat: 14.7532,
    lng: -17.5193,
  },
  {
    id: 7,
    image: property3,
    title: "Studio Cosy Plateau",
    location: "Plateau, Dakar",
    price: 25000,
    rating: 4.5,
    reviewCount: 56,
    type: "Studio",
    bedrooms: 1,
    guests: 2,
    amenities: ["wifi", "ac", "tv"],
    lat: 14.6752,
    lng: -17.4380,
  },
  {
    id: 8,
    image: property4,
    title: "Villa Bord de Mer",
    location: "Somone, Petite Côte",
    price: 95000,
    rating: 4.8,
    reviewCount: 34,
    type: "Villa",
    bedrooms: 3,
    guests: 6,
    amenities: ["wifi", "pool", "parking", "ac", "kitchen", "garden"],
    lat: 14.4860,
    lng: -17.0768,
  },
];
