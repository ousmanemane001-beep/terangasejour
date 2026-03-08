import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import { properties } from "@/data/properties";
import { useListings } from "@/hooks/useListings";
import { Home, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
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

      {/* Popular Listings */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Les logements les plus populaires
              </h2>
              <p className="text-muted-foreground mt-1">
                Découvrez les meilleures adresses au Sénégal
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex rounded-full">
              Voir tout
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
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
            Rejoignez VotreSéjour et accueillez les voyageurs en toute facilité et sécurité.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Publiez votre logement
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                En savoir plus
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Obtenez votre certification
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gagnez la confiance des voyageurs avec notre certification d'hôte et maximisez vos réservations.
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
