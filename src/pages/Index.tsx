import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MobileSearchPill from "@/components/MobileSearchPill";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import {
  Loader2, Home, Shield, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COASTAL_CITIES = ["saly", "somone", "mbour", "cap skirring", "gorée", "saint-louis", "ziguinchor"];
const REGION_CITIES = ["ziguinchor", "tambacounda", "kaolack", "thiès", "kédougou", "fatick", "kolda"];

/* ══════════════════════════════════════════════════════════ */

const Index = () => {
  const { data: dbListings, isLoading } = useListings();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      {/* ═══ SEARCH ═══ */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        {/* Mobile: compact search pill */}
        <div className="md:hidden px-4 pt-3 pb-2">
          <MobileSearchPill />
        </div>
        {/* Desktop: full search bar */}
        <div className="hidden md:block container mx-auto px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ═══ CATEGORIZED LISTINGS ═══ */}
      <section className="flex-1 py-4 md:py-6 space-y-6 md:space-y-10">
        <CategorySection
          title="Appartements à Dakar"
          listings={dbListings}
          filterFn={(l) => {
            const city = (l.city || l.location || "").toLowerCase();
            const type = l.property_type.toLowerCase();
            return city.includes("dakar") && (type.includes("appartement") || type.includes("studio") || type.includes("appart"));
          }}
          isLoading={isLoading}
        />
        <CategorySection
          title="Maisons au bord de la mer"
          listings={dbListings}
          filterFn={(l) => {
            const city = (l.city || l.location || "").toLowerCase();
            const type = l.property_type.toLowerCase();
            return COASTAL_CITIES.some((c) => city.includes(c)) || type.includes("plage") || type.includes("villa");
          }}
          isLoading={isLoading}
        />
        <CategorySection
          title="Logements populaires"
          listings={dbListings}
          filterFn={() => true}
          isLoading={isLoading}
        />
        <CategorySection
          title="Hôtels & Résidences"
          listings={dbListings}
          filterFn={(l) => {
            const type = l.property_type.toLowerCase();
            return type.includes("hotel") || type.includes("hôtel") || type.includes("résidence") || type.includes("residence");
          }}
          isLoading={isLoading}
        />
        <CategorySection
          title="Logements en région"
          listings={dbListings}
          filterFn={(l) => {
            const city = (l.city || l.location || "").toLowerCase();
            return REGION_CITIES.some((c) => city.includes(c));
          }}
          isLoading={isLoading}
        />
      </section>

      {/* ═══ CTA HÔTE ═══ */}
      <section className="py-10 md:py-14 bg-foreground text-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3">
            Gagnez de l'argent avec votre logement
          </h2>
          <p className="text-background/70 text-sm md:text-base mb-6">
            Publiez votre logement en quelques minutes et commencez à recevoir des réservations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create-listing">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
                <Home className="w-4 h-4" />
                Publier mon logement
              </Button>
            </Link>
            <Link to="/certification">
              <Button variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10 rounded-full px-6 gap-2">
                <Shield className="w-4 h-4" />
                Certification hôte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <OusmaneChatbot />
    </div>
  );
};

/* ── Category Section ── */
const CategorySection = ({
  title,
  listings,
  filterFn,
  isLoading,
}: {
  title: string;
  listings: DBListing[] | undefined;
  filterFn: (l: DBListing) => boolean;
  isLoading: boolean;
}) => {
  const filtered = useMemo(() => (listings ?? []).filter(filterFn), [listings, filterFn]);
  const { data: ratingsMap } = useListingsRatings(filtered.map((l) => l.id));

  if (isLoading) return null;
  if (filtered.length === 0) return null;

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-xl font-bold text-foreground">{title}</h2>
        <Link to="/explore">
          <Button variant="ghost" size="icon" className="rounded-full border border-border w-8 h-8">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {filtered.map((listing) => (
          <div key={listing.id} className="shrink-0 w-[46%]">
            <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
          </div>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} rating={ratingsMap?.[listing.id]} />
        ))}
      </div>
    </div>
  );
};
export default Index;
