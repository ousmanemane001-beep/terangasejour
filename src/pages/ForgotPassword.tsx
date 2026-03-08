import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
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
              <div className="w-12 h-12 rounded-xl bg-accent/10 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Mot de passe oublié</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <form className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Adresse email" className="pl-10 rounded-xl h-12" />
              </div>
              <Button className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                Envoyer le lien
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
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
