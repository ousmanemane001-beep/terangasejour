import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { properties } from "@/data/properties";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import { useDestinationCounts } from "@/hooks/useDestinationCounts";
import {
  Loader2, ShieldCheck, BadgeCheck, CreditCard, Headphones,
  Home, Shield, ChevronLeft, ChevronRight,
  Building2, Waves, MapPin, TreePine, Hotel, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import heroBg from "@/assets/hero-bg.jpg";

/* ── Destinations ── */
const DESTINATIONS = [
  { name: "Dakar", image: "https://images.unsplash.com/photo-1611258490565-4a06c019e631?w=600&q=80&auto=format" },
  { name: "Saly", image: "https://images.unsplash.com/photo-1743518576305-652c0e1a6fdb?w=600&q=80&auto=format" },
  { name: "Gorée", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=600&q=80&auto=format" },
  { name: "Lac Rose", image: "https://images.unsplash.com/photo-1569103470612-0414542f9355?w=600&q=80&auto=format" },
  { name: "Saint-Louis", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=600&q=80&auto=format" },
  { name: "Cap Skirring", image: "https://images.unsplash.com/photo-1588262830598-726eaaed0b63?w=600&q=80&auto=format" },
  { name: "Somone", image: "https://images.unsplash.com/photo-1569103470612-0414542f9355?w=600&q=80&auto=format" },
  { name: "Mbour", image: "https://images.unsplash.com/photo-1657302699239-c350f0372260?w=600&q=80&auto=format" },
];
const DESTINATION_CITIES = DESTINATIONS.map((d) => d.name);

/* ── Categories ── */
const CATEGORIES = [
  { label: "Appartements à Dakar", icon: Building2, query: "type=Appartement&destination=Dakar" },
  { label: "Maisons bord de mer", icon: Waves, query: "type=Villa&destination=Saly" },
  { label: "Destinations populaires", icon: MapPin, query: "" },
  { label: "Logements en région", icon: TreePine, query: "destination=Saint-Louis" },
  { label: "Hôtels", icon: Hotel, query: "type=Hotel" },
];

/* ── Trust ── */
const trustPoints = [
  { icon: ShieldCheck, title: "Réservez et payez en toute sécurité", desc: "Annulation GRATUITE sur la plupart des hébergements." },
  { icon: BadgeCheck, title: "Logements vérifiés", desc: "Chaque propriété est inspectée et validée par notre équipe." },
  { icon: CreditCard, title: "Paiement sécurisé", desc: "Wave, Orange Money et carte bancaire acceptés." },
  { icon: Headphones, title: "Support 7j/7", desc: "Notre équipe est disponible à tout moment." },
];

/* ══════════════════════════════════════════════════════════ */

const Index = () => {
  const { data: dbListings, isLoading } = useListings(8);
  const { data: destCounts } = useDestinationCounts(DESTINATION_CITIES);

  const villas = properties.filter((p) => p.type === "Villa");
  const apartments = properties.filter((p) => p.type === "Appartement" || p.type === "Loft" || p.type === "Studio");
  const beachProperties = properties.filter((p) =>
    p.amenities.includes("pool") ||
    p.location.toLowerCase().includes("saly") ||
    p.location.toLowerCase().includes("somone") ||
    p.location.toLowerCase().includes("cap")
  );

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      {/* ─── 1. HERO ─── */}
      <section className="relative" style={{ zIndex: 10 }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="relative container mx-auto px-4 pt-8 pb-36 md:pt-28 md:pb-44 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-white mb-3 leading-tight max-w-3xl"
          >
            Votre prochain séjour au Sénégal commence ici
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/85 text-base md:text-lg max-w-xl mb-2"
          >
            Appartements, villas, hôtels — réservez en toute confiance avec Teranga&nbsp;Séjour.
          </motion.p>
        </div>

        {/* Floating search */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[213px] md:-bottom-[40px] w-[90%] max-w-[1100px] md:w-full md:px-4"
          style={{ zIndex: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-4 md:p-5"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[220px] md:h-[60px]" />

      {/* ─── 2. CATÉGORIES HORIZONTALES ─── */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Link
                  to={cat.query ? `/explore?${cat.query}` : "#destinations"}
                  className="flex flex-col items-center gap-2 min-w-[90px] px-4 py-3 rounded-xl border border-border bg-card hover:border-primary hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. DESTINATIONS POPULAIRES ─── */}
      <section id="destinations" className="py-10 md:py-14 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Destinations populaires
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Les lieux les plus prisés par nos voyageurs
              </p>
            </div>
            <Link to="/explore" className="hidden md:block">
              <Button variant="outline" size="sm" className="rounded">Tout voir</Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <DestinationCard
                key={dest.name}
                name={dest.name}
                image={dest.image}
                count={destCounts?.[dest.name.toLowerCase()] ?? 0}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. LOGEMENTS EN VEDETTE ─── */}
      {isLoading ? (
        <section className="py-14">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      ) : dbListings && dbListings.length > 0 ? (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                    Logements en vedette
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Sélectionnés pour des séjours inoubliables
                </p>
              </div>
              <Link to="/explore">
                <Button variant="outline" size="sm" className="hidden md:flex rounded">Voir plus</Button>
              </Link>
            </motion.div>
            <IndexListingsCarousel listings={dbListings} />
          </div>
        </section>
      ) : null}

      {/* Property carousels */}
      <PropertySection title="Les plus belles villas" subtitle="Piscine, jardin et vue imprenable" items={villas.slice(0, 5)} />
      {apartments.length > 0 && (
        <PropertySection title="Appartements à Dakar" subtitle="Studios, lofts et appartements urbains" items={apartments.slice(0, 5)} bg />
      )}
      {beachProperties.length > 0 && (
        <PropertySection title="Maisons en bord de mer" subtitle="Réveillez-vous face à l'océan" items={beachProperties.slice(0, 5)} />
      )}

      {/* ─── 5. SECTION CONFIANCE ─── */}
      <section className="py-12 md:py-16 bg-primary/[0.03]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-8"
          >
            Pourquoi choisir Teranga Séjour ?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <tp.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1.5">{tp.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. DEVENIR HÔTE ─── */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              Devenez hôte sur Teranga Séjour
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Rejoignez notre communauté et accueillez les voyageurs en toute simplicité.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to="/create-listing"
                className="rounded-xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 block group"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Publiez votre logement
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations.
                </p>
                <span className="text-sm font-semibold text-primary group-hover:underline">
                  Commencer →
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link
                to="/certification"
                className="rounded-xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 block group"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Obtenez votre certification
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gagnez la confiance des voyageurs et maximisez vos réservations.
                </p>
                <span className="text-sm font-semibold text-primary group-hover:underline">
                  En savoir plus →
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <OusmaneChatbot />
    </div>
  );
};

/* ── Listings Carousel ── */
const IndexListingsCarousel = forwardRef<HTMLDivElement, { listings: DBListing[] }>(
  ({ listings }, _ref) => {
    const { data: ratingsMap } = useListingsRatings(listings.map((l) => l.id));
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      updateScrollState();
      el.addEventListener("scroll", updateScrollState, { passive: true });
      return () => el.removeEventListener("scroll", updateScrollState);
    }, [listings]);

    const scroll = useCallback((dir: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }, []);

    const [paused, setPaused] = useState(false);
    useEffect(() => {
      if (paused) return;
      const interval = setInterval(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 320, behavior: "smooth" });
        }
      }, 4000);
      return () => clearInterval(interval);
    }, [paused]);

    return (
      <div className="relative group" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors hidden md:flex"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
        >
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[280px] max-w-[320px] w-[75vw] sm:w-[320px] shrink-0 snap-start"
            >
              <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
            </motion.div>
          ))}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors hidden md:flex"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>
    );
  }
);
IndexListingsCarousel.displayName = "IndexListingsCarousel";

/* ── Property Section ── */
const PropertySection = ({ title, subtitle, items, bg }: { title: string; subtitle: string; items: typeof properties; bg?: boolean }) => (
  <section className={`py-10 md:py-14 ${bg ? "bg-secondary" : ""}`}>
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>
        <Link to="/explore" className="shrink-0">
          <Button variant="outline" size="sm" className="hidden md:flex rounded">Voir tout</Button>
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {items.map((property) => (
          <div key={property.id} className="min-w-[250px] max-w-[280px] w-[70vw] sm:w-[280px] shrink-0 snap-start">
            <PropertyCard {...property} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Index;
