import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleFavorite, useIsFavorite } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

const FavoriteButton = ({ listingId, className }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isFavorite } = useIsFavorite(listingId);
  const { mutate: toggleFavorite, isPending } = useToggleFavorite();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Connectez-vous pour sauvegarder vos favoris");
      navigate("/login");
      return;
    }

    toggleFavorite(listingId, {
      onSuccess: ({ added }) => {
        toast.success(added ? "Ajouté aux favoris" : "Retiré des favoris");
      },
      onError: () => {
        toast.error("Une erreur est survenue");
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background hover:scale-110 transition-all duration-200",
        className
      )}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-colors",
          isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
        )}
      />
    </button>
  );
};

export default FavoriteButton;
