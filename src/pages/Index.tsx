import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import { properties } from "@/data/properties";
import { useListings } from "@/hooks/useListings";
import { Home, Shield, Loader2, Building2, Palmtree, Wallet, ShieldCheck, BadgeCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  { label: "Villas", icon: "🏡", filter: "Villa" },
  { label: "Plage", icon: "🏖️", filter: "plage" },
  { label: "Apparts Dakar", icon: "🏢", filter: "Appartement" },
  { label: "Budget", icon: "💰", filter: "budget" },
  { label: "Lodges", icon: "🌿", filter: "Lodge" },
  { label: "Lofts", icon: "🏙️", filter: "Loft" },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    desc: "Transactions protégées via Wave, Orange Money et carte bancaire.",
  },
  {
    icon: BadgeCheck,
    title: "Logements vérifiés",
    desc: "Chaque propriété est inspectée et validée par notre équipe.",
  },
  {
    icon: CreditCard,
    title: "Annulation flexible",
    desc: "Annulez sans frais jusqu'à 48h avant votre arrivée.",
  },
];

const Index = () => {
  const { data: dbListings, isLoading } = useListings(8);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-bold text-background mb-4 leading-tight"
          >
            Trouvez votre chez-vous,
            <br />
            <span className="text-gradient-amber">partout!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-background/80 text-lg mb-10 max-w-xl mx-auto"
          >
            Des logements uniques, une expérience authentique. Réservez en toute simplicité !
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

      {/* Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/explore?destination=${encodeURIComponent(cat.filter)}`}
                className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Published Listings from DB */}
      {isLoading ? (
        <section className="py-16 bg-warm-gray">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </section>
      ) : dbListings && dbListings.length > 0 ? (
        <section className="py-16 bg-warm-gray">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Logements récemment publiés
                </h2>
                <p className="text-muted-foreground mt-1">Les derniers logements ajoutés par nos hôtes</p>
              </div>
              <Link to="/explore">
                <Button variant="outline" className="hidden md:flex rounded-full">Voir plus de logements</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {dbListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/explore">
                <Button variant="outline" className="rounded-full">Voir plus de logements</Button>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Static Popular Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Les logements les plus populaires
              </h2>
              <p className="text-muted-foreground mt-1">Découvrez les meilleures adresses au Sénégal</p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="hidden md:flex rounded-full">Voir tout</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {properties.slice(0, 5).map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
            Réservez en toute confiance
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            TerangaSéjour garantit une expérience sécurisée à chaque étape.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trustPoints.map((tp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <tp.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{tp.title}</h3>
                <p className="text-sm text-muted-foreground">{tp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Partagez votre espace
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Rejoignez TerangaSéjour et accueillez les voyageurs en toute facilité et sécurité.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link to="/create-listing" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Publiez votre logement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">Commencer</Button>
            </Link>
            <Link to="/certification" className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">Obtenez votre certification</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gagnez la confiance des voyageurs avec notre certification d'hôte et maximisez vos réservations.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">En savoir plus</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
