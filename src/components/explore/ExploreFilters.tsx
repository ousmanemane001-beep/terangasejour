import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal, X, Wifi, Car, Waves, Wind,
  UtensilsCrossed, Tv, Lock, Flower2, Map as MapIcon, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const propertyTypes = ["Villa", "Appartement", "Maison d'hôtes", "Lodge", "Loft", "Studio"];

const amenityOptions = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "pool", label: "Piscine", icon: Waves },
  { id: "ac", label: "Climatisation", icon: Wind },
  { id: "kitchen", label: "Cuisine", icon: UtensilsCrossed },
  { id: "tv", label: "Télévision", icon: Tv },
  { id: "security", label: "Sécurité", icon: Lock },
  { id: "garden", label: "Jardin", icon: Flower2 },
];

interface ExploreFiltersProps {
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  showMap: boolean;
  setShowMap: (v: boolean) => void;
  priceRange: number[];
  setPriceRange: (v: number[]) => void;
  bedroomFilter: number;
  setBedroomFilter: (v: number) => void;
  guestFilter: number;
  setGuestFilter: (v: number) => void;
  selectedTypes: string[];
  toggleType: (type: string) => void;
  selectedAmenities: string[];
  toggleAmenity: (id: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

const ExploreFilters = ({
  showFilters, setShowFilters,
  showMap, setShowMap,
  priceRange, setPriceRange,
  bedroomFilter, setBedroomFilter,
  guestFilter, setGuestFilter,
  selectedTypes, toggleType,
  selectedAmenities, toggleAmenity,
  clearFilters, activeFilterCount,
}: ExploreFiltersProps) => {
  return (
    <>
      {/* Filters Bar */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5 shrink-0 font-semibold"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrer
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {propertyTypes.map((type) => (
            <Button
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              size="sm"
              className="rounded-full shrink-0 text-xs"
              onClick={() => toggleType(type)}
            >
              {type}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5 font-semibold"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? <LayoutGrid className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
              {showMap ? "Grille" : "Carte"}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-secondary"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Prix par nuit</h4>
                  <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={5000} className="mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{priceRange[0].toLocaleString("fr-FR")} F</span>
                    <span>{priceRange[1].toLocaleString("fr-FR")} F</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Chambres min.</h4>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <Button key={n} variant={bedroomFilter === n ? "default" : "outline"} size="sm" className="rounded-full w-9 h-9 p-0" onClick={() => setBedroomFilter(n)}>
                        {n === 0 ? "∞" : n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Voyageurs min.</h4>
                  <div className="flex gap-2">
                    {[0, 2, 4, 6, 8, 10].map((n) => (
                      <Button key={n} variant={guestFilter === n ? "default" : "outline"} size="sm" className="rounded-full w-9 h-9 p-0" onClick={() => setGuestFilter(n)}>
                        {n === 0 ? "∞" : n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Équipements</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {amenityOptions.map((amenity) => (
                      <label
                        key={amenity.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors",
                          selectedAmenities.includes(amenity.id) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                        )}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <amenity.icon className="w-3.5 h-3.5" />{amenity.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={clearFilters}>
                    <X className="w-3.5 h-3.5" />Effacer les filtres
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExploreFilters;
