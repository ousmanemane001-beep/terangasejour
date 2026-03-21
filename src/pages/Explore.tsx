import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useListingsRatings } from "@/hooks/useReviews";
import { Search, Navigation, ArrowUpDown } from "lucide-react";
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
import { haversineKm, formatDistance } from "@/lib/haversine";

const PROXIMITY_RADIUS_KM = 20;

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
  const [showMap, setShowMap] = useState(!!searchParams.get("lat"));
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "newest">("default");

  const destName = searchParams.get("destination") || "";
  const destLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
  const destLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
  const hasDestCoords = destLat !== undefined && destLng !== undefined && !isNaN(destLat) && !isNaN(destLng);

  const mapCenter = hasDestCoords ? { lat: destLat, lng: destLng } : undefined;

  const toggleType = (type: string) => setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  const toggleAmenity = (id: string) => setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  const clearFilters = () => { setPriceRange([0, 150000]); setBedroomFilter(0); setGuestFilter(0); setSelectedTypes([]); setSelectedAmenities([]); };

  const activeFilterCount = [priceRange[0] > 0 || priceRange[1] < 150000, bedroomFilter > 0, guestFilter > 0, selectedTypes.length > 0, selectedAmenities.length > 0].filter(Boolean).length;

  // Compute distances for DB listings when destination has coordinates
  const listingsWithDistance = useMemo(() => {
    if (!dbListings) return [];

    return dbListings.map((l) => {
      let distanceKm: number | null = null;
      if (hasDestCoords && l.latitude && l.longitude) {
        distanceKm = haversineKm(destLat, destLng, l.latitude, l.longitude);
      }
      return { listing: l, distanceKm };
    });
  }, [dbListings, destLat, destLng, hasDestCoords]);

  const filteredDBListings = useMemo(() => {
    let results = listingsWithDistance;

    // If destination has coordinates, filter by proximity radius
    if (hasDestCoords) {
      results = results.filter((item) => {
        // Include listings within radius OR without coordinates (text match fallback)
        if (item.distanceKm !== null) return item.distanceKm <= PROXIMITY_RADIUS_KM;
        // Fallback: text match for listings without coordinates
        return (item.listing.location || "").toLowerCase().includes(destination.toLowerCase()) ||
          item.listing.title.toLowerCase().includes(destination.toLowerCase());
      });
    } else if (destination) {
      // No coords: text-based filtering
      results = results.filter((item) =>
        (item.listing.location || "").toLowerCase().includes(destination.toLowerCase()) ||
        item.listing.title.toLowerCase().includes(destination.toLowerCase())
      );
    }

    // Apply other filters
    results = results.filter((item) => {
      const l = item.listing;
      if (l.price_per_night < priceRange[0] || l.price_per_night > priceRange[1]) return false;
      if (bedroomFilter > 0 && l.bedrooms < bedroomFilter) return false;
      if (guestFilter > 0 && l.capacity < guestFilter) return false;
      if (selectedTypes.length > 0 && !selectedTypes.map(t => t.toLowerCase()).includes(l.property_type.toLowerCase())) return false;
      return true;
    });

    // Sort by distance if available
    if (hasDestCoords) {
      results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sortBy === "price_asc") {
      results.sort((a, b) => a.listing.price_per_night - b.listing.price_per_night);
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => b.listing.price_per_night - a.listing.price_per_night);
    } else if (sortBy === "newest") {
      results.sort((a, b) => new Date(b.listing.created_at).getTime() - new Date(a.listing.created_at).getTime());
    }

    return results;
  }, [listingsWithDistance, destination, priceRange, bedroomFilter, guestFilter, selectedTypes, hasDestCoords, sortBy]);

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

  const totalResults = filteredProperties.length + filteredDBListings.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-background pt-10 pb-4 md:pt-14 md:pb-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {hasDestCoords && destName
              ? `Logements près de ${destName}`
              : "Explorer les logements"}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {hasDestCoords && destName
              ? `${filteredDBListings.length} logement${filteredDBListings.length !== 1 ? "s" : ""} dans un rayon de ${PROXIMITY_RADIUS_KM} km`
              : "Découvrez tous les logements disponibles au Sénégal."}
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

      {/* Sort + Main Content */}
      <div className="flex-1 flex">
        <div className={cn("flex-1 overflow-y-auto", showMap ? "lg:w-[55%]" : "w-full")}>
          <div className="container mx-auto px-4 py-4">
            {/* Sort controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{totalResults} résultat{totalResults !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="default">Pertinence</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="newest">Plus récents</option>
                </select>
              </div>
            </div>
            {filteredDBListings.length > 0 && (
              <DBListingsWithRatings
                items={filteredDBListings}
                showMap={showMap}
                destName={destName}
                hasDestCoords={hasDestCoords}
              />
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
                <p className="text-sm text-muted-foreground mb-4">Essayez de modifier vos filtres ou d'élargir votre recherche.</p>
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>Effacer les filtres</Button>
              </div>
            )}
          </div>
        </div>
        {showMap && (
          <div className="hidden lg:block lg:w-[45%] sticky top-16 h-[calc(100vh-4rem)]">
            <ExploreMap properties={filteredProperties} hoveredProperty={hoveredProperty} center={mapCenter} />
          </div>
        )}
      </div>

      <HostCTA />
      <Footer />
    </div>
  );
};

/* Sub-component to batch-fetch ratings for DB listings */
interface ListingWithDistance {
  listing: DBListing;
  distanceKm: number | null;
}

function DBListingsWithRatings({
  items,
  showMap,
  destName,
  hasDestCoords,
}: {
  items: ListingWithDistance[];
  showMap: boolean;
  destName: string;
  hasDestCoords: boolean;
}) {
  const { data: ratingsMap } = useListingsRatings(items.map((i) => i.listing.id));
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-foreground mb-4">
        {items.length} logement{items.length !== 1 ? "s" : ""} publié{items.length !== 1 ? "s" : ""}
      </p>
      <div className={cn("grid gap-5", showMap ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
        {items.map((item) => (
          <ListingCard
            key={item.listing.id}
            listing={item.listing}
            rating={ratingsMap?.[item.listing.id]}
            distanceInfo={
              hasDestCoords && item.distanceKm !== null
                ? {
                    km: item.distanceKm,
                    label: `À ${formatDistance(item.distanceKm)} de ${destName}`,
                  }
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Explore;
