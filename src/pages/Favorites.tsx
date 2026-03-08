import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: favorites, isLoading } = useFavorites();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-secondary">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">Connectez-vous</h1>
            <p className="text-muted-foreground mb-6">Connectez-vous pour voir vos logements favoris.</p>
            <Link to="/login"><Button className="rounded-full bg-primary text-primary-foreground">Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const listings = favorites?.map((f: any) => f.listings).filter(Boolean) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Mes favoris</h1>
          <p className="text-muted-foreground mb-8">Les logements que vous avez sauvegardés</p>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Aucun favori</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explorez les logements et cliquez sur le cœur pour les sauvegarder.
              </p>
              <Link to="/explore">
                <Button className="rounded-full bg-primary text-primary-foreground">Explorer les logements</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
