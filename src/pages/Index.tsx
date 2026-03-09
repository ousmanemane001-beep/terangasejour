import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { properties } from "@/data/properties";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import { useDestinationCounts } from "@/hooks/useDestinationCounts";
import { Loader2, ShieldCheck, BadgeCheck, CreditCard, Headphones, Home, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import heroBg from "@/assets/hero-bg.jpg";

const DESTINATIONS = [
  { name: "Dakar", image: "/images/dest-dakar.jpg" },
  { name: "Saly", image: "/images/dest-saly.jpg" },
  { name: "Mbour", image: "/images/dest-mbour.jpg" },
  { name: "Somone", image: "/images/dest-somone.jpg" },
  { name: "Ngaparou", image: "/images/dest-ngaparou.jpg" },
  { name: "Popenguine", image: "/images/dest-popenguine.jpg" },
  { name: "Pointe Sarene", image: "/images/dest-pointe-sarene.jpg" },
  { name: "Cap Skirring", image: "/images/dest-cap-skirring.jpg" },
];

const DESTINATION_CITIES = DESTINATIONS.map((d) => d.name);

const trustPoints = [
  { icon: ShieldCheck, title: "Réservez maintenant et payez sur place", desc: "Annulation GRATUITE sur la plupart des hébergements" },
  { icon: BadgeCheck, title: "Logements vérifiés", desc: "Chaque propriété est inspectée et validée par notre équipe." },
  { icon: CreditCard, title: "Paiement sécurisé", desc: "Transactions protégées via Wave, Orange Money et carte bancaire." },
  { icon: Headphones, title: "Service Clients disponible 7j/7", desc: "Nous sommes là pour vous aider, à tout moment." },
];

const Index = () => {
  const { data: dbListings, isLoading } = useListings(8);
  const { data: destCounts } = useDestinationCounts(DESTINATION_CITIES);

  const villas = properties.filter((p) => p.type === "Villa");
  const apartments = properties.filter((p) => p.type === "Appartement" || p.type === "Loft" || p.type === "Studio");
  const beachProperties = properties.filter((p) => p.amenities.includes("pool") || p.location.toLowerCase().includes("saly") || p.location.toLowerCase().includes("somone") || p.location.toLowerCase().includes("cap"));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero — VotreSejour.sn style */}
      <section className="relative" style={{ zIndex: 10 }}>
        {/* Background image — full bleed */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative container mx-auto px-4 pt-6 pb-32 md:pt-24 md:pb-40 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl md:text-5xl lg:text-[3.25rem] font-bold text-white mb-3 leading-tight"
          >
            Bienvenue sur TerangaSéjour
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/80 text-base md:text-lg max-w-xl"
          >
            Trouvez votre séjour parfait au Sénégal
          </motion.p>
        </div>

        {/* Floating search card */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[217px] md:-bottom-[40px] w-[85%] max-w-[1100px] md:w-full md:px-4" style={{ zIndex: 20 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[16px] md:rounded-[14px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] md:shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-[18px] md:p-5"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Spacer for floating search card */}
      <div className="h-[211px] md:h-[60px]" />

      {/* Published Listings from DB — right after search */}
      {isLoading ? (
        <section className="py-12">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      ) : dbListings && dbListings.length > 0 ? (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Ils vous intéressent toujours ?</h2>
                <p className="text-muted-foreground mt-1 text-sm">Découvrez une sélection choisie avec soin pour des séjours inoubliables.</p>
              </div>
              <Link to="/explore">
                <Button variant="outline" size="sm" className="hidden md:flex rounded">Voir plus</Button>
              </Link>
            </div>
            <IndexListingsCarousel listings={dbListings} />
          </div>
        </section>
      ) : null}

      {/* Trust points */}
      <section className="py-8 md:py-10 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustPoints.map((tp, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <tp.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm leading-tight mb-1">{tp.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations populaires */}
      <section className="py-10 md:py-14 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">Destinations populaires</h2>
          <p className="text-muted-foreground mb-6 text-sm">Les lieux les plus prisés par nos voyageurs</p>
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

      {/* Popular Villas */}
      <PropertySection title="Les logements les plus populaires" subtitle="Les plus belles villas du Sénégal" items={villas.slice(0, 5)} />

      {/* Apartments */}
      {apartments.length > 0 && (
        <PropertySection title="Appartements à Dakar" subtitle="Studios, lofts et appartements urbains" items={apartments.slice(0, 5)} bg />
      )}

      {/* Beach */}
      {beachProperties.length > 0 && (
        <PropertySection title="Maisons en bord de mer" subtitle="Profitez de la côte sénégalaise" items={beachProperties.slice(0, 5)} />
      )}

      {/* CTA — Partagez votre espace */}
      <section className="py-10 md:py-14 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-2">Partagez votre espace</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
            Rejoignez TerangaSéjour et accueillez les voyageurs en toute facilité et sécurité.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link to="/create-listing" className="rounded-lg border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Publiez votre logement</h3>
              <p className="text-sm text-muted-foreground mb-4">Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.</p>
              <span className="text-sm font-semibold text-primary hover:underline">En savoir plus</span>
            </Link>
            <Link to="/certification" className="rounded-lg border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Obtenez votre certification</h3>
              <p className="text-sm text-muted-foreground mb-4">Gagnez la confiance des voyageurs avec notre certification d'hôte et maximisez vos réservations.</p>
              <span className="text-sm font-semibold text-primary hover:underline">En savoir plus</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

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

    // Auto-scroll every 4 seconds, pause on hover
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
