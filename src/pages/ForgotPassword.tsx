import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Veuillez entrer votre adresse email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Un lien de réinitialisation a été envoyé à votre email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-16 bg-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Mot de passe oublié</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {sent
                  ? "Vérifiez votre boîte de réception et cliquez sur le lien reçu."
                  : "Entrez votre email pour recevoir un lien de réinitialisation"}
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Adresse email"
                    className="pl-10 rounded-xl h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le lien"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Vous n'avez pas reçu l'email ?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="rounded-xl"
                >
                  Réessayer
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
