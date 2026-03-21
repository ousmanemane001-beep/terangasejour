import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MobileSearchPill from "@/components/MobileSearchPill";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import CategoryFilter, { type CategoryKey } from "@/components/CategoryFilter";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Loader2, CreditCard, BadgeCheck, Headphones,
  Home, Shield, ArrowRight, ShieldX
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Trust ── */
const trustPoints = [
  { icon: CreditCard, title: "Paiement sécurisé", desc: "Wave, Orange Money et carte bancaire." },
  { icon: BadgeCheck, title: "Hôtes vérifiés", desc: "Chaque logement est inspecté par notre équipe." },
  { icon: Headphones, title: "Assistance 24h/24", desc: "Notre équipe locale vous accompagne." },
  { icon: ShieldX, title: "Zéro arnaque", desc: "Annonces authentiques et vérifiées." },
];

const COASTAL_CITIES = ["saly", "somone", "mbour", "cap skirring", "gorée", "saint-louis", "ziguinchor"];
const REGION_CITIES = ["ziguinchor", "tambacounda", "kaolack", "thiès", "kédougou", "fatick", "kolda"];

/* ══════════════════════════════════════════════════════════ */

const Index = () => {
  const { data: dbListings, isLoading } = useListings(12);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const isMobile = useIsMobile();

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
        {/* Categories */}
        <div className="container mx-auto px-4">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>
      </div>

      {/* ═══ LISTINGS ═══ */}
      <section className="flex-1 py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-xl font-bold text-foreground">
              Logements populaires · Sénégal
            </h2>
            <Link to="/explore">
              <Button variant="ghost" size="icon" className="rounded-full border border-border w-8 h-8">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dbListings && dbListings.length > 0 ? (
            <ListingsGrid listings={dbListings} activeCategory={activeCategory} />
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucun logement disponible pour le moment.</p>
          )}
        </div>
      </section>

      {/* ═══ CONFIANCE ═══ */}
      <section className="py-10 md:py-14 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-6 text-center">
            Pourquoi choisir TerangaSéjour ?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((tp, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-4 md:p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <tp.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{tp.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tp.desc}</p>
              </div>
            ))}
          </div>
        </div>
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

/* ── Listings Grid ── */
const ListingsGrid = ({ listings, activeCategory }: { listings: DBListing[]; activeCategory: CategoryKey }) => {
  const { data: ratingsMap } = useListingsRatings(listings.map((l) => l.id));

  const filtered = useMemo(() => {
    if (activeCategory === "all") return listings;
    return listings.filter((l) => {
      const city = (l.city || l.location || "").toLowerCase();
      const type = l.property_type.toLowerCase();
      switch (activeCategory) {
        case "dakar": return city.includes("dakar");
        case "bord_mer": return COASTAL_CITIES.some((c) => city.includes(c)) || type.includes("plage");
        case "mieux_notes": return true;
        case "moins_chers": return true;
        case "populaires": return true;
        case "region": return REGION_CITIES.some((c) => city.includes(c));
        case "hotels": return type.includes("hotel") || type.includes("hôtel") || type.includes("résidence");
        case "verifies": return l.verified;
        default: return true;
      }
    }).sort((a, b) => {
      if (activeCategory === "moins_chers") return a.price_per_night - b.price_per_night;
      if (activeCategory === "mieux_notes") {
        const ra = ratingsMap?.[a.id]?.avg ?? 0;
        const rb = ratingsMap?.[b.id]?.avg ?? 0;
        return rb - ra;
      }
      return 0;
    });
  }, [listings, activeCategory, ratingsMap]);

  return (
    <>
      {/* Mobile: horizontal scroll like Airbnb */}
      <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {filtered.length > 0 ? filtered.map((listing) => (
          <div key={listing.id} className="shrink-0 w-[46%]">
            <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
          </div>
        )) : (
          <p className="text-center text-muted-foreground py-8 w-full">Aucun logement dans cette catégorie.</p>
        )}
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.length > 0 ? filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} rating={ratingsMap?.[listing.id]} />
        )) : (
          <p className="col-span-full text-center text-muted-foreground py-8">Aucun logement dans cette catégorie.</p>
        )}
      </div>
    </>
  );
};

export default Index;
