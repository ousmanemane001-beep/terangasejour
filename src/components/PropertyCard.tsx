import { Heart, Star, MapPin, Users, Bed, Bath } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

const PropertyCard = ({ id, image, title, location, price, rating, reviewCount, type, guests, bedrooms, bathrooms, verified }: PropertyCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-lg overflow-hidden bg-card border border-border hover:shadow-[var(--shadow-card-hover)] transition-shadow flex flex-col h-full"
    >
      <Link to={`/property/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-background/90 text-xs font-medium text-foreground">{type}</span>
            {verified && (
              <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-medium">Vérifié</span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-1 mb-1">{title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground mb-2 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-xs truncate">{location}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{guests}</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{bedrooms}</span>
          {bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{bathrooms}</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <div className="min-w-0">
            <span className="text-sm font-bold text-foreground">{price.toLocaleString("fr-FR")} F</span>
            <span className="text-xs text-muted-foreground"> /nuit</span>
          </div>
          <div className="flex items-center gap-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
            <Star className="w-3 h-3" />
            {rating}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
