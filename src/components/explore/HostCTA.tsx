import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HostCTA = () => {
  return (
    <section className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Partagez votre espace
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Rejoignez-nous et accueillez les voyageurs en toute facilité et sécurité.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-[var(--shadow-card-hover)] transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg mb-2">
              Publiez votre logement
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.
            </p>
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link to="/publish">
                En savoir plus <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-[var(--shadow-card-hover)] transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg mb-2">
              Obtenez votre certification
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gagnez la confiance des voyageurs avec notre certification d'hôte et maximisez vos réservations.
            </p>
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link to="/certification">
                En savoir plus <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HostCTA;
