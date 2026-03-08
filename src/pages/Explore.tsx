import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useListingsRatings } from "@/hooks/useReviews";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import ListingCard from "@/components/ListingCard";
import ExploreMap from "@/components/ExploreMap";
import { properties, Property } from "@/data/properties";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search, MapPin, CalendarIcon, Users, SlidersHorizontal, X,
  Wifi, Car, Waves, Wind, UtensilsCrossed, Tv, Lock, Flower2,
  Map as MapIcon, LayoutGrid
} from "lucide-react";

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

const Explore = () => {
  const [searchParams] = useSearchParams();
  const { data: dbListings } = useListings();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : undefined
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : undefined
  );
  const [guestCount, setGuestCount] = useState(Number(searchParams.get("guests")) || 1);

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [guestFilter, setGuestFilter] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(true);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5 flex-1 min-w-[180px]">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <Input placeholder="Où allez-vous ?" value={destination} onChange={(e) => setDestination(e.target.value)}
                className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {checkIn ? format(checkIn, "d MMM", { locale: fr }) : "Arrivée"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {checkOut ? format(checkOut, "d MMM", { locale: fr }) : "Départ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date < (checkIn || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                  <Users className="w-4 h-4 text-primary" />
                  {guestCount} voyageur{guestCount > 1 ? "s" : ""}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-4" align="start">
                <p className="text-sm font-medium text-foreground mb-3">Voyageurs</p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</Button>
                  <span className="font-medium text-foreground">{guestCount}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button className="rounded-full bg-primary text-primary-foreground gap-2 px-6">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Rechercher</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Button variant={showFilters ? "default" : "outline"} size="sm" className="rounded-full gap-1.5 shrink-0" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtres
            {activeFilterCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{activeFilterCount}</Badge>}
          </Button>
          {propertyTypes.map((type) => (
            <Button key={type} variant={selectedTypes.includes(type) ? "default" : "outline"} size="sm" className="rounded-full shrink-0 text-xs" onClick={() => toggleType(type)}>{type}</Button>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Button variant={showMap ? "default" : "outline"} size="sm" className="rounded-full gap-1.5" onClick={() => setShowMap(!showMap)}>
              {showMap ? <LayoutGrid className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
              {showMap ? "Grille" : "Carte"}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-secondary">
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
                      <Button key={n} variant={bedroomFilter === n ? "default" : "outline"} size="sm" className="rounded-full w-9 h-9 p-0" onClick={() => setBedroomFilter(n)}>{n === 0 ? "∞" : n}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Voyageurs min.</h4>
                  <div className="flex gap-2">
                    {[0, 2, 4, 6, 8, 10].map((n) => (
                      <Button key={n} variant={guestFilter === n ? "default" : "outline"} size="sm" className="rounded-full w-9 h-9 p-0" onClick={() => setGuestFilter(n)}>{n === 0 ? "∞" : n}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Équipements</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity.id}
                        className={cn("flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors",
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={clearFilters}><X className="w-3.5 h-3.5" />Effacer les filtres</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className={cn("flex-1 overflow-y-auto", showMap ? "lg:w-[55%]" : "w-full")}>
          <div className="p-4">
            {filteredDBListings.length > 0 && (
              <DBListingsWithRatings listings={filteredDBListings} showMap={showMap} />
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{filteredProperties.length}</span> logement{filteredProperties.length !== 1 ? "s" : ""} populaire{filteredProperties.length !== 1 ? "s" : ""}
            </p>
            <div className={cn("grid gap-5", showMap ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
              {filteredProperties.map((property) => (
                <div key={property.id} onMouseEnter={() => setHoveredProperty(property.id)} onMouseLeave={() => setHoveredProperty(null)}>
                  <PropertyCard {...property} />
                </div>
              ))}
            </div>
            {filteredProperties.length === 0 && filteredDBListings.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Aucun logement disponible</h3>
                <p className="text-sm text-muted-foreground mb-4">Essayez de modifier vos filtres ou votre recherche.</p>
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>Effacer les filtres</Button>
              </div>
            )}
          </div>
        </div>
        {showMap && (
          <div className="hidden lg:block lg:w-[45%] sticky top-[8.5rem] h-[calc(100vh-8.5rem)]">
            <ExploreMap properties={filteredProperties} hoveredProperty={hoveredProperty} />
          </div>
        )}
      </div>
      {!showMap && <Footer />}
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
