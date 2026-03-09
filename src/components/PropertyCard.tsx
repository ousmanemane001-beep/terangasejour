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
    <div className="group rounded-lg overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <Link to={`/property/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <FavoriteButton listingId={String(id)} className="absolute top-2.5 right-2.5" />
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {/* Title + Rating row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link to={`/property/${id}`} className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-primary text-sm leading-snug line-clamp-2 hover:underline">
              {title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">{getRatingLabel(score10)}</p>
              <p className="text-[10px] text-muted-foreground">{reviewCount} avis</p>
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-tl-lg rounded-tr-lg rounded-br-lg bg-primary text-primary-foreground text-sm font-bold">
              {score10.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
          <span className="text-xs text-primary/80 line-clamp-1">{location}</span>
        </div>

        {/* Type badge */}
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 rounded border border-border text-[11px] font-medium text-foreground">{type}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{guests} pers.</span>
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{bedrooms} ch.</span>
          {bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{bathrooms} sdb</span>}
        </div>

        {/* Price — Booking style */}
        <div className="mt-auto pt-2 border-t border-border/60 text-right">
          <p className="text-[11px] text-muted-foreground">Par nuit</p>
          <p className="text-lg font-bold text-foreground leading-tight">
            {price.toLocaleString("fr-FR")} F <span className="text-xs font-normal text-muted-foreground">CFA</span>
          </p>
        </div>

        {/* CTA */}
        <Link
          to={`/property/${id}`}
          className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Voir les disponibilités
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
