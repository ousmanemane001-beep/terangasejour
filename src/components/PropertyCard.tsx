import { Heart, Star, MapPin } from "lucide-react";
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
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  rating,
  reviewCount,
  type,
}: PropertyCardProps) => {
  return (
    <Link to={`/property/${id}`}>
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
          <Heart className="w-4 h-4 text-foreground" />
        </button>
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
          {type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-foreground text-base leading-tight line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm">{location}</span>
        </div>
        <div>
          <span className="text-lg font-bold text-foreground">
            {price.toLocaleString("fr-FR")} F
          </span>
          <span className="text-sm text-muted-foreground"> / nuit</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
