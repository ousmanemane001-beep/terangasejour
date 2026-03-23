import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShimmerBlock from "./ShimmerBlock";

const PropertyDetailSkeleton = () => (
  <div className="min-h-screen flex flex-col animate-fade-in">
    <Navbar />
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 space-y-6">
      {/* Gallery */}
      <ShimmerBlock className="w-full aspect-[16/9] md:aspect-[2.2/1] rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left */}
        <div className="md:col-span-2 space-y-4">
          <ShimmerBlock className="h-8 w-3/4 rounded-lg" />
          <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
          <div className="space-y-2 pt-4">
            <ShimmerBlock className="h-3 w-full rounded-lg" />
            <ShimmerBlock className="h-3 w-full rounded-lg" />
            <ShimmerBlock className="h-3 w-2/3 rounded-lg" />
          </div>
          <div className="flex gap-3 pt-4">
            {[1, 2, 3, 4].map(i => (
              <ShimmerBlock key={i} className="h-10 w-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right - Booking card */}
        <div className="space-y-4">
          <div className="border border-border rounded-2xl p-5 space-y-4">
            <ShimmerBlock className="h-6 w-1/2 rounded-lg" />
            <ShimmerBlock className="h-12 w-full rounded-xl" />
            <ShimmerBlock className="h-12 w-full rounded-xl" />
            <ShimmerBlock className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default PropertyDetailSkeleton;
