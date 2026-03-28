import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Shield, Star, Loader2, CheckCircle, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const BecomeHost = () => {
  const { user, isHost, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [justBecameHost, setJustBecameHost] = useState(false);
  const { t } = useTranslation();

  const benefits = [
    { icon: TrendingUp, title: t("becomeHost.earnMoney"), desc: t("becomeHost.earnMoneyDesc") },
    { icon: Shield, title: t("becomeHost.secureBookings"), desc: t("becomeHost.secureBookingsDesc") },
    { icon: Star, title: t("becomeHost.maxVisibility"), desc: t("becomeHost.maxVisibilityDesc") },
    { icon: Home, title: t("becomeHost.easyManagement"), desc: t("becomeHost.easyManagementDesc") },
  ];

  const handleBecomeHost = async () => {
    if (!user) {
      toast.error(t("becomeHost.loginFirst"));
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
      setJustBecameHost(true);
      toast.success(t("becomeHost.congrats"));
    }
  };

  if (isHost || justBecameHost) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 bg-secondary flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-lg mx-auto px-4 py-16"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("becomeHost.welcomeTitle")}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t("becomeHost.welcomeDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/create-listing")}
                className="rounded-full bg-primary text-primary-foreground px-8 h-12 text-base font-semibold gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                {t("becomeHost.publishListing")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="rounded-full px-8 h-12 text-base font-semibold"
              >
                {t("becomeHost.myDashboard")}
              </Button>
            </div>
          </motion.div>
        </section>
        <Footer />
      </div>
    );
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
              {t("becomeHost.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t("becomeHost.subtitle")}
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
              Cliquez ici
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              {t("becomeHost.freeNoCommitment")}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeHost;
