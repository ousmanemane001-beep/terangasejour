import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
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
              <h1 className="font-display text-2xl font-bold text-foreground">Créer un compte</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Rejoignez la communauté Séjour
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Prénom" className="pl-10 rounded-xl h-12" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Nom" className="pl-10 rounded-xl h-12" />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Adresse email" className="pl-10 rounded-xl h-12" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="Numéro de téléphone" className="pl-10 rounded-xl h-12" />
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

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded mt-0.5" />
                <span>
                  J'accepte les{" "}
                  <a href="#" className="text-accent hover:underline">conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-accent hover:underline">politique de confidentialité</a>
                </span>
              </label>

              <Button className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                Créer mon compte
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Se connecter
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

export default Signup;
