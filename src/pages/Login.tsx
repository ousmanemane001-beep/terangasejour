import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Veuillez remplir tous les champs"); return; }
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
              Content de vous revoir !
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Connectez-vous pour gérer vos réservations, vos logements et plus encore.
            </p>
          </div>

          {/* Social buttons + Create account */}
          <div className="flex flex-col gap-8 mx-auto max-w-[500px] w-full">
            {/* Email / Password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Email"
                className="h-12 rounded-lg border-border bg-background text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="h-12 rounded-lg border-border bg-background text-sm pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
                  Mot de passe oublié
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full h-11 px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm border-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connexion"}
                </Button>
              </div>
            </form>

            {/* Separator */}
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                ou choisissez l'une de ces options
              </p>
            </div>

            {/* Social icon buttons */}
            <SocialLoginButtons variant="icon-only" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">Créer un compte</Link>
              </p>
            </div>
          </div>
      </motion.div>
    </div>
  );
};

export default Login;
