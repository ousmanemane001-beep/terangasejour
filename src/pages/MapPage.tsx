import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const MapPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center bg-warm-gray">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Carte interactive
          </h1>
          <p className="text-muted-foreground">
            La carte interactive sera bientôt disponible.
          </p>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default MapPage;
