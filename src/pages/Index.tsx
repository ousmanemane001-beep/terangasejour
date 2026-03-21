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
  Home, Shield, ChevronLeft, ChevronRight, ArrowRight,
  Building2, Waves, MapPin, TreePine, Hotel, Star,
  Moon, Palmtree, Briefcase, Heart, ShieldX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

/* ── Destinations ── */
const DESTINATIONS = [
  { name: "Dakar", image: "https://images.unsplash.com/photo-1611258490565-4a06c019e631?w=600&q=80&auto=format", count: 150 },
  { name: "Saly", image: "https://images.unsplash.com/photo-1743518576305-652c0e1a6fdb?w=600&q=80&auto=format", count: 80 },
  { name: "Somone", image: "https://images.unsplash.com/photo-1569103470612-0414542f9355?w=600&q=80&auto=format", count: 40 },
  { name: "Gorée", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=600&q=80&auto=format", count: 25 },
];
const DESTINATION_CITIES = ["Dakar", "Saly", "Somone", "Gorée", "Saint-Louis", "Cap Skirring", "Mbour"];

/* ── Quick suggestions ── */
const QUICK_DESTINATIONS = ["Dakar", "Saly", "Somone", "Lac Rose"];

/* ── Categories ── */
const CATEGORIES = [
  { label: "Appartements à Dakar", icon: Building2, query: "type=Appartement&destination=Dakar", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" },
  { label: "Maisons bord de mer", icon: Waves, query: "type=Villa&destination=Saly", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80" },
  { label: "Destinations populaires", icon: MapPin, query: "", image: "https://images.unsplash.com/photo-1611258490565-4a06c019e631?w=400&q=80" },
  { label: "Logements en région", icon: TreePine, query: "destination=Saint-Louis", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=400&q=80" },
  { label: "Hôtels & résidences", icon: Hotel, query: "type=Hotel", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80" },
];

/* ── Trust ── */
const trustPoints = [
  { icon: CreditCard, title: "Paiement sécurisé", desc: "Wave, Orange Money et carte bancaire. Vos transactions sont 100% protégées." },
  { icon: BadgeCheck, title: "Hôtes vérifiés", desc: "Chaque hôte est vérifié et chaque logement est inspecté par notre équipe." },
  { icon: Headphones, title: "Assistance locale rapide", desc: "Notre équipe sénégalaise est disponible 24h/24 pour vous accompagner." },
  { icon: ShieldX, title: "Aucun faux logement", desc: "Toutes les annonces sont authentiques et vérifiées avant publication." },
];

/* ── Séjours adaptés ── */
const SEJOUR_TYPES = [
  { icon: Moon, title: "Séjours Ndogou", desc: "Logements adaptés pour le Ramadan avec cuisine équipée", query: "type=Appartement" },
  { icon: Palmtree, title: "Week-end détente", desc: "Villas avec piscine pour un break en bord de mer", query: "destination=Saly" },
  { icon: Briefcase, title: "Voyage professionnel", desc: "Appartements connectés au cœur de Dakar", query: "type=Appartement&destination=Dakar" },
  { icon: Heart, title: "Séjour en couple", desc: "Logements romantiques avec vue imprenable", query: "destination=Somone" },
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

      {/* ═══ 1. HERO ═══ */}
      <section className="relative" style={{ zIndex: 10 }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

        <div className="relative container mx-auto px-4 pt-10 pb-40 md:pt-28 md:pb-48 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-[1.75rem] md:text-5xl lg:text-[3.5rem] font-bold text-white mb-3 leading-[1.15] max-w-3xl"
          >
            Réservez votre logement au Sénégal en toute sécurité
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-white/90 text-sm md:text-lg max-w-xl mb-4"
          >
            Des logements vérifiés, sans arnaque, avec assistance locale 24h/24.
          </motion.p>

          {/* Quick destination suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-1"
          >
            <span className="text-white/60 text-xs font-medium">Suggestions :</span>
            {QUICK_DESTINATIONS.map((d) => (
              <Link
                key={d}
                to={`/explore?destination=${encodeURIComponent(d)}`}
                className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors border border-white/20"
              >
                {d}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Floating search */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[213px] md:-bottom-[40px] w-[92%] max-w-[1100px] md:w-full md:px-4"
          style={{ zIndex: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-4 md:p-5"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[220px] md:h-[60px]" />

      {/* ═══ 2. CATÉGORIES (scroll horizontal avec images) ═══ */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="shrink-0"
              >
                <Link
                  to={cat.query ? `/explore?${cat.query}` : "#destinations"}
                  className="relative block w-[140px] md:w-[180px] h-[110px] md:h-[130px] rounded-xl overflow-hidden group"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <cat.icon className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <span className="text-white text-xs md:text-sm font-semibold leading-tight line-clamp-2">
                      {cat.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. DESTINATIONS POPULAIRES ═══ */}
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
              <Button variant="outline" size="sm" className="rounded gap-1">
                Tout voir <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Link
                  to={`/explore?destination=${encodeURIComponent(dest.name)}`}
                  className="relative block rounded-xl overflow-hidden group aspect-[4/5]"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-display font-bold text-base md:text-lg">{dest.name}</h3>
                    <p className="text-white/80 text-xs mt-0.5">
                      +{destCounts?.[dest.name.toLowerCase()] || dest.count} logements
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. LOGEMENTS EN VEDETTE ═══ */}
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
                  Les mieux notés et les plus populaires
                </p>
              </div>
              <Link to="/explore">
                <Button variant="outline" size="sm" className="hidden md:flex rounded gap-1">
                  Voir plus <ArrowRight className="w-3.5 h-3.5" />
                </Button>
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

      {/* ═══ 5. SECTION CONFIANCE ═══ */}
      <section className="py-12 md:py-16 bg-primary/[0.04]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              Pourquoi choisir Teranga ?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              La première plateforme de confiance pour réserver au Sénégal
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {trustPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <tp.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1.5">{tp.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. SÉJOURS ADAPTÉS (différenciation) ═══ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              Des séjours adaptés à votre quotidien
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Trouvez le logement parfait pour chaque occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SEJOUR_TYPES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={`/explore?${s.query}`}
                  className="block rounded-xl border border-border bg-card p-5 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 transition-all duration-200 group h-full"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA HÔTE ═══ */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center md:text-left"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Gagnez de l'argent avec votre logement
              </h2>
              <p className="text-primary-foreground/80 text-sm md:text-base mb-6 max-w-md">
                Publiez votre logement en quelques minutes et commencez à recevoir des réservations. Rejoignez des centaines d'hôtes au Sénégal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/create-listing">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8 gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Publier mon logement
                  </Button>
                </Link>
                <Link to="/certification">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-6 gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Certification hôte
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="hidden md:flex flex-col gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[240px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">100% gratuit</p>
                  <p className="text-xs text-primary-foreground/70">Aucun frais d'inscription</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Visibilité garantie</p>
                  <p className="text-xs text-primary-foreground/70">Des milliers de voyageurs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Accompagnement</p>
                  <p className="text-xs text-primary-foreground/70">Support dédié aux hôtes</p>
                </div>
              </div>
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
          <Button variant="outline" size="sm" className="hidden md:flex rounded gap-1">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Button>
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
