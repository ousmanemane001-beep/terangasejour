import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { useDestinations, type DbDestination } from "@/hooks/useDestinations";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import { haversineKm, formatDistance } from "@/lib/haversine";
import { MapPin, Search, ChevronRight, Star, Users, BedDouble, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Verified real images from Wikimedia Commons - actual Senegal locations
const DESTINATION_IMAGES: Record<string, string> = {
  // Dakar
  "dakar": "/images/destinations/dakar-1.png",
  "almadies": "/images/destinations/dakar-2.png",
  // Dagana
  "dagana": "/images/destinations/dagana-1.png",
  "ancienne gare de dakar": "/images/destinations/gare-dakar.png",
  "gare de dakar": "/images/destinations/gare-dakar.png",
  // Gorée
  "île de gorée": "/images/destinations/ile-goree.png",
  "gorée": "/images/destinations/ile-goree.png",
  "goree": "/images/destinations/ile-goree.png",
  "fort d'estrées": "/images/destinations/fort-estrees-1.png",
  "fort d'estrees": "/images/destinations/fort-estrees-2.png",
  "fort d estrees": "/images/destinations/fort-estrees-3.png",
  // Saint-Louis
  "île saint-louis": "/images/destinations/ile-saint-louis.png",
  "saint-louis": "/images/destinations/ile-saint-louis.png",
  "saint louis": "/images/destinations/ile-saint-louis.png",
  "fort de podor": "/images/destinations/fort-podor.png",
  "podor": "/images/destinations/fort-podor.png",
  // Touba
  "grande mosquée de touba": "/images/destinations/mosquee-touba.png",
  "grande mosquee de touba": "/images/destinations/mosquee-touba.png",
  "touba": "/images/destinations/mosquee-touba.png",
  "cathédrale du souvenir africain": "/images/destinations/cathedrale-souvenir.png",
  "cathedrale du souvenir africain": "/images/destinations/cathedrale-souvenir.png",
  "cathédrale": "/images/destinations/cathedrale-souvenir.png",
  // Lac Rose
  "lac rose": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Lac_Rose_in_Senegal.jpg/1280px-Lac_Rose_in_Senegal.jpg",
  "lac retba": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Lac_Rose_in_Senegal.jpg/1280px-Lac_Rose_in_Senegal.jpg",
  // Lompoul
  "désert de lompoul": "/images/destinations/lompoul-1.png",
  "lompoul": "/images/destinations/lompoul-2.png",
  "dunes de lompoul": "/images/destinations/lompoul-3.png",
  // Somone
  "somone": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mangroves_de_la_Lagune_de_Somone_12.jpg/1280px-Mangroves_de_la_Lagune_de_Somone_12.jpg",
  // Saly / Mbour
  "saly": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "mbour": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "cimetière des pêcheurs de mbour": "/images/destinations/cimetiere-mbour-1.png",
  "cimetiere des pecheurs de mbour": "/images/destinations/cimetiere-mbour-2.png",
  "cimetière catholique de mbour": "/images/destinations/cimetiere-mbour-3.png",
  // Casamance / Ziguinchor
  "casamance": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/JoolaZiguinchor.JPG/1280px-JoolaZiguinchor.JPG",
  "ziguinchor": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/JoolaZiguinchor.JPG/1280px-JoolaZiguinchor.JPG",
  "oussouye": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/JoolaZiguinchor.JPG/1280px-JoolaZiguinchor.JPG",
  "bignona": "/images/destinations/bignona-1.png",
  // Cap Skirring / Diembering
  "cap skirring": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Cap-Skirring-Beach-2007.jpg/1280px-Cap-Skirring-Beach-2007.jpg",
  "diembering": "/images/destinations/diembering-1.png",
  "kafountine": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Bolong_cap_skirring.jpg/1280px-Bolong_cap_skirring.jpg",
  // Fadiouth / Joal
  "île de fadiouth": "/images/destinations/ile-fadiouth.png",
  "fadiouth": "/images/destinations/ile-fadiouth.png",
  "joal-fadiouth": "/images/destinations/ile-fadiouth.png",
  "joal": "/images/destinations/ile-fadiouth.png",
  "île de mar lodj": "/images/destinations/ile-mar-lodj.png",
  "ile de mar lodj": "/images/destinations/ile-mar-lodj.png",
  "mar lodj": "/images/destinations/ile-mar-lodj.png",
  // Îles
  "île de n'gor": "/images/destinations/ile-ngor.png",
  "n'gor": "/images/destinations/ile-ngor.png",
  "ngor": "/images/destinations/ile-ngor.png",
  "île de karabane": "/images/destinations/ile-karabane.png",
  "karabane": "/images/destinations/ile-karabane.png",
  "île de la madeleine": "/images/destinations/ile-madeleine.png",
  "ile de la madeleine": "/images/destinations/ile-madeleine.png",
  "madeleine": "/images/destinations/ile-madeleine.png",
  "île aux oiseaux": "/images/destinations/ile-oiseaux.png",
  "ile aux oiseaux": "/images/destinations/ile-oiseaux.png",
  "île aux serpents": "/images/destinations/ile-serpents.png",
  "ile aux serpents": "/images/destinations/ile-serpents.png",
  "îles du saloum": "/images/destinations/iles-saloum.png",
  "iles du saloum": "/images/destinations/iles-saloum.png",
  // Sine Saloum
  "sine saloum": "/images/destinations/iles-saloum.png",
  "delta du saloum": "/images/destinations/iles-saloum.png",
  "saloum": "/images/destinations/iles-saloum.png",
  "toubacouta": "/images/destinations/iles-saloum.png",
  "palmarin": "/images/destinations/iles-saloum.png",
  // Dindefelo / Kédougou
  "dindefelo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dindefelo.jpg/800px-Dindefelo.jpg",
  "kedougou": "/images/destinations/bandafassi-2.png",
  "kédougou": "/images/destinations/bandafassi-2.png",
  "bandafassi": "/images/destinations/bandafassi-1.png",
  "cases à impluvium": "/images/destinations/cases-impluvium.png",
  "cases a impluvium": "/images/destinations/cases-impluvium.png",
  "impluvium": "/images/destinations/cases-impluvium.png",
  // Autres
  "centre culturel blaise senghor": "/images/destinations/centre-blaise-senghor.png",
  "blaise senghor": "/images/destinations/centre-blaise-senghor.png",
  "fathala": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mangroves_de_la_Lagune_de_Somone_12.jpg/1280px-Mangroves_de_la_Lagune_de_Somone_12.jpg",
  "bassin de rétention de keur massar": "/images/destinations/bassin-keur-massar.png",
  "bassin de retention de keur massar": "/images/destinations/bassin-keur-massar.png",
  "bassin keur massar": "/images/destinations/bassin-keur-massar.png",
  "keur massar": "/images/destinations/bassin-keur-massar.png",
  "abéné": "/images/destinations/abene-1.png",
  "abene": "/images/destinations/abene-1.png",
  "djiffer": "/images/destinations/djiffer-1.png",
  "diourbel": "/images/destinations/diourbel-1.png",
  "elinkine": "/images/destinations/elinkine-1.png",
  "dionewar": "/images/destinations/dionewar-1.png",
  "fatick": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mangroves_de_la_Lagune_de_Somone_12.jpg/1280px-Mangroves_de_la_Lagune_de_Somone_12.jpg",
  "foundiougne": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mangroves_de_la_Lagune_de_Somone_12.jpg/1280px-Mangroves_de_la_Lagune_de_Somone_12.jpg",
  "gandiol": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Driving_on_the_Faidherbe_Bridge_in_Saint_Louis.jpg/1024px-Driving_on_the_Faidherbe_Bridge_in_Saint_Louis.jpg",
  "ngaparou": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "popenguine": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "nianing": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "toubab dialaw": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Saly_mbour.jpg/800px-Saly_mbour.jpg",
  "tambacounda": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dindefelo.jpg/800px-Dindefelo.jpg",
  "thiès": "/images/destinations/dakar-1.png",
  "thies": "/images/destinations/dakar-1.png",
  "kaolack": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mangroves_de_la_Lagune_de_Somone_12.jpg/1280px-Mangroves_de_la_Lagune_de_Somone_12.jpg",
  "louga": "/images/destinations/dagana-2.png",
  "richard toll": "/images/destinations/dagana-3.png",
};

function getFixedImage(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (DESTINATION_IMAGES[lower]) return DESTINATION_IMAGES[lower];
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(key) || key.includes(lower)) return url;
  }
  return null;
}

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
  const listingIds = useMemo(() => (listings ?? []).map(l => l.id), [listings]);
  const { data: ratingsMap } = useListingsRatings(listingIds);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Build a map: destination id → { nearbyCount, coverImage }
  const destMeta = useMemo(() => {
    const meta: Record<string, { nearbyCount: number; coverImage: string | null }> = {};
    if (!allDestinations || !listings) return meta;

    for (const dest of allDestinations) {
      // Priority: fixed image map → DB image → nearby listing photo
      const fixedImg = getFixedImage(dest.name);
      
      if (!dest.latitude || !dest.longitude) {
        meta[dest.id] = { nearbyCount: 0, coverImage: fixedImg || dest.image1 || null };
        continue;
      }
      const nearbyAll = listings.filter(l =>
        l.latitude && l.longitude &&
        haversineKm(dest.latitude!, dest.longitude!, l.latitude, l.longitude) <= PROXIMITY_KM
      );
      let coverImage = fixedImg || dest.image1 || null;
      if (!coverImage) {
        const nearbyWithPhotos = nearbyAll.filter(l => l.photos && l.photos.length > 0);
        if (nearbyWithPhotos.length > 0) {
          coverImage = nearbyWithPhotos[0].photos![0];
        }
      }
      meta[dest.id] = { nearbyCount: nearbyAll.length, coverImage };
    }
    return meta;
  }, [allDestinations, listings]);

  const grouped = useMemo(() => {
    if (!allDestinations) return {};
    let filtered = search
      ? allDestinations.filter(d =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.region?.toLowerCase().includes(search.toLowerCase())
        )
      : allDestinations;

    // Show all destinations, not just those with images
    const groups: Record<string, DbDestination[]> = {};
    for (const d of filtered) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }
    return groups;
  }, [allDestinations, search, destMeta]);

  const displayCategories = selectedCategory
    ? [selectedCategory]
    : CATEGORIES_ORDER.filter(c => grouped[c]?.length);

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
                    nearbyCount={destMeta[dest.id]?.nearbyCount ?? 0}
                    coverImage={destMeta[dest.id]?.coverImage ?? null}
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
        {/* Listings section */}
        {listings && listings.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Home className="w-6 h-6 text-accent" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Logements disponibles</h2>
              <Badge variant="secondary" className="ml-2">{listings.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map(listing => {
                const rating = ratingsMap?.[listing.id];
                return (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    rating={rating}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <OusmaneChatbot />
    </div>
  );
};

function DestinationDetailCard({ destination, nearbyCount, coverImage }: { destination: DbDestination; nearbyCount: number; coverImage: string | null }) {
  const info = CATEGORY_INFO[destination.category] || { label: destination.category, emoji: "📍", color: "bg-muted text-foreground" };

  // Don't hide destinations without image — show fallback
  return (
    <Link
      to={`/explore?destination=${encodeURIComponent(destination.name)}${destination.latitude ? `&lat=${destination.latitude}&lng=${destination.longitude}` : ""}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="relative" style={{ aspectRatio: "4/3" }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={destination.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">{info.emoji}</span>
          </div>
        )}
        <Badge className={`absolute top-2 left-2 text-[10px] ${info.color}`}>{info.emoji} {info.label}</Badge>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {destination.name}
          </h3>
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


const LISTING_DEFAULT_IMAGE = "/placeholder.svg";

function ListingCard({ listing, rating }: { listing: DBListing; rating?: { avg: number | null; count: number } }) {
  const coverImage = listing.photos && listing.photos.length > 0 ? listing.photos[0] : LISTING_DEFAULT_IMAGE;
  const city = listing.city || listing.location || "Sénégal";

  return (
    <Link
      to={`/property/${listing.id}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="relative" style={{ aspectRatio: "4/3" }}>
        <img
          src={coverImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {rating && rating.avg !== null && (
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-foreground">{rating.avg}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3" /> {city}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">
            {listing.price_per_night.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA / nuit</span>
          </p>
          {rating && rating.count > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {rating.count} avis
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default DiscoverSenegal;
