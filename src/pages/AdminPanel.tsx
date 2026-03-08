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
import { useIsAdmin, useNotifications, useMarkAsRead } from "@/hooks/useAdmin";
import { toast } from "sonner";
import {
  Users, Home, CalendarDays, CreditCard, Star, ShieldCheck, X, Check,
  Loader2, TrendingUp, Eye, Bell, Clock, Ban,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, Navigate } from "react-router-dom";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_approval: { label: "En attente", color: "bg-yellow-500/10 text-yellow-700" },
  published: { label: "Approuvé", color: "bg-green-500/10 text-green-700" },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive" },
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  suspended: { label: "Suspendu", color: "bg-destructive/10 text-destructive" },
};

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkAsRead();
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // All users
  const { data: allProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  // All listings (including pending)
  const { data: allListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  // All bookings
  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  // All reviews
  const { data: allReviews } = useQuery({
    queryKey: ["admin-all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleListingAction = async (id: string, action: "approve" | "reject" | "suspend") => {
    setUpdatingId(id);
    const statusMap = { approve: "published", reject: "rejected", suspend: "suspended" };
    const newStatus = statusMap[action];
    const { error } = await supabase.from("listings").update({ status: newStatus, verified: action === "approve" }).eq("id", id);
    if (error) { toast.error(error.message); setUpdatingId(null); return; }

    // Notify the listing owner
    const listing = allListings?.find((l) => l.id === id);
    if (listing) {
      const messages = {
        approve: `Votre logement "${listing.title}" a été approuvé et est maintenant visible.`,
        reject: `Votre logement "${listing.title}" n'a pas été approuvé. Veuillez vérifier les critères.`,
        suspend: `Votre logement "${listing.title}" a été suspendu.`,
      };
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: `listing_${action}`,
        title: action === "approve" ? "Logement approuvé !" : action === "reject" ? "Logement non approuvé" : "Logement suspendu",
        message: messages[action],
        data: { listing_id: id },
      } as any);
    }

    toast.success(action === "approve" ? "Logement approuvé" : action === "reject" ? "Logement rejeté" : "Logement suspendu");
    qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    setUpdatingId(null);
  };

  const pendingListings = allListings?.filter((l) => l.status === "pending_approval") || [];
  const totalRevenue = allBookings?.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total_price, 0) || 0;
  const platformCommission = Math.round(totalRevenue * 0.15);
  const unreadNotifs = notifications?.filter((n) => !n.read).length || 0;

  const stats = [
    { label: "Utilisateurs", value: allProfiles?.length || 0, icon: Users },
    { label: "En attente", value: pendingListings.length, icon: Clock },
    { label: "Réservations", value: allBookings?.length || 0, icon: CalendarDays },
    { label: "Commission", value: `${platformCommission.toLocaleString("fr-FR")} F`, icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground">Administration</h1>
            {unreadNotifs > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{unreadNotifs} notifications</Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-8">Super Admin · Gérez la plateforme TerangaSéjour</p>

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

          <Tabs defaultValue="pending">
            <TabsList className="bg-card shadow-[var(--shadow-card)] rounded-xl p-1 mb-6 flex-wrap">
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="w-4 h-4 mr-1.5" /> En attente {pendingListings.length > 0 && `(${pendingListings.length})`}
              </TabsTrigger>
              <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Home className="w-4 h-4 mr-1.5" /> Logements</TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-4 h-4 mr-1.5" /> Utilisateurs</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CalendarDays className="w-4 h-4 mr-1.5" /> Réservations</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Star className="w-4 h-4 mr-1.5" /> Avis</TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Bell className="w-4 h-4 mr-1.5" /> Notifications</TabsTrigger>
            </TabsList>

            {/* Pending Approvals */}
            <TabsContent value="pending">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Logements en attente d'approbation</CardTitle></CardHeader>
                <CardContent>
                  {pendingListings.length > 0 ? (
                    <div className="space-y-4">
                      {pendingListings.map((listing) => {
                        const photoCount = listing.photos?.length || 0;
                        const hasEnoughPhotos = photoCount >= 5;
                        const hasDesc = listing.description && listing.description.length >= 20;
                        const hasLocation = !!listing.location;
                        const canApprove = hasEnoughPhotos && hasDesc && hasLocation;
                        return (
                          <div key={listing.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{listing.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{listing.location || "Non précisé"} · {listing.price_per_night.toLocaleString("fr-FR")} F/nuit</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge className={hasEnoughPhotos ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>{photoCount}/5 photos</Badge>
                                <Badge className={hasDesc ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>Description {hasDesc ? "✓" : "✗"}</Badge>
                                <Badge className={hasLocation ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>Localisation {hasLocation ? "✓" : "✗"}</Badge>
                                <Badge className="bg-muted text-muted-foreground border-none text-xs">
                                  {(listing as any).booking_mode === "request" ? "📩 Sur demande" : "⚡ Instantané"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0 self-center">
                              <Link to={`/property/${listing.id}`}>
                                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Eye className="w-3 h-3" /></Button>
                              </Link>
                              <Button
                                size="sm"
                                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                                disabled={!canApprove || updatingId === listing.id}
                                onClick={() => handleListingAction(listing.id, "approve")}
                              >
                                {updatingId === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs text-destructive gap-1"
                                disabled={updatingId === listing.id}
                                onClick={() => handleListingAction(listing.id, "reject")}
                              >
                                <X className="w-3 h-3" /> Rejeter
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-center text-muted-foreground py-8">Aucun logement en attente.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Listings */}
            <TabsContent value="listings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Tous les logements ({allListings?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-3">
                      {allListings?.map((listing) => {
                        const st = statusLabels[listing.status] || { label: listing.status, color: "bg-muted text-muted-foreground" };
                        return (
                          <div key={listing.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full sm:w-24 h-20 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-medium text-foreground text-sm truncate">{listing.title}</p>
                                <Badge className={`${st.color} border-none text-xs`}>{st.label}</Badge>
                                {listing.verified && <Badge className="bg-primary/10 text-primary border-none text-xs gap-1"><ShieldCheck className="w-3 h-3" /> Vérifié</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{listing.location || "Non précisé"} · {listing.price_per_night.toLocaleString("fr-FR")} F/nuit</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Link to={`/property/${listing.id}`}>
                                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Eye className="w-3 h-3" /> Voir</Button>
                              </Link>
                              {listing.status === "published" && (
                                <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1" disabled={updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "suspend")}>
                                  <Ban className="w-3 h-3" /> Suspendre
                                </Button>
                              )}
                              {(listing.status === "rejected" || listing.status === "suspended") && (
                                <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs gap-1" disabled={updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "approve")}>
                                  <Check className="w-3 h-3" /> Réactiver
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

            {/* Users */}
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

            {/* Bookings */}
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
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""} · {b.payment_method}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"} className="text-xs">
                              {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
                            </Badge>
                            <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                          </div>
                        </div>
                      ))}
                      {(!allBookings || allBookings.length === 0) && <p className="text-center text-muted-foreground py-8">Aucune réservation.</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Avis ({allReviews?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allReviews?.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}</span>
                        </div>
                        {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                      </div>
                    ))}
                    {(!allReviews || allReviews.length === 0) && <p className="text-center text-muted-foreground py-8">Aucun avis.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Notifications</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications && notifications.length > 0 ? notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl transition-colors cursor-pointer ${n.read ? "bg-muted/30" : "bg-primary/5 border border-primary/10"}`}
                        onClick={() => !n.read && markAsRead.mutate(n.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground text-sm">{n.title}</p>
                          <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "d MMM HH:mm", { locale: fr })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                        {!n.read && <Badge className="mt-2 bg-primary/10 text-primary border-none text-xs">Non lu</Badge>}
                      </div>
                    )) : <p className="text-center text-muted-foreground py-8">Aucune notification.</p>}
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
