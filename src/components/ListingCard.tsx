import { Heart, MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { DBListing } from "@/hooks/useListings";
import type { ListingRating } from "@/hooks/useReviews";
import { forwardRef } from "react";

const ListingCard = forwardRef<HTMLDivElement, { listing: DBListing; rating?: ListingRating }>(
  ({ listing, rating }, ref) => {
    const coverImage = listing.photos?.[0] || "/placeholder.svg";

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group rounded-2xl overflow-hidden bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
      >
        <Link to={`/property/${listing.id}`}>
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={coverImage}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Gradient overlay for better text readability at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background hover:scale-110 transition-all duration-200"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4 text-foreground" />
            </button>
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground capitalize">
                {listing.property_type}
              </span>
              {listing.verified && <VerifiedBadge className="bg-background/80 backdrop-blur-sm" />}
            </div>
            {/* Price overlay on image */}
            <div className="absolute bottom-3 right-3">
              <span className="px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-bold text-foreground shadow-sm">
                {listing.price_per_night.toLocaleString("fr-FR")} F<span className="font-normal text-muted-foreground text-xs"> /nuit</span>
              </span>
            </div>
          </div>
        </Link>
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground text-[15px] leading-snug line-clamp-1 flex-1">
              {listing.title}
            </h3>
            {rating && rating.avg !== null && (
              <div className="flex items-center gap-1 shrink-0 bg-primary/5 px-2 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span className="text-sm font-semibold text-foreground">{rating.avg}</span>
                <span className="text-[10px] text-muted-foreground">({rating.count})</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-sm line-clamp-1">{listing.location || "Non précisé"}</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-xs pt-1 border-t border-border/50">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{listing.capacity}</span>
            <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5" />{listing.bedrooms} ch.</span>
            <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5" />{listing.bathrooms} sdb</span>
          </div>
        </div>
      </motion.div>
    );
  }
);

ListingCard.displayName = "ListingCard";

export default ListingCard;
