import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
          >
            À propos de TerangaSéjour
          </motion.h1>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              TerangaSéjour est la première plateforme de réservation de logements dédiée au Sénégal. Notre mission est de connecter les voyageurs avec des hébergements authentiques et de qualité à travers tout le pays.
            </p>
            <p>
              Que vous cherchiez une villa avec piscine à Saly, un appartement moderne à Dakar, ou un éco-lodge en Casamance, TerangaSéjour vous offre une sélection variée pour tous les budgets et tous les goûts.
            </p>
            <p>
              Nous croyons en un tourisme responsable qui bénéficie aux communautés locales. Chaque réservation contribue directement à l'économie sénégalaise et soutient les hôtes locaux.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
