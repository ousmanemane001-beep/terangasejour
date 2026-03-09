import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqVoyageurs = [
  {
    q: "Comment fonctionne TerangaSéjour pour les voyageurs ?",
    a: [
      "Recherchez un logement en utilisant nos filtres (localisation, prix, équipements, etc.).",
      "Consultez les annonces détaillées, les avis et les photos des logements.",
      "Réservez en toute sécurité via notre plateforme.",
      "Échangez avec votre hôte pour organiser votre arrivée.",
      "Profitez de votre séjour comme si vous étiez chez vous !",
    ],
  },
];

const faqHotes = [
  {
    q: "Comment devenir hôte sur TerangaSéjour ?",
    a: [
      "Créez votre annonce en ajoutant des photos, une description et les équipements disponibles.",
      "Fixez vos conditions (prix, règles du logement, disponibilités).",
      "Publiez votre logement et recevez des demandes de réservation.",
      "Accueillez vos voyageurs et partagez une expérience unique avec eux.",
    ],
    extra: "Vous avez également la possibilité de certifier votre profil pour rassurer les voyageurs et maximiser vos réservations.",
  },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    toast({ title: "Message envoyé", description: "Nous vous répondrons dans les plus brefs délais." });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Contact form — sejour.sn style */}
      <section className="py-14 md:py-20 flex-1">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Contactez-nous
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-8 text-sm md:text-base"
          >
            Une question, une suggestion ou besoin d'aide ? Nous sommes là pour vous accompagner.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border-border bg-background text-sm"
              />
              <Input
                placeholder="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border-border bg-background text-sm"
              />
            </div>
            <Textarea
              placeholder="Votre message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-lg border-border bg-background text-sm resize-none"
            />
            <Button
              type="submit"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-10 h-11 text-sm font-semibold"
            >
              Envoyer le message
            </Button>
          </motion.form>
        </div>
      </section>

      {/* FAQ — sejour.sn style */}
      <section className="py-14 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-primary mb-2"
          >
            Questions fréquentes
          </motion.h2>
          <p className="text-muted-foreground mb-10 text-sm">
            Vous trouverez ici les réponses aux questions les plus courantes sur notre plateforme.
          </p>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Voyageurs */}
            <div>
              {faqVoyageurs.map((faq, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    TerangaSéjour vous permet de trouver et réserver un logement en toute simplicité :
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                    {faq.a.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {/* Hôtes */}
            <div>
              {faqHotes.map((faq, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Devenir hôte sur TerangaSéjour est rapide et simple :
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                    {faq.a.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                  {faq.extra && (
                    <p className="text-sm text-muted-foreground mt-3">{faq.extra}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
