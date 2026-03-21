import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { useListings } from "@/hooks/useListings";
import { useDestinations, type DbDestination } from "@/hooks/useDestinations";
import { haversineKm, formatDistance } from "@/lib/haversine";
import { Loader2, SlidersHorizontal, X, MapPin, Compass, BedDouble, Users, Layers, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

const propertyTypes = ["Villa", "Appartement", "Maison d'hôtes", "Lodge", "Loft", "Studio"];

const CATEGORY_EMOJI: Record<string, string> = {
  plage: "🏖️", ville: "🏙️", parc_naturel: "🌳", site_historique: "🏛️",
  lac: "💧", ile: "🏝️", aeroport: "✈️", restaurant: "🍽️", hotel: "🏨",
};

const CATEGORY_COLOR: Record<string, string> = {
  plage: "#3b82f6", ville: "#f59e0b", parc_naturel: "#22c55e", site_historique: "#a855f7",
  lac: "#06b6d4", ile: "#14b8a6", aeroport: "#6b7280", restaurant: "#f97316", hotel: "#6366f1",
};

const PROXIMITY_KM = 20;

const ExploreSenegal = () => {
  const navigate = useNavigate();
  const { data: listings, isLoading: loadingListings } = useListings();
  const { data: destinations, isLoading: loadingDest } = useDestinations();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [showDestinations, setShowDestinations] = useState(true);
  const [showListings, setShowListings] = useState(true);
  const [selectedDest, setSelectedDest] = useState<DbDestination | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const listingMarkersRef = useRef<L.LayerGroup | null>(null);
  const destMarkersRef = useRef<L.LayerGroup | null>(null);

  const isLoading = loadingListings || loadingDest;

  const toggleType = (type: string) =>
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

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

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    return listings.filter(l => {
      if (!l.latitude || !l.longitude) return false;
      if (l.price_per_night < priceRange[0] || l.price_per_night > priceRange[1]) return false;
      if (selectedTypes.length > 0 && !selectedTypes.map(t => t.toLowerCase()).includes(l.property_type.toLowerCase())) return false;
      if (bedroomFilter > 0 && l.bedrooms < bedroomFilter) return false;
      return true;
    });
  }, [listings, priceRange, selectedTypes, bedroomFilter]);

  const nearbyListings = useMemo(() => {
    if (!selectedDest || !selectedDest.latitude || !selectedDest.longitude || !filteredListings) return [];
    return filteredListings
      .map(l => ({
        listing: l,
        distance: haversineKm(selectedDest.latitude!, selectedDest.longitude!, l.latitude!, l.longitude!),
      }))
      .filter(item => item.distance <= PROXIMITY_KM)
      .sort((a, b) => a.distance - b.distance);
  }, [selectedDest, filteredListings]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [14.6928, -17.4467],
      zoom: 7,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    listingMarkersRef.current = L.layerGroup().addTo(map);
    destMarkersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update listing markers
  useEffect(() => {
    const group = listingMarkersRef.current;
    if (!group || !showListings) { group?.clearLayers(); return; }
    group.clearLayers();

    filteredListings.forEach(l => {
      const icon = L.divIcon({
        className: "custom-price-marker",
        html: `<div style="
          background: white; color: hsl(220, 26%, 14%);
          padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1.5px solid hsl(220, 13%, 91%);
          cursor: pointer;
        ">${(l.price_per_night / 1000).toFixed(0)}K F</div>`,
        iconSize: [0, 0],
        iconAnchor: [30, 15],
      });

      const marker = L.marker([l.latitude!, l.longitude!], { icon }).addTo(group);
      const photo = l.photos?.[0] || "/placeholder.svg";
      marker.bindPopup(`
        <a href="/property/${l.id}" style="display:block;width:230px;text-decoration:none;color:inherit;">
          <img src="${photo}" alt="${l.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${l.title}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">📍 ${l.city || l.location || ""}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;font-size:13px;">${l.price_per_night.toLocaleString("fr-FR")} F/nuit</span>
            <span style="font-size:11px;">🛏️ ${l.bedrooms} • 👥 ${l.capacity}</span>
          </div>
          <div style="margin-top:8px;text-align:center;background:hsl(220, 26%, 14%);color:white;padding:6px;border-radius:6px;font-size:12px;font-weight:600;">
            Voir le logement
          </div>
        </a>
      `, { closeButton: true, maxWidth: 250 });
    });
  }, [filteredListings, showListings]);

  // Update destination markers
  useEffect(() => {
    const group = destMarkersRef.current;
    const map = mapInstanceRef.current;
    if (!group || !map || !showDestinations) { group?.clearLayers(); return; }
    group.clearLayers();

    (destinations || []).forEach(d => {
      if (!d.latitude || !d.longitude) return;
      const emoji = CATEGORY_EMOJI[d.category] || "📍";
      const color = CATEGORY_COLOR[d.category] || "#6b7280";

      const icon = L.divIcon({
        className: "custom-dest-marker",
        html: `<div style="
          background: ${color}; color: white;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white; cursor: pointer;
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([d.latitude, d.longitude], { icon }).addTo(group);

      marker.on("click", () => {
        setSelectedDest(d);
        map.flyTo([d.latitude!, d.longitude!], 11, { duration: 1 });
      });

      const activities: Record<string, string> = {
        plage: "Baignade, sports nautiques, détente",
        ville: "Marché, artisanat, gastronomie",
        parc_naturel: "Safari, randonnée, observation",
        site_historique: "Visite guidée, musée, culture",
        lac: "Pirogue, pêche, observation d'oiseaux",
        ile: "Excursion en bateau, plongée",
      };

      marker.bindPopup(`
        <div style="width:220px;">
          <div style="font-size:24px;text-align:center;margin-bottom:4px;">${emoji}</div>
          <div style="font-weight:700;font-size:14px;text-align:center;margin-bottom:4px;">${d.name}</div>
          ${d.region ? `<div style="font-size:11px;color:#6b7280;text-align:center;margin-bottom:6px;">📍 ${d.region}</div>` : ""}
          ${d.description ? `<div style="font-size:11px;color:#374151;margin-bottom:6px;">${d.description}</div>` : ""}
          <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
            <strong>Activités :</strong> ${activities[d.category] || "Découverte, exploration"}
          </div>
          <a href="/explore?destination=${encodeURIComponent(d.name)}&lat=${d.latitude}&lng=${d.longitude}" 
             style="display:block;text-align:center;background:hsl(220, 26%, 14%);color:white;padding:6px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
            Voir les logements proches
          </a>
        </div>
      `, { closeButton: true, maxWidth: 240 });
    });
  }, [destinations, showDestinations]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}

        {/* Top left: counts */}
        <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
          <div className="bg-card border border-border px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {filteredListings.length} logement{filteredListings.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="bg-card border border-border px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {destinations?.length || 0} destination{(destinations?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Top right: filters + layers */}
        <div className="absolute top-4 right-4 z-[500] flex gap-2">
          <Button
            variant={showListings ? "default" : "outline"}
            size="sm"
            className="rounded-lg shadow-md gap-1.5"
            onClick={() => setShowListings(!showListings)}
          >
            <BedDouble className="w-4 h-4" /> Logements
          </Button>
          <Button
            variant={showDestinations ? "default" : "outline"}
            size="sm"
            className="rounded-lg shadow-md gap-1.5"
            onClick={() => setShowDestinations(!showDestinations)}
          >
            <Compass className="w-4 h-4" /> Destinations
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 font-semibold rounded-lg shadow-md"
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

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-16 right-4 z-[500] w-80 bg-card border border-border p-5 rounded-xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground text-base">Filtres</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Prix par nuit</h4>
                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={5000} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{priceRange[0].toLocaleString("fr-FR")} F</span>
                  <span>{priceRange[1].toLocaleString("fr-FR")} F</span>
                </div>
              </div>
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Type de logement</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(type => (
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
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Chambres min.</h4>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(n => (
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

        {/* Selected destination panel */}
        <AnimatePresence>
          {selectedDest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 z-[500] bg-card border border-border rounded-xl shadow-xl p-4 max-w-lg mx-auto"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                    {CATEGORY_EMOJI[selectedDest.category] || "📍"} {selectedDest.name}
                  </h3>
                  {selectedDest.region && (
                    <p className="text-xs text-muted-foreground mt-0.5">📍 {selectedDest.region}</p>
                  )}
                </div>
                <button onClick={() => setSelectedDest(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedDest.description && (
                <p className="text-sm text-muted-foreground mb-3">{selectedDest.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  🏠 {nearbyListings.length} logement{nearbyListings.length !== 1 ? "s" : ""} dans un rayon de {PROXIMITY_KM} km
                </span>
                <Link
                  to={`/explore?destination=${encodeURIComponent(selectedDest.name)}&lat=${selectedDest.latitude}&lng=${selectedDest.longitude}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Voir tous →
                </Link>
              </div>
              {nearbyListings.length > 0 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {nearbyListings.slice(0, 5).map(item => (
                    <Link
                      key={item.listing.id}
                      to={`/property/${item.listing.id}`}
                      className="shrink-0 w-40 bg-muted rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={item.listing.photos?.[0] || "/placeholder.svg"}
                        alt={item.listing.title}
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{item.listing.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDistance(item.distance)}</p>
                        <p className="text-xs font-bold text-primary">{item.listing.price_per_night.toLocaleString("fr-FR")} F/nuit</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <OusmaneChatbot />
    </div>
  );
};

export default ExploreSenegal;
