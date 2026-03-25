import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ShieldCheck, X, Loader2, Image, MapPin, FileText } from "lucide-react";

const AdminVerification = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const qc = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin === true,
  });

  const handleVerify = async (id: string, verified: boolean) => {
    setUpdating(id);
    const { error } = await supabase
      .from("listings")
      .update({ verified })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(verified ? "Logement vérifié !" : "Vérification retirée");
      qc.invalidateQueries({ queryKey: ["admin-listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    }
    setUpdating(null);
  };

  const checkVerifiable = (listing: any) => {
    const issues: string[] = [];
    if (!listing.photos || listing.photos.length < 5) issues.push(`${listing.photos?.length || 0}/5 photos`);
    if (!listing.description || listing.description.length < 20) issues.push("Description trop courte");
    if (!listing.location) issues.push("Localisation manquante");
    return issues;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Vérification des logements</h1>
          <p className="text-muted-foreground mb-8">Vérifiez et approuvez les logements publiés sur la plateforme.</p>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {listings?.map((listing) => {
                const issues = checkVerifiable(listing);
                const canVerify = issues.length === 0;
                return (
                  <Card key={listing.id} className="border-none shadow-[var(--shadow-card)]">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img
                          src={listing.photos?.[0] || "/placeholder.svg"}
                          alt={listing.title}
                          className="w-full md:w-40 h-28 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-display font-semibold text-foreground">{listing.title}</h3>
                                {listing.verified && (
                                  <Badge className="bg-primary/10 text-primary gap-1 border-none text-xs">
                                    <ShieldCheck className="w-3 h-3" /> Vérifié
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {listing.location || "Non précisé"}
                              </p>
                            </div>
                            <span className="font-semibold text-foreground whitespace-nowrap">
                              {listing.price_per_night.toLocaleString("fr-FR")} F/nuit
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Image className="w-3 h-3" /> {listing.photos?.length || 0} photos</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {listing.description?.length || 0} car.</span>
                          </div>

                          {issues.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {issues.map((issue, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">{issue}</Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            {!listing.verified ? (
                              <Button
                                size="sm"
                                className="rounded-full bg-primary text-primary-foreground gap-1"
                                disabled={!canVerify || updating === listing.id}
                                onClick={() => handleVerify(listing.id, true)}
                              >
                                {updating === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                {canVerify ? "Approuver" : "Non éligible"}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full gap-1 text-destructive"
                                disabled={updating === listing.id}
                                onClick={() => handleVerify(listing.id, false)}
                              >
                                {updating === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                Retirer vérification
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(!listings || listings.length === 0) && (
                <p className="text-center text-muted-foreground py-12">Aucun logement publié à vérifier.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminVerification;
