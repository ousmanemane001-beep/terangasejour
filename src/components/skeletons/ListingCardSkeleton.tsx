import ShimmerBlock from "./ShimmerBlock";

const ListingCardSkeleton = () => (
  <div className="w-full animate-fade-in">
    <ShimmerBlock className="aspect-[4/3] rounded-2xl" />
    <div className="mt-2.5 px-0.5 space-y-2">
      <div className="flex justify-between">
        <ShimmerBlock className="h-4 w-3/4 rounded-lg" />
        <ShimmerBlock className="h-4 w-8 rounded-lg" />
      </div>
      <ShimmerBlock className="h-3 w-1/2 rounded-lg" />
      <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
    </div>
  </div>
);

export default ListingCardSkeleton;
