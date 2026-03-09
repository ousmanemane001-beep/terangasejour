import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useListingsRatings } from "@/hooks/useReviews";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import ListingCard from "@/components/ListingCard";
import ExploreMap from "@/components/ExploreMap";
import ExploreFilters from "@/components/explore/ExploreFilters";
import HostCTA from "@/components/explore/HostCTA";
import { properties } from "@/data/properties";
import { useListings, type DBListing } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const { data: dbListings } = useListings();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [guestFilter, setGuestFilter] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);

  const toggleType = (type: string) => setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  const toggleAmenity = (id: string) => setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  const clearFilters = () => { setPriceRange([0, 150000]); setBedroomFilter(0); setGuestFilter(0); setSelectedTypes([]); setSelectedAmenities([]); };

  const activeFilterCount = [priceRange[0] > 0 || priceRange[1] < 150000, bedroomFilter > 0, guestFilter > 0, selectedTypes.length > 0, selectedAmenities.length > 0].filter(Boolean).length;

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (destination && !p.location.toLowerCase().includes(destination.toLowerCase()) && !p.title.toLowerCase().includes(destination.toLowerCase())) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (bedroomFilter > 0 && p.bedrooms < bedroomFilter) return false;
      if (guestFilter > 0 && p.guests < guestFilter) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => p.amenities.includes(a))) return false;
      return true;
    });
  }, [destination, priceRange, bedroomFilter, guestFilter, selectedTypes, selectedAmenities]);

  const filteredDBListings = useMemo(() => {
    if (!dbListings) return [];
    return dbListings.filter((l) => {
      if (destination && !(l.location || "").toLowerCase().includes(destination.toLowerCase()) && !l.title.toLowerCase().includes(destination.toLowerCase())) return false;
      if (l.price_per_night < priceRange[0] || l.price_per_night > priceRange[1]) return false;
      if (bedroomFilter > 0 && l.bedrooms < bedroomFilter) return false;
      if (guestFilter > 0 && l.capacity < guestFilter) return false;
      if (selectedTypes.length > 0 && !selectedTypes.map(t => t.toLowerCase()).includes(l.property_type.toLowerCase())) return false;
      return true;
    });
  }, [dbListings, destination, priceRange, bedroomFilter, guestFilter, selectedTypes]);

  const totalResults = filteredProperties.length + filteredDBListings.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Simple header */}
      <section className="bg-background pt-10 pb-4 md:pt-14 md:pb-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Explorer les logements
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Découvrez tous les logements disponibles au Sénégal.
          </p>
        </div>
      </section>

      {/* Filters */}
      <ExploreFilters
        showFilters={showFilters} setShowFilters={setShowFilters}
        showMap={showMap} setShowMap={setShowMap}
        priceRange={priceRange} setPriceRange={setPriceRange}
        bedroomFilter={bedroomFilter} setBedroomFilter={setBedroomFilter}
        guestFilter={guestFilter} setGuestFilter={setGuestFilter}
        selectedTypes={selectedTypes} toggleType={toggleType}
        selectedAmenities={selectedAmenities} toggleAmenity={toggleAmenity}
        clearFilters={clearFilters} activeFilterCount={activeFilterCount}
        totalResults={totalResults}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className={cn("flex-1 overflow-y-auto", showMap ? "lg:w-[55%]" : "w-full")}>
          <div className="container mx-auto px-4 py-4">
            {filteredDBListings.length > 0 && (
              <DBListingsWithRatings listings={filteredDBListings} showMap={showMap} />
            )}
            <div className={cn(
              "grid gap-5",
              showMap
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}>
              {filteredProperties.map((property) => (
                <div key={property.id} onMouseEnter={() => setHoveredProperty(property.id)} onMouseLeave={() => setHoveredProperty(null)}>
                  <PropertyCard {...property} />
                </div>
              ))}
            </div>
            {totalResults === 0 && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Aucun logement disponible</h3>
                <p className="text-sm text-muted-foreground mb-4">Essayez de modifier vos filtres.</p>
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>Effacer les filtres</Button>
              </div>
            )}
          </div>
        </div>
        {showMap && (
          <div className="hidden lg:block lg:w-[45%] sticky top-16 h-[calc(100vh-4rem)]">
            <ExploreMap properties={filteredProperties} hoveredProperty={hoveredProperty} />
          </div>
        )}
      </div>

      <HostCTA />
      <Footer />
    </div>
  );
};

/* Sub-component to batch-fetch ratings for DB listings */
function DBListingsWithRatings({ listings, showMap }: { listings: DBListing[]; showMap: boolean }) {
  const { data: ratingsMap } = useListingsRatings(listings.map((l) => l.id));
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-foreground mb-4">{listings.length} logement{listings.length !== 1 ? "s" : ""} publié{listings.length !== 1 ? "s" : ""}</p>
      <div className={cn("grid gap-5", showMap ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} rating={ratingsMap?.[listing.id]} />)}
      </div>
    </div>
  );
}

export default Explore;
