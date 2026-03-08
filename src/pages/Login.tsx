import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-16 bg-warm-gray">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent mx-auto mb-4 flex items-center justify-center">
                <span className="font-display font-bold text-accent-foreground text-lg">S</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Connexion</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Accédez à votre compte Séjour
              </p>
            </div>

            <form className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Adresse email"
                  className="pl-10 rounded-xl h-12"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="pl-10 pr-10 rounded-xl h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded" />
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className="text-accent hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                Se connecter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="text-accent font-medium hover:underline">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Login;
