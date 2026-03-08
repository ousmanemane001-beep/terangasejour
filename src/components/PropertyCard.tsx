import { Heart, Star, MapPin, Users, Bed, Bath } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
    >
      <Link to={`/property/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">{type}</span>
            {verified && (
              <span className="px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
                ✓ Vérifié
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-foreground text-base leading-tight line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground mb-3 text-xs">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{guests} voyag.</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{bedrooms} ch.</span>
          {bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{bathrooms} sdb</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">{price.toLocaleString("fr-FR")} F</span>
            <span className="text-sm text-muted-foreground"> / nuit</span>
          </div>
          <Link to={`/property/${id}`}>
            <Button size="sm" className="rounded-full text-xs bg-primary text-primary-foreground">Voir le logement</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
