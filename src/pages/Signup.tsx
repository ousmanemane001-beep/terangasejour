import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) { toast.error("Veuillez remplir tous les champs obligatoires"); return; }
    if (!accepted) { toast.error("Veuillez accepter les conditions d'utilisation"); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName, phone } },
    });
    setLoading(false);

    if (error) { toast.error(error.message); }
    else { toast.success("Compte créé ! Vérifiez votre email pour confirmer votre inscription."); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-16 bg-secondary">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-lg">TS</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Créer un compte</h1>
              <p className="text-sm text-muted-foreground mt-1">Rejoignez la communauté TerangaSéjour</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Prénom" className="pl-10 rounded-xl h-12" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Nom" className="pl-10 rounded-xl h-12" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Adresse email" className="pl-10 rounded-xl h-12" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="Numéro de téléphone" className="pl-10 rounded-xl h-12" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="pl-10 pr-10 rounded-xl h-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded mt-0.5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span>J'accepte les <a href="#" className="text-primary hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-primary hover:underline">politique de confidentialité</a></span>
              </label>
              <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Déjà un compte ? <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link></p>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Signup;
