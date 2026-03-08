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
import { Loader2, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";

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

const Index = () => {
  const { data: dbListings, isLoading } = useListings(8);
  const { data: destCounts } = useDestinationCounts(DESTINATION_CITIES);

  const villas = properties.filter((p) => p.type === "Villa");
  const apartments = properties.filter((p) => p.type === "Appartement" || p.type === "Loft" || p.type === "Studio");
  const beachProperties = properties.filter((p) => p.amenities.includes("pool") || p.location.toLowerCase().includes("saly") || p.location.toLowerCase().includes("somone") || p.location.toLowerCase().includes("cap"));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero — clean white centered like sejour.sn */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground mb-4 leading-tight"
          >
            Trouvez votre chez-vous, partout!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto"
          >
            Des logements uniques, une expérience authentique. Réservez en toute simplicité !
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Nos coups de coeur / Published Listings from DB */}
      {isLoading ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      ) : dbListings && dbListings.length > 0 ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Nos coups de coeur du moment</h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Découvrez une sélection choisie avec soin pour des séjours inoubliables.</p>
              </div>
              <Link to="/explore">
                <Button variant="outline" className="hidden md:flex rounded-full">Voir plus</Button>
              </Link>
            </div>
            <IndexListingsGrid listings={dbListings} />
          </div>
        </section>
      ) : null}

      {/* Destinations populaires */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">Destinations populaires</h2>
          <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">Les lieux les plus prisés par nos voyageurs</p>
          <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
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

      {/* Les logements les plus populaires — Villas */}
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
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-center mb-2">Partagez votre espace</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-10 max-w-lg mx-auto text-sm md:text-base">
            Rejoignez TerangaSéjour et accueillez les voyageurs en toute facilité et sécurité.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link to="/create-listing" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Publiez votre logement</h3>
              <p className="text-sm text-muted-foreground mb-4">Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.</p>
              <span className="text-sm font-semibold text-primary hover:underline">En savoir plus</span>
            </Link>
            <Link to="/certification" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
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
  <section className={`py-12 md:py-16 ${bg ? "bg-secondary" : ""}`}>
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>
        </div>
        <Link to="/explore" className="shrink-0">
          <Button variant="outline" className="hidden md:flex rounded-full">Voir tout</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {items.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  </section>
);

export default Index;
