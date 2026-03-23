import ListingCardSkeleton from "./ListingCardSkeleton";

interface ExploreGridSkeletonProps {
  count?: number;
  columns?: string;
}

const ExploreGridSkeleton = ({ count = 8, columns }: ExploreGridSkeletonProps) => (
  <div className={columns || "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5"}>
    {Array.from({ length: count }).map((_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </div>
);

export default ExploreGridSkeleton;
