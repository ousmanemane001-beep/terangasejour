import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Veuillez entrer votre adresse e-mail"); return; }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer une adresse e-mail valide");
      return;
    }
    setStep("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error("Veuillez entrer un mot de passe"); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) { 
      toast.error(error.message); 
    } else { 
      toast.success("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center py-10 md:py-20 px-5 w-full bg-background">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[500px] w-full py-10"
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/">
              <span className="font-display text-3xl font-bold text-primary">TerangaSéjour</span>
            </Link>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Créer un compte
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Rejoignez TerangaSéjour pour réserver vos prochains séjours.
            </p>
          </div>

          <div className="flex flex-col gap-8 mx-auto max-w-[500px] w-full">
            {step === "email" ? (
              <>
                {/* Social buttons + Login link */}
                <div className="flex justify-center md:justify-between gap-4 flex-wrap w-full items-center">
                  <SocialLoginButtons variant="google-only" />
                  <Link
                    to="/login"
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    Se connecter
                  </Link>
                </div>

                {/* Separator */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    ou créer un compte avec votre e-mail
                  </p>
                </div>

                {/* Email form */}
                <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
                  <Input
                    type="email"
                    placeholder="Adresse e-mail"
                    className="h-12 rounded-lg border-border bg-background text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm border-0"
                  >
                    Continuer avec une adresse e-mail
                  </Button>
                </form>

                {/* Terms */}
                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  En créant un compte, vous acceptez nos{" "}
                  <Link to="#" className="text-primary underline">Conditions générales</Link> et notre{" "}
                  <Link to="#" className="text-primary underline">Politique de confidentialité</Link>.
                </p>
              </>
            ) : (
              <>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-primary hover:underline self-start flex items-center gap-1"
                >
                  ← Retour
                </button>

                {/* Password step */}
                <div className="flex flex-col gap-2 text-center -mt-4">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Créez votre mot de passe
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pour le compte <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe (6 caractères minimum)"
                      className="h-12 rounded-lg border-border bg-background text-sm pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm border-0"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
                  </Button>
                </form>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Vous pourrez compléter votre profil (nom, téléphone) après la création de votre compte.
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
