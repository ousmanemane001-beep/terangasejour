import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
import type { DBListing } from "@/hooks/useListings";
import type { ListingRating } from "@/hooks/useReviews";
import { forwardRef, useState } from "react";

interface ListingCardProps {
  listing: DBListing;
  rating?: ListingRating;
  distanceInfo?: { km: number; label: string } | null;
}

const ListingCard = forwardRef<HTMLDivElement, ListingCardProps>(
  ({ listing, rating, distanceInfo }, ref) => {
    const photos = listing.photos?.length ? listing.photos : ["/placeholder.svg"];
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const zone = listing.city || listing.location || "Sénégal";
    const hasMultiplePhotos = photos.length > 1;

    const prevPhoto = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentPhoto((p) => (p === 0 ? photos.length - 1 : p - 1));
    };
    const nextPhoto = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentPhoto((p) => (p === photos.length - 1 ? 0 : p + 1));
    };

    const showRating = rating && rating.avg !== null;

    return (
      <div ref={ref} className="group w-full">
        <Link to={`/property/${listing.id}`} className="block">
          <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
            <img
              src={photos[currentPhoto]}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <FavoriteButton listingId={listing.id} className="absolute top-3 right-3 z-10" />

            {hasMultiplePhotos && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-md"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-md"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {hasMultiplePhotos && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentPhoto ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        <Link to={`/property/${listing.id}`} className="block mt-2.5 px-0.5">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
              {zone}
            </h3>
            {showRating && (
              <span className="inline-flex items-center gap-1 text-foreground text-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-foreground" />
                {rating.avg!.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-[13px] line-clamp-1 mt-0.5">{listing.title}</p>
          <p className="text-foreground text-sm mt-1">
            <span className="font-semibold">{listing.price_per_night.toLocaleString("fr-FR")} F</span>
            {" "}
            <span className="font-normal text-muted-foreground">/ nuit</span>
          </p>
        </Link>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";

export default ListingCard;
