import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Veuillez entrer votre adresse e-mail"); return; }
    setStep("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error("Veuillez entrer votre mot de passe"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect"
        : error.message === "Email not confirmed" ? "Veuillez confirmer votre email"
        : error.message);
    } else {
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            {step === "email" ? (
              <>
                <h1 className="font-display text-xl font-bold text-foreground mb-1">
                  Se connecter ou créer un compte
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Accédez à vos réservations et gérez vos voyages facilement.
                </p>

                <form onSubmit={handleEmailContinue} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Adresse e-mail</label>
                    <Input
                      type="email"
                      placeholder="Entrez votre adresse e-mail"
                      className="rounded-md h-11 border-border"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-md h-11 bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    Continuer avec une adresse e-mail
                  </Button>
                </form>

                {/* Separator */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">ou choisissez une option</span>
                  </div>
                </div>

                {/* Social icons row */}
                <SocialLoginButtons variant="icon-only" />

                {/* Terms */}
                <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
                  En vous connectant ou en créant un compte, vous acceptez nos{" "}
                  <Link to="#" className="text-primary underline">Conditions générales</Link> et notre{" "}
                  <Link to="#" className="text-primary underline">Politique de confidentialité</Link>.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
                >
                  ← Retour
                </button>
                <h1 className="font-display text-xl font-bold text-foreground mb-1">
                  Entrez votre mot de passe
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Pour le compte <span className="font-medium text-foreground">{email}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                    <Input
                      type="password"
                      placeholder="Entrez votre mot de passe"
                      className="rounded-md h-11 border-border"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md h-11 bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
                  </Button>
                  <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Login;
