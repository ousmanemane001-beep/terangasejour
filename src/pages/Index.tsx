import { forwardRef } from "react";
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
import { Loader2, ShieldCheck, BadgeCheck, CreditCard, Headphones, Home, Shield } from "lucide-react";
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
  { icon: ShieldCheck, title: "Paiement sécurisé", desc: "Transactions protégées via Wave, Orange Money et carte bancaire." },
  { icon: BadgeCheck, title: "Logements vérifiés", desc: "Chaque propriété est inspectée et validée par notre équipe." },
  { icon: CreditCard, title: "Annulation flexible", desc: "Annulez sans frais jusqu'à 48h avant votre arrivée." },
  { icon: Headphones, title: "Assistance 7j/7", desc: "Notre équipe vous accompagne avant, pendant et après votre séjour." },
];

const Index = () => {
  const { data: dbListings, isLoading } = useListings(8);

  const { data: destCounts } = useDestinationCounts(DESTINATION_CITIES);

  const villas = properties.filter((p) => p.type === "Villa");
  const apartments = properties.filter((p) => p.type === "Appartement" || p.type === "Loft" || p.type === "Studio");
  const beachProperties = properties.filter((p) => p.amenities.includes("pool") || p.location.toLowerCase().includes("saly") || p.location.toLowerCase().includes("somone") || p.location.toLowerCase().includes("cap"));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(216_85%_12%/0.55)] via-[hsl(216_85%_20%/0.4)] to-[hsl(216_85%_34%/0.6)]" />
        <div className="relative container mx-auto px-4 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-extrabold text-background mb-4 leading-tight"
          >
            Trouvez votre logement idéal
            <br />
            <span className="text-primary">au Sénégal</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-background/85 text-lg md:text-xl mb-10 max-w-2xl"
          >
            Réservez villas, appartements et maisons de vacances au meilleur prix.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Destinations populaires */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Destinations populaires</h2>
          <p className="text-muted-foreground mb-8">Les lieux les plus prisés par nos voyageurs</p>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
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

      {/* Published Listings from DB */}
      {isLoading ? (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      ) : dbListings && dbListings.length > 0 ? (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Logements récemment publiés</h2>
                <p className="text-muted-foreground mt-1">Les derniers logements ajoutés par nos hôtes</p>
              </div>
              <Link to="/explore">
                <Button variant="outline" className="hidden md:flex rounded-full">Voir plus</Button>
              </Link>
            </div>
            <IndexListingsGrid listings={dbListings} />
          </div>
        </section>
      ) : null}

      {/* Popular Villas */}
      <PropertySection title="Villas populaires" subtitle="Les plus belles villas du Sénégal" items={villas.slice(0, 5)} />

      {/* Apartments */}
      {apartments.length > 0 && (
        <PropertySection title="Appartements à Dakar" subtitle="Studios, lofts et appartements urbains" items={apartments.slice(0, 5)} bg />
      )}

      {/* Beach */}
      {beachProperties.length > 0 && (
        <PropertySection title="Maisons en bord de mer" subtitle="Profitez de la côte sénégalaise" items={beachProperties.slice(0, 5)} />
      )}

      {/* Trust Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">Réservez en toute confiance</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">TerangaSéjour garantit une expérience sécurisée à chaque étape.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {trustPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <tp.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{tp.title}</h3>
                <p className="text-sm text-muted-foreground">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Partagez votre espace</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link to="/create-listing" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Publiez votre logement</h3>
              <p className="text-sm text-muted-foreground mb-4">Mettez votre propriété en ligne et commencez à recevoir des réservations.</p>
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground">Commencer</Button>
            </Link>
            <Link to="/certification" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Obtenez votre certification</h3>
              <p className="text-sm text-muted-foreground mb-4">Gagnez la confiance des voyageurs avec notre certification d'hôte.</p>
              <Button variant="outline" size="sm" className="rounded-full">En savoir plus</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const IndexListingsGrid = forwardRef<HTMLDivElement, { listings: DBListing[] }>(
  ({ listings }, ref) => {
    const { data: ratingsMap } = useListingsRatings(listings.map((l) => l.id));
    return (
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
          </motion.div>
        ))}
      </div>
    );
  }
);
IndexListingsGrid.displayName = "IndexListingsGrid";

const PropertySection = ({ title, subtitle, items, bg }: { title: string; subtitle: string; items: typeof properties; bg?: boolean }) => (
  <section className={`py-16 ${bg ? "bg-secondary" : ""}`}>
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Link to="/explore">
          <Button variant="outline" className="hidden md:flex rounded-full">Voir tout</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {items.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  </section>
);

export default Index;
