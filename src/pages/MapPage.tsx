import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExploreMap from "@/components/ExploreMap";
import { useListings } from "@/hooks/useListings";
import { Loader2, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Property } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AnimatePresence, motion } from "framer-motion";

const propertyTypes = ["Villa", "Appartement", "Maison d'hôtes", "Lodge", "Loft", "Studio"];

const MapPage = () => {
  const { data: listings, isLoading } = useListings();
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [bedroomFilter, setBedroomFilter] = useState(0);

  const toggleType = (type: string) =>
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);

  const clearFilters = () => {
    setPriceRange([0, 150000]);
    setSelectedTypes([]);
    setBedroomFilter(0);
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 150000,
    selectedTypes.length > 0,
    bedroomFilter > 0,
  ].filter(Boolean).length;

  // Convert DB listings to Property format for ExploreMap
  const properties = useMemo(() => {
    if (!listings) return [] as (Property & { dbId: string })[];
    return listings
      .filter((l) => l.latitude && l.longitude)
      .filter((l) => {
        if (l.price_per_night < priceRange[0] || l.price_per_night > priceRange[1]) return false;
        if (selectedTypes.length > 0 && !selectedTypes.map(t => t.toLowerCase()).includes(l.property_type.toLowerCase())) return false;
        if (bedroomFilter > 0 && l.bedrooms < bedroomFilter) return false;
        return true;
      })
      .map((l, i) => ({
        id: i,
        dbId: l.id,
        title: l.title,
        location: l.location || l.city || "",
        price: l.price_per_night,
        rating: 4.5,
        reviewCount: 0,
        image: l.photos?.[0] || "/placeholder.svg",
        type: l.property_type,
        bedrooms: l.bedrooms,
        guests: l.capacity,
        amenities: [] as string[],
        lat: l.latitude!,
        lng: l.longitude!,
      }));
  }, [listings, priceRange, selectedTypes, bedroomFilter]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      {/* Full-screen map container */}
      <div className="flex-1 relative">
        {/* Map */}
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ExploreMap properties={properties} hoveredProperty={hoveredProperty} />
        )}

        {/* Overlay: Listing count badge — top left */}
        <div className="absolute top-4 left-4 z-[500]">
          <div
            className="bg-card border border-border px-4 py-2 flex items-center gap-2"
            style={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {properties.length} logement{properties.length !== 1 ? "s" : ""} trouvé{properties.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Overlay: Filter button — top right */}
        <div className="absolute top-4 right-4 z-[500]">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 font-semibold"
            style={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrer
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Overlay: Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-16 right-4 z-[500] w-80 bg-card border border-border p-5"
              style={{ borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground text-base">Filtres</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Prix par nuit</h4>
                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={5000} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{priceRange[0].toLocaleString("fr-FR")} F</span>
                  <span>{priceRange[1].toLocaleString("fr-FR")} F</span>
                </div>
              </div>

              {/* Property types */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Type de logement</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Chambres min.</h4>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant={bedroomFilter === n ? "default" : "outline"}
                      size="sm"
                      className="rounded-full w-9 h-9 p-0"
                      onClick={() => setBedroomFilter(n)}
                    >
                      {n === 0 ? "∞" : n}
                    </Button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-1" onClick={clearFilters}>
                  <X className="w-3.5 h-3.5" /> Effacer les filtres
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapPage;
