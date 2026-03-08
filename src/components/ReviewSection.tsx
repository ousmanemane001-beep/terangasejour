import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useReviews, useCreateReview } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReviewSectionProps {
  listingId: string;
}

const ReviewSection = ({ listingId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews(listingId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (!user) { toast.error("Connectez-vous pour laisser un avis."); return; }
    try {
      await createReview.mutateAsync({ listing_id: listingId, user_id: user.id, rating, comment: comment.trim() || undefined });
      setComment(""); setShowForm(false); toast.success("Avis publié !");
    } catch (err: any) { toast.error(err.message || "Erreur lors de la publication."); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 fill-primary text-primary" />
          {avgRating ? `${avgRating} · ${reviews?.length} avis` : "Avis"}
        </h2>
        {user && !showForm && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowForm(true)}>Laisser un avis</Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(n)}>
                <Star className={`w-6 h-6 transition-colors ${n <= (hoverRating || rating) ? "fill-primary text-primary" : "text-border"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Partagez votre expérience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="rounded-xl mb-3" />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full bg-primary text-primary-foreground" onClick={handleSubmit} disabled={createReview.isPending}>
              {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Publier
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-5">
          {reviews.map((review) => {
            const profile = review.profiles;
            const initials = profile ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "?" : "?";
            const name = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Voyageur" : "Voyageur";
            return (
              <div key={review.id} className="flex gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "d MMM yyyy", { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">Aucun avis pour le moment.</p>
      )}
    </div>
  );
};

export default ReviewSection;
