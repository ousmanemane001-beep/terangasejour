import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const faqVoyageurs = {
  fr: [
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
  ],
  en: [
    {
      q: "How does TerangaSéjour work for travelers?",
      a: [
        "Search for accommodation using our filters (location, price, amenities, etc.).",
        "Browse detailed listings, reviews, and photos.",
        "Book securely through our platform.",
        "Chat with your host to organize your arrival.",
        "Enjoy your stay as if you were at home!",
      ],
    },
  ],
};

const faqHotes = {
  fr: [
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
  ],
  en: [
    {
      q: "How to become a host on TerangaSéjour?",
      a: [
        "Create your listing by adding photos, a description, and available amenities.",
        "Set your conditions (price, house rules, availability).",
        "Publish your property and receive booking requests.",
        "Welcome your travelers and share a unique experience with them.",
      ],
      extra: "You can also certify your profile to reassure travelers and maximize your bookings.",
    },
  ],
};

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "fr";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: t("contact.fillAllFields"), variant: "destructive" });
      return;
    }
    toast({ title: t("contact.success") });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="py-14 md:py-20 flex-1">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            {t("contact.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-8 text-sm md:text-base"
          >
            {t("contact.subtitle")}
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
                placeholder={t("contact.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border-border bg-background text-sm"
              />
              <Input
                placeholder={t("contact.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border-border bg-background text-sm"
              />
            </div>
            <Textarea
              placeholder={t("contact.message")}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-lg border-border bg-background text-sm resize-none"
            />
            <Button
              type="submit"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-11 text-sm font-semibold"
            >
              {t("contact.send")}
            </Button>
          </motion.form>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-primary mb-2"
          >
            {t("contact.faqTravelers")}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-8">
            <div>
              {faqVoyageurs[lang].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">{faq.q}</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                    {faq.a.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div>
              {faqHotes[lang].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">{faq.q}</h3>
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
