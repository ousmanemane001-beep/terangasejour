import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { properties } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Map, SlidersHorizontal } from "lucide-react";

const Explore = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-12 bg-warm-gray">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Trouvez l'endroit parfait, à votre façon.
          </motion.h1>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Affinez votre recherche, explorez la carte et réservez le logement idéal en toute simplicité.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Listings */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              Les logements les plus populaires
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Map className="w-4 h-4" /> Carte
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filtrer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...properties, ...properties].map((property, i) => (
              <PropertyCard key={`${property.id}-${i}`} {...property} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;
