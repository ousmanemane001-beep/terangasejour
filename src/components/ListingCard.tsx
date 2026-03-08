import { Heart, MapPin, Users, Bed, Bath, Star, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { DBListing } from "@/hooks/useListings";
import type { ListingRating } from "@/hooks/useReviews";
import { forwardRef } from "react";

function getRatingLabel(avg: number): string {
  if (avg >= 9) return "Exceptionnel";
  if (avg >= 8) return "Très bien";
  if (avg >= 7) return "Bien";
  if (avg >= 6) return "Agréable";
  return "Note";
}

const ListingCard = forwardRef<HTMLDivElement, { listing: DBListing; rating?: ListingRating }>(
  ({ listing, rating }, ref) => {
    const coverImage = listing.photos?.[0] || "/placeholder.svg";

    return (
      <div
        ref={ref}
        className="group rounded-lg overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
      >
        <Link to={`/property/${listing.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={coverImage}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <button
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background hover:scale-110 transition-all duration-200"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4 text-foreground" />
            </button>
            {listing.verified && (
              <div className="absolute top-2.5 left-2.5">
                <VerifiedBadge className="bg-background/90 backdrop-blur-sm" />
              </div>
            )}
          </div>
        </Link>

        <div className="p-3 flex flex-col flex-1">
          {/* Title + Rating row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link to={`/property/${listing.id}`} className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-primary text-[15px] leading-snug line-clamp-2 hover:underline">
                {listing.title}
              </h3>
            </Link>
            {rating && rating.avg !== null && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-foreground leading-tight">{getRatingLabel(rating.avg * 2)}</p>
                  <p className="text-[10px] text-muted-foreground">{rating.count} avis</p>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-tl-lg rounded-tr-lg rounded-br-lg bg-primary text-primary-foreground text-sm font-bold">
                  {(rating.avg * 2).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
            <span className="text-xs text-primary/80 hover:underline line-clamp-1">{listing.location || "Non précisé"}</span>
          </div>

          {/* Property type badge */}
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded border border-border text-[11px] font-medium text-foreground capitalize">
              {listing.property_type}
            </span>
          </div>

          {/* Amenities row */}
          <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{listing.capacity} pers.</span>
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{listing.bedrooms} ch.</span>
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{listing.bathrooms} sdb</span>
          </div>

          {/* Price section — Booking style */}
          <div className="mt-auto pt-2 border-t border-border/60 text-right">
            <p className="text-[11px] text-muted-foreground">Par nuit</p>
            <p className="text-lg font-bold text-foreground leading-tight">
              {listing.price_per_night.toLocaleString("fr-FR")} F <span className="text-xs font-normal text-muted-foreground">CFA</span>
            </p>
          </div>

          {/* CTA */}
          <Link
            to={`/property/${listing.id}`}
            className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Voir les disponibilités
          </Link>
        </div>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";

export default ListingCard;
