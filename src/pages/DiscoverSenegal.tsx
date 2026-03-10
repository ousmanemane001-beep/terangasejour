import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { useDestinations, type DbDestination } from "@/hooks/useDestinations";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useReviewsForListings } from "@/hooks/useReviews";
import { haversineKm, formatDistance } from "@/lib/haversine";
import { MapPin, Search, ChevronRight, Star, Users, BedDouble, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
const CATEGORY_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  plage: { label: "Plages", emoji: "🏖️", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  ville: { label: "Villes", emoji: "🏙️", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  parc_naturel: { label: "Parcs naturels", emoji: "🌳", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  site_historique: { label: "Sites historiques", emoji: "🏛️", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  lac: { label: "Lacs", emoji: "💧", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  ile: { label: "Îles", emoji: "🏝️", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  aeroport: { label: "Aéroports", emoji: "✈️", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
  restaurant: { label: "Restaurants", emoji: "🍽️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  hotel: { label: "Hôtels", emoji: "🏨", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

const CATEGORIES_ORDER = ["plage", "ville", "parc_naturel", "site_historique", "lac", "ile"];
const PROXIMITY_KM = 30;

const DiscoverSenegal = () => {
  const { data: allDestinations } = useDestinations();
  const { data: listings } = useListings();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const grouped = useMemo(() => {
    if (!allDestinations) return {};
    const filtered = search
      ? allDestinations.filter(d =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.region?.toLowerCase().includes(search.toLowerCase())
        )
      : allDestinations;

    const groups: Record<string, DbDestination[]> = {};
    for (const d of filtered) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }
    return groups;
  }, [allDestinations, search]);

  const displayCategories = selectedCategory
    ? [selectedCategory]
    : CATEGORIES_ORDER.filter(c => grouped[c]?.length);

  const getNearbyListingsCount = (dest: DbDestination) => {
    if (!listings || !dest.latitude || !dest.longitude) return 0;
    return listings.filter(l =>
      l.latitude && l.longitude &&
      haversineKm(dest.latitude!, dest.longitude!, l.latitude, l.longitude) <= PROXIMITY_KM
    ).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-16 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            🌍 Découvrir le Sénégal
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            Explorez les plus belles destinations du Sénégal : plages paradisiaques, parcs naturels, 
            sites historiques et villes vibrantes.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une destination..."
              className="pl-10 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory(null)}
          >
            Tout
          </Button>
          {CATEGORIES_ORDER.map(cat => {
            const info = CATEGORY_INFO[cat];
            if (!grouped[cat]?.length) return null;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {info?.emoji} {info?.label} ({grouped[cat].length})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Destinations by category */}
      <div className="container mx-auto px-4 pb-16 space-y-12">
        {displayCategories.map(cat => {
          const info = CATEGORY_INFO[cat] || { label: cat, emoji: "📍", color: "bg-muted text-foreground" };
          const dests = grouped[cat] || [];
          if (!dests.length) return null;

          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{info.emoji}</span>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{info.label}</h2>
                <Badge variant="secondary" className="ml-2">{dests.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {dests.map(dest => (
                  <DestinationDetailCard
                    key={dest.id}
                    destination={dest}
                    nearbyCount={getNearbyListingsCount(dest)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Aucune destination trouvée</h3>
            <p className="text-sm text-muted-foreground">Essayez un autre terme de recherche.</p>
          </div>
        )}
      </div>

      <Footer />
      <OusmaneChatbot />
    </div>
  );
};

function DestinationDetailCard({ destination, nearbyCount }: { destination: DbDestination; nearbyCount: number }) {
  const info = CATEGORY_INFO[destination.category] || { label: destination.category, emoji: "📍", color: "bg-muted text-foreground" };

  return (
    <Link
      to={`/explore?destination=${encodeURIComponent(destination.name)}${destination.latitude ? `&lat=${destination.latitude}&lng=${destination.longitude}` : ""}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      {/* Gradient placeholder with emoji */}
      <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">{info.emoji}</span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {destination.name}
          </h3>
          <Badge className={`text-[10px] shrink-0 ${info.color}`}>{info.label}</Badge>
        </div>

        {destination.region && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> {destination.region}
          </p>
        )}

        {destination.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{destination.description}</p>
        )}

        <div className="flex items-center justify-between">
          {nearbyCount > 0 ? (
            <span className="text-xs font-medium text-primary">
              🏠 {nearbyCount} logement{nearbyCount > 1 ? "s" : ""} à proximité
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Explorer →</span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export default DiscoverSenegal;
