import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Star, Award, BadgeCheck, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Badge de confiance",
    description: "Affichez un badge certifié sur votre profil et vos annonces pour rassurer les voyageurs.",
  },
  {
    icon: TrendingUp,
    title: "Visibilité accrue",
    description: "Les hôtes certifiés apparaissent en priorité dans les résultats de recherche.",
  },
  {
    icon: Star,
    title: "Plus de réservations",
    description: "Les voyageurs préfèrent les logements gérés par des hôtes vérifiés et certifiés.",
  },
  {
    icon: Shield,
    title: "Protection renforcée",
    description: "Bénéficiez d'une assurance et d'une protection supplémentaire sur vos réservations.",
  },
];

const steps = [
  { step: "1", title: "Créez votre compte hôte", description: "Inscrivez-vous et complétez votre profil avec vos informations." },
  { step: "2", title: "Soumettez votre demande", description: "Envoyez les documents requis pour la vérification de votre identité." },
  { step: "3", title: "Vérification en cours", description: "Notre équipe examine votre dossier sous 48h." },
  { step: "4", title: "Certification obtenue", description: "Votre badge certifié est activé sur votre profil !" },
];

const Certification = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Certification d'Hôte
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
              Gagnez la confiance des voyageurs et maximisez vos réservations avec la certification VotreSéjour.
            </p>
            <Button className="rounded-full bg-accent text-accent-foreground font-medium px-8 h-12 text-base hover:bg-amber-dark">
              Demander la certification
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Pourquoi se faire certifier ?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            La certification VotreSéjour vous donne accès à des avantages exclusifs.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Comment obtenir la certification
          </h2>
          <div className="space-y-6">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{item.step}</span>
                </div>
                <div className="bg-card rounded-xl border border-border p-5 flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="rounded-full bg-primary text-primary-foreground font-medium px-8 h-12">
              Commencer la certification
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Certification;
