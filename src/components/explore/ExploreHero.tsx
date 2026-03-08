import { motion } from "framer-motion";

const ExploreHero = () => {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 leading-tight">
            Trouvez l'endroit parfait,{" "}
            <span className="text-accent">à votre façon.</span>
          </h1>
          <p className="text-primary-foreground/80 text-base md:text-lg">
            Affinez votre recherche, explorez la carte et réservez le logement idéal en toute simplicité.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreHero;
