import { motion } from "framer-motion";

const ExploreHero = () => {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-2 leading-tight">
            Trouvez l'endroit parfait, à votre façon.
          </h1>
          <p className="text-primary-foreground/70 text-sm md:text-base">
            Affinez votre recherche, explorez la carte et réservez le logement idéal en toute simplicité.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreHero;
