import { MapPin, Star, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
import type { DBListing } from "@/hooks/useListings";
import type { ListingRating } from "@/hooks/useReviews";
import { forwardRef } from "react";

interface ListingCardProps {
  listing: DBListing;
  rating?: ListingRating;
  distanceInfo?: { km: number; label: string } | null;
}

const ListingCard = forwardRef<HTMLDivElement, ListingCardProps>(
  ({ listing, rating, distanceInfo }, ref) => {
    const coverImage = listing.photos?.[0] || "/placeholder.svg";
    const zone = listing.city || listing.location || "Sénégal";

    return (
      <div ref={ref} className="group w-full">
        <Link to={`/property/${listing.id}`} className="block">
          {/* Image — square on mobile, 3:2 on desktop */}
          <div className="relative overflow-hidden rounded-2xl aspect-square md:aspect-[3/2]">
            <img
              src={coverImage}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <FavoriteButton listingId={listing.id} className="absolute top-2 right-2" />
            {distanceInfo && (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[11px] font-semibold backdrop-blur-sm">
                <Navigation className="w-3 h-3" />
                {distanceInfo.label}
              </span>
            )}
          </div>
        </Link>

        {/* Info — compact Airbnb style */}
        <div className="mt-2 px-0.5">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-foreground text-[13px] md:text-sm leading-tight line-clamp-1">
              {listing.property_type} · {zone}
            </h3>
            {rating && rating.avg !== null && (
              <span className="inline-flex items-center gap-0.5 text-foreground text-[12px] font-medium shrink-0">
                <Star className="w-3 h-3 fill-foreground" />
                {(rating.avg * 2).toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-[12px] line-clamp-1 mt-0.5">{listing.title}</p>
          <p className="text-foreground text-[13px] font-semibold mt-1">
            {listing.price_per_night.toLocaleString("fr-FR")} F{" "}
            <span className="font-normal text-muted-foreground">/ nuit</span>
          </p>
        </div>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";

export default ListingCard;
