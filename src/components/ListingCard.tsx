import { Heart, MapPin, Users, Bed, Bath } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { DBListing } from "@/hooks/useListings";

const ListingCard = ({ listing }: { listing: DBListing }) => {
  const coverImage = listing.photos?.[0] || "/placeholder.svg";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
    >
      <Link to={`/property/${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={coverImage} alt={listing.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground capitalize">{listing.property_type}</span>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-base leading-tight line-clamp-1 mb-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm line-clamp-1">{listing.location || "Non précisé"}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground mb-3 text-xs">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{listing.capacity} voyag.</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{listing.bedrooms} ch.</span>
          <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.bathrooms} sdb</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">{listing.price_per_night.toLocaleString("fr-FR")} F</span>
            <span className="text-sm text-muted-foreground"> / nuit</span>
          </div>
          <Link to={`/property/${listing.id}`}>
            <Button size="sm" className="rounded-full text-xs bg-primary text-primary-foreground">Voir le logement</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
