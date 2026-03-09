import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreMap from "@/components/ExploreMap";
import { useListings } from "@/hooks/useListings";
import { Loader2, MapPin, BedDouble, Users } from "lucide-react";
import { Property } from "@/data/properties";

const MapPage = () => {
  const { data: listings, isLoading } = useListings();
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);

  // Convert DB listings to Property format for ExploreMap
  const properties: Property[] = useMemo(() => {
    if (!listings) return [];
    return listings
      .filter((l) => l.latitude && l.longitude)
      .map((l, i) => ({
        id: i,
        dbId: l.id,
        title: l.title,
        location: l.location || l.city || "",
        price: l.price_per_night,
        rating: 4.5,
        image: l.photos?.[0] || "/placeholder.svg",
        type: l.property_type,
        beds: l.bedrooms,
        guests: l.capacity,
        lat: l.latitude!,
        lng: l.longitude!,
      }));
  }, [listings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar listing cards */}
        <div className="w-full lg:w-[380px] xl:w-[420px] border-r border-border overflow-y-auto bg-background" style={{ maxHeight: "calc(100vh - 64px)" }}>
          <div className="p-4 border-b border-border">
            <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Carte des logements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {properties.length} logement{properties.length > 1 ? "s" : ""} avec localisation
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 px-4">
              <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun logement géolocalisé pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  to={`/property/${(p as any).dbId}`}
                  className={`flex gap-3 p-4 transition-colors hover:bg-accent/5 ${hoveredProperty === p.id ? "bg-accent/10" : ""}`}
                  onMouseEnter={() => setHoveredProperty(p.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-24 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {p.beds}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.guests}</span>
                    </div>
                    <p className="font-bold text-foreground text-sm mt-1">
                      {p.price.toLocaleString("fr-FR")} F <span className="font-normal text-xs text-muted-foreground">/nuit</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          {properties.length > 0 ? (
            <ExploreMap properties={properties} hoveredProperty={hoveredProperty} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <p className="text-muted-foreground">Chargement de la carte...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
