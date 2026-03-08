import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Users, Home, CalendarDays, CreditCard, Star, ShieldCheck, X,
  Loader2, TrendingUp, Eye
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // All users
  const { data: allProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // All listings
  const { data: allListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // All bookings
  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // All reviews
  const { data: allReviews } = useQuery({
    queryKey: ["admin-all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleVerify = async (id: string, verified: boolean) => {
    setUpdatingId(id);
    const { error } = await supabase.from("listings").update({ verified }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(verified ? "Logement vérifié" : "Vérification retirée");
      qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    }
    setUpdatingId(null);
  };

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
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">Accès refusé</h1>
            <Link to="/login"><Button className="rounded-full bg-primary text-primary-foreground">Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalRevenue = allBookings?.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total_price, 0) || 0;
  const platformCommission = Math.round(totalRevenue * 0.15);

  const stats = [
    { label: "Utilisateurs", value: allProfiles?.length || 0, icon: Users },
    { label: "Logements", value: allListings?.length || 0, icon: Home },
    { label: "Réservations", value: allBookings?.length || 0, icon: CalendarDays },
    { label: "Revenus plateforme", value: `${platformCommission.toLocaleString("fr-FR")} F`, icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Administration</h1>
          <p className="text-muted-foreground mb-8">Gérez les utilisateurs, logements, réservations et paiements.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-[var(--shadow-card)]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users">
            <TabsList className="bg-card shadow-[var(--shadow-card)] rounded-xl p-1 mb-6">
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-4 h-4 mr-1.5" /> Utilisateurs</TabsTrigger>
              <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Home className="w-4 h-4 mr-1.5" /> Logements</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CalendarDays className="w-4 h-4 mr-1.5" /> Réservations</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Star className="w-4 h-4 mr-1.5" /> Avis</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Utilisateurs ({allProfiles?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {profilesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-3">
                      {allProfiles?.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div>
                            <p className="font-medium text-foreground text-sm">{[p.first_name, p.last_name].filter(Boolean).join(" ") || "Sans nom"}</p>
                            <p className="text-xs text-muted-foreground">{p.phone || "Pas de téléphone"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_host && <Badge className="bg-primary/10 text-primary border-none text-xs">Hôte</Badge>}
                            <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Logements ({allListings?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-3">
                      {allListings?.map((listing) => {
                        const photoCount = listing.photos?.length || 0;
                        const canVerify = photoCount >= 5 && listing.description && listing.description.length >= 20 && listing.location;
                        return (
                          <div key={listing.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full sm:w-24 h-20 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-foreground text-sm truncate">{listing.title}</p>
                                {listing.verified && <Badge className="bg-primary/10 text-primary border-none text-xs gap-1"><ShieldCheck className="w-3 h-3" /> Vérifié</Badge>}
                                <Badge variant={listing.status === "published" ? "default" : "outline"} className="text-xs">{listing.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{listing.location || "Non précisé"} · {listing.price_per_night.toLocaleString("fr-FR")} F/nuit · {photoCount} photos</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Link to={`/property/${listing.id}`}>
                                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Eye className="w-3 h-3" /> Voir</Button>
                              </Link>
                              {!listing.verified ? (
                                <Button
                                  size="sm"
                                  className="rounded-full bg-primary text-primary-foreground text-xs gap-1"
                                  disabled={!canVerify || updatingId === listing.id}
                                  onClick={() => handleVerify(listing.id, true)}
                                >
                                  {updatingId === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                                  {canVerify ? "Vérifier" : "Non éligible"}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full text-xs text-destructive gap-1"
                                  disabled={updatingId === listing.id}
                                  onClick={() => handleVerify(listing.id, false)}
                                >
                                  <X className="w-3 h-3" /> Retirer
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Réservations ({allBookings?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-3">
                      {allBookings?.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""} · {b.guests} voyageur{b.guests > 1 ? "s" : ""} · {b.payment_method}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"} className="text-xs">
                              {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
                            </Badge>
                            <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                          </div>
                        </div>
                      ))}
                      {(!allBookings || allBookings.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Aucune réservation.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Avis ({allReviews?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allReviews?.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}</span>
                        </div>
                        {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                        {r.owner_reply && (
                          <div className="mt-2 pl-3 border-l-2 border-primary/30">
                            <p className="text-xs text-muted-foreground">Réponse de l'hôte :</p>
                            <p className="text-sm text-foreground">{r.owner_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!allReviews || allReviews.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">Aucun avis.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
