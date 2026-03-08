import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Shield, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const benefits = [
  { icon: TrendingUp, title: "Gagnez de l'argent", desc: "Transformez votre logement en source de revenus réguliers." },
  { icon: Shield, title: "Réservations sécurisées", desc: "Paiements protégés et vérification des voyageurs." },
  { icon: Star, title: "Visibilité maximale", desc: "Votre annonce visible par des milliers de voyageurs." },
  { icon: Home, title: "Gestion simplifiée", desc: "Dashboard intuitif pour gérer vos logements et réservations." },
];

const BecomeHost = () => {
  const { user, isHost, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBecomeHost = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter d'abord.");
      navigate("/login");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_host: true } as any)
      .eq("id", user.id);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Félicitations ! Vous êtes maintenant hôte sur TerangaSéjour.");
      navigate("/create-listing");
    }
  };

  if (isHost) {
    navigate("/create-listing");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Devenir hôte sur TerangaSéjour
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Publiez votre logement et gagnez de l'argent avec vos locations. Rejoignez des centaines d'hôtes au Sénégal.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleBecomeHost}
              disabled={loading}
              className="rounded-full bg-primary text-primary-foreground px-10 h-14 text-lg font-semibold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Devenir hôte
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              C'est gratuit et sans engagement. Vous pouvez publier votre premier logement immédiatement.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeHost;
