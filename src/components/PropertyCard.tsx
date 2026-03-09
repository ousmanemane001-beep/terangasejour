import { Star, MapPin, Users, Bed, Bath } from "lucide-react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";

interface PropertyCardProps {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms?: number;
  verified?: boolean;
}

function getRatingLabel(score: number): string {
  if (score >= 9) return "Exceptionnel";
  if (score >= 8) return "Très bien";
  if (score >= 7) return "Bien";
  if (score >= 6) return "Agréable";
  return "Note";
}

const PropertyCard = ({ id, image, title, location, price, rating, reviewCount, type, guests, bedrooms, bathrooms, verified }: PropertyCardProps) => {
  // Convert 5-star rating to 10-scale for Booking style
  const score10 = Math.min(10, rating * 2);

  return (
    <div
      className="group overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-200 flex flex-col w-full"
      style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
    >
      <Link to={`/property/${id}`} className="block">
        <div className="relative overflow-hidden" style={{ height: 210 }}>
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <FavoriteButton listingId={String(id)} className="absolute top-2.5 right-2.5" />
        </div>
      </Link>

      <div className="px-3 py-2 flex flex-col gap-0.5">
        <Link to={`/property/${id}`}>
          <h3 className="font-display font-bold text-primary text-sm leading-tight line-clamp-2 hover:underline">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
          <span className="text-[11px] text-muted-foreground line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-base font-bold text-foreground leading-none">
            {price.toLocaleString("fr-FR")} F <span className="text-[10px] font-normal text-muted-foreground">/ nuit</span>
          </p>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-tl-md rounded-tr-md rounded-br-md bg-primary text-primary-foreground text-xs font-bold">
            {score10.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
