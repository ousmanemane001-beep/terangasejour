import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Home, Camera, MapPin, DollarSign, Bed, Bath, Users, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Home,
    title: "Décrivez votre logement",
    description: "Type de propriété, nombre de chambres, équipements disponibles",
  },
  {
    icon: Camera,
    title: "Ajoutez des photos",
    description: "Des photos de qualité attirent plus de voyageurs",
  },
  {
    icon: DollarSign,
    title: "Fixez votre prix",
    description: "Définissez un tarif compétitif par nuit",
  },
  {
    icon: CheckCircle,
    title: "Publiez et recevez",
    description: "Votre annonce est en ligne, les réservations arrivent !",
  },
];

const Publish = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Publiez votre logement
          </motion.h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">
            Comment ça marche
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-foreground text-sm font-bold">{i + 1}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Informations sur votre logement
          </h2>
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce</label>
                <Input placeholder="Ex: Belle villa avec piscine à Saly" className="rounded-xl h-12" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <Textarea placeholder="Décrivez votre logement en détail..." rows={4} className="rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type de logement</label>
                  <select className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm">
                    <option>Villa</option>
                    <option>Appartement</option>
                    <option>Maison d'hôtes</option>
                    <option>Lodge</option>
                    <option>Loft</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Localisation
                  </label>
                  <Input placeholder="Ville, quartier" className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bed className="w-3.5 h-3.5 inline mr-1" />
                    Chambres
                  </label>
                  <Input type="number" min={1} defaultValue={1} className="rounded-xl h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bath className="w-3.5 h-3.5 inline mr-1" />
                    Salles de bain
                  </label>
                  <Input type="number" min={1} defaultValue={1} className="rounded-xl h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1" />
                    Capacité
                  </label>
                  <Input type="number" min={1} defaultValue={2} className="rounded-xl h-12" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                  Prix par nuit (FCFA)
                </label>
                <Input type="number" placeholder="Ex: 45000" className="rounded-xl h-12" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  Photos
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez ou glissez vos photos ici
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG • Max 10 photos • 5 Mo par photo
                  </p>
                </div>
              </div>

              <Button className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                Publier mon logement
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Publish;
