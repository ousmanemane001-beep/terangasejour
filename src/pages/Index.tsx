import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import OusmaneChatbot from "@/components/OusmaneChatbot";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import { useDestinationCounts } from "@/hooks/useDestinationCounts";
import {
  Loader2, ShieldCheck, BadgeCheck, CreditCard, Headphones,
  Home, Shield, ChevronLeft, ChevronRight, ArrowRight,
  Building2, Waves, MapPin, TreePine, Hotel, Star,
  ShieldX, Search, Bed, DoorOpen, Castle, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Destinations ── */
const DESTINATIONS = [
  { name: "Dakar", image: "https://images.unsplash.com/photo-1611258490565-4a06c019e631?w=600&q=80&auto=format", count: 150 },
  { name: "Saly", image: "https://images.unsplash.com/photo-1743518576305-652c0e1a6fdb?w=600&q=80&auto=format", count: 80 },
  { name: "Somone", image: "https://images.unsplash.com/photo-1569103470612-0414542f9355?w=600&q=80&auto=format", count: 40 },
  { name: "Gorée", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=600&q=80&auto=format", count: 25 },
  { name: "Saint-Louis", image: "https://images.unsplash.com/photo-1590232071814-92dcbf0ed8cd?w=600&q=80&auto=format", count: 30 },
];
const DESTINATION_CITIES = ["Dakar", "Saly", "Somone", "Gorée", "Saint-Louis", "Cap Skirring", "Mbour"];

/* ── Filter types (cozycozy style) ── */
const PRICE_FILTERS = [
  { label: "- de 25 000 F", query: "maxPrice=25000" },
  { label: "25k - 50k F", query: "minPrice=25000&maxPrice=50000" },
  { label: "50k+ F", query: "minPrice=50000" },
];

const TYPE_FILTERS = [
  { label: "Locations vacances", icon: DoorOpen, query: "type=Villa" },
  { label: "Hôtels", icon: Hotel, query: "type=Hotel" },
  { label: "Chambres d'hôtes", icon: Bed, query: "type=Chambre" },
  { label: "Maisons", icon: Home, query: "type=Maison" },
  { label: "Hébergements insolites", icon: Castle, query: "type=Insolite" },
  { label: "Plus de choix", icon: Plus, query: "" },
];

const RATING_FILTERS = [
  { label: "Excellent", score: "9+", query: "minRating=9" },
  { label: "Très bien", score: "8+", query: "minRating=8" },
  { label: "Bien", score: "7+", query: "minRating=7" },
  { label: "Toutes les notes", query: "" },
];

/* ── Trust ── */
const trustPoints = [
  { icon: CreditCard, title: "Paiement sécurisé", desc: "Wave, Orange Money et carte bancaire." },
  { icon: BadgeCheck, title: "Hôtes vérifiés", desc: "Chaque logement est inspecté par notre équipe." },
  { icon: Headphones, title: "Assistance 24h/24", desc: "Notre équipe locale vous accompagne." },
  { icon: ShieldX, title: "Zéro arnaque", desc: "Annonces authentiques et vérifiées." },
];

/* ══════════════════════════════════════════════════════════ */

const Index = () => {
  const { data: dbListings, isLoading } = useListings(12);
  const { data: destCounts } = useDestinationCounts(DESTINATION_CITIES);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      {/* ═══ 1. SEARCH + LISTINGS (Airbnb mobile style) ═══ */}
      <section className="bg-background pt-4 pb-2 md:pt-6">
        <div className="container mx-auto px-4">
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border p-3 md:p-4 mb-6"
          >
            <SearchBar />
          </motion.div>

          {/* Category tabs */}
          <div className="flex gap-6 overflow-x-auto pb-3 mb-4 border-b border-border scrollbar-hide">
            {TYPE_FILTERS.map((f) => (
              <Link
                key={f.label}
                to={f.query ? `/explore?${f.query}` : "/explore"}
                className="shrink-0 flex flex-col items-center gap-1.5 pb-2 border-b-2 border-transparent hover:border-primary transition-colors group"
              >
                <f.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">{f.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings grid directly below */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base md:text-xl font-bold text-foreground">
              Logements populaires · Sénégal
            </h2>
            <Link to="/explore">
              <Button variant="ghost" size="icon" className="rounded-full border border-border">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dbListings && dbListings.length > 0 ? (
            <ListingsGrid listings={dbListings} />
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucun logement disponible pour le moment.</p>
          )}
        </div>
      </section>

      {/* ═══ 4. DESTINATIONS POPULAIRES ═══ */}
      <section className="py-10 md:py-14 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <h2 className="font-display text-lg md:text-2xl font-bold text-foreground">
                Destinations populaires
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">Les lieux préférés de nos voyageurs</p>
            </div>
            <Link to="/explore" className="hidden md:block">
              <Button variant="outline" size="sm" className="rounded-full gap-1">
                Tout voir <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:mx-0 md:px-0">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="shrink-0 w-[160px] md:w-auto"
              >
                <Link
                  to={`/explore?destination=${encodeURIComponent(dest.name)}`}
                  className="relative block rounded-xl overflow-hidden group aspect-[3/4]"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="text-white font-display font-bold text-sm md:text-base">{dest.name}</h3>
                    <p className="text-white/80 text-[11px] mt-0.5">
                      +{destCounts?.[dest.name.toLowerCase()] || dest.count} logements
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. SECTION CONFIANCE ═══ */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-lg md:text-2xl font-bold text-foreground mb-1">
              Pourquoi choisir TerangaSéjour ?
            </h2>
            <p className="text-muted-foreground text-sm">La plateforme de confiance pour réserver au Sénégal</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-card rounded-xl border border-border p-4 md:p-5 flex flex-col items-center text-center hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <tp.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{tp.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. CTA HÔTE ═══ */}
      <section className="py-10 md:py-14 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-xl md:text-3xl font-bold mb-3">
                Gagnez de l'argent avec votre logement
              </h2>
              <p className="text-primary-foreground/80 text-sm md:text-base mb-6 max-w-lg mx-auto">
                Publiez votre logement en quelques minutes et commencez à recevoir des réservations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>
        </div>
      </section>

      <Footer />
      <OusmaneChatbot />
    </div>
  );
};

/* ── Listings Grid (cozycozy style: 4-col grid on desktop, 2-col on mobile) ── */
const ListingsGrid = ({ listings }: { listings: DBListing[] }) => {
  const { data: ratingsMap } = useListingsRatings(listings.map((l) => l.id));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {listings.map((listing, i) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
        >
          <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
        </motion.div>
      ))}
    </div>
  );
};

export default Index;
