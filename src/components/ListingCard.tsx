import { MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
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
        className="group overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-200 flex flex-col w-full"
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
      >
        <Link to={`/property/${listing.id}`} className="block">
          <div className="relative overflow-hidden" style={{ height: 240 }}>
            <img
              src={coverImage}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <FavoriteButton listingId={listing.id} className="absolute top-2.5 right-2.5" />
          </div>
        </Link>

        <div className="px-3 py-2 flex flex-col gap-0.5">
          <Link to={`/property/${listing.id}`}>
            <h3 className="font-display font-bold text-primary text-sm leading-tight line-clamp-2 hover:underline">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
            <span className="text-[11px] text-muted-foreground line-clamp-1">{listing.location || "Non précisé"}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-base font-bold text-foreground leading-none">
              {listing.price_per_night.toLocaleString("fr-FR")} F <span className="text-[10px] font-normal text-muted-foreground">/ nuit</span>
            </p>
            {rating && rating.avg !== null && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-tl-md rounded-tr-md rounded-br-md bg-primary text-primary-foreground text-xs font-bold">
                {(rating.avg * 2).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";

export default ListingCard;
