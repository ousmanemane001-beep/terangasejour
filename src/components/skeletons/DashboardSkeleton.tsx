import Navbar from "@/components/Navbar";
import ShimmerBlock from "./ShimmerBlock";

const DashboardSkeleton = () => (
  <div className="min-h-screen flex flex-col animate-fade-in">
    <Navbar />
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ShimmerBlock className="w-14 h-14 rounded-full" />
        <div className="space-y-2">
          <ShimmerBlock className="h-5 w-40 rounded-lg" />
          <ShimmerBlock className="h-3 w-24 rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map(i => (
          <ShimmerBlock key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <ShimmerBlock className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <ShimmerBlock className="h-4 w-3/4 rounded-lg" />
                <ShimmerBlock className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
            <ShimmerBlock className="h-3 w-full rounded-lg" />
            <ShimmerBlock className="h-3 w-2/3 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
