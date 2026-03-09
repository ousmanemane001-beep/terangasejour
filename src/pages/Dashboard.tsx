import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home, CalendarDays, Star, TrendingUp, Plus, Settings,
  CreditCard, MapPin, Loader2, Eye, Trash2, Heart, MessageCircle, Pencil, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerListings, useOwnerBookings, useGuestBookings } from "@/hooks/useOwnerData";
import { useFavorites } from "@/hooks/useFavorites";
import { useListingsRatings } from "@/hooks/useReviews";
import { useBookingRequests, useRespondToRequest, useNotifications, useMarkAsRead } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import BlockedDatesCalendar from "@/components/BlockedDatesCalendar";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmée", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
  published: { label: "Actif", variant: "default" },
  pending_approval: { label: "En attente d'approbation", variant: "secondary" },
  needs_modification: { label: "Modification demandée", variant: "destructive" },
  rejected: { label: "Rejeté", variant: "destructive" },
  suspended: { label: "Suspendu", variant: "destructive" },
  draft: { label: "Brouillon", variant: "outline" },
};

const Dashboard = () => {
  const { user, loading: authLoading, isHost, isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const qc = useQueryClient();
  const { data: listings, isLoading: listingsLoading } = useOwnerListings();
  const { data: ownerBookings, isLoading: bookingsLoading } = useOwnerBookings();
  const { data: guestBookings } = useGuestBookings();
  const { data: favorites } = useFavorites();
  const { data: bookingRequests } = useBookingRequests();
  const respondToRequest = useRespondToRequest();
  const { data: notifications } = useNotifications();

  const activeTab = tab || (isHost ? "overview" : "my-bookings");

  // Ratings for listings
  const listingIds = listings?.map((l) => l.id) || [];
  const { data: ratingsMap } = useListingsRatings(listingIds);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  // Redirect Super Admin to admin panel
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-secondary">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">Connectez-vous</h1>
            <p className="text-muted-foreground mb-6">Accédez à votre espace pour gérer vos réservations.</p>
            <Link to="/login"><Button className="rounded-full bg-primary text-primary-foreground">Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || 
    [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") || "Utilisateur";
  const initials = `${(profile?.first_name || user.user_metadata?.first_name || "")[0] || ""}${(profile?.last_name || user.user_metadata?.last_name || "")[0] || ""}`.toUpperCase() || "U";

  const activeListings = listings?.filter((l) => l.status === "published") || [];
  const totalEarnings = ownerBookings?.filter((b) => b.status === "confirmed" || b.status === "pending").reduce((sum, b) => sum + b.total_price, 0) || 0;
  const thisMonthBookings = ownerBookings?.filter((b) => {
    const d = new Date(b.created_at); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }) || [];

  // Compute average rating
  const allRatings = ratingsMap ? Object.values(ratingsMap) : [];
  const avgRating = allRatings.length > 0
    ? (allRatings.reduce((s, r) => s + (r.avg || 0), 0) / allRatings.length).toFixed(1)
    : "—";
  const totalReviews = allRatings.reduce((s, r) => s + r.count, 0);

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Supprimer ce logement ?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Logement supprimé");
    qc.invalidateQueries({ queryKey: ["owner-listings"] });
  };

  const hostTabs = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "properties", label: "Mes logements", icon: Home },
    { id: "reservations", label: "Réservations reçues", icon: CalendarDays },
    { id: "requests", label: "Demandes", icon: CalendarDays },
    { id: "revenue", label: "Revenus", icon: CreditCard },
    { id: "calendar", label: "Calendrier", icon: CalendarDays },
  ];

  const commonTabs = [
    { id: "my-bookings", label: "Mes réservations", icon: CalendarDays },
    { id: "favorites", label: "Favoris", icon: Heart },
  ];

  const tabs = [...(isHost ? hostTabs : []), ...commonTabs];

  const statCards = [
    { label: "Logements actifs", value: String(activeListings.length), icon: Home, trend: `${listings?.length || 0} total`, tab: "properties", color: "bg-blue-500/10 text-blue-600" },
    { label: "Réservations reçues", value: String(ownerBookings?.length || 0), icon: CalendarDays, trend: `${thisMonthBookings.length} ce mois`, tab: "reservations", color: "bg-green-500/10 text-green-600" },
    { label: "Revenus totaux", value: `${totalEarnings.toLocaleString("fr-FR")} F`, icon: CreditCard, trend: "FCFA", tab: "revenue", color: "bg-primary/10 text-primary" },
    { label: "Note moyenne", value: avgRating, icon: Star, trend: `${totalReviews} avis`, tab: "reviews", color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Bonjour, {displayName} 👋</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {isHost ? "Espace hôte · Gérez vos logements et réservations" : "Espace voyageur · Gérez vos réservations et favoris"}
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <Link to="/messages">
                <Button variant="outline" size="sm" className="rounded-full gap-2 hover:scale-105 transition-transform"><MessageCircle className="w-4 h-4" /> Messages</Button>
              </Link>
              {isHost ? (
                <Link to="/create-listing">
                  <Button size="sm" className="rounded-full bg-primary text-primary-foreground gap-2 hover:scale-105 transition-transform"><Plus className="w-4 h-4" /> Nouveau logement</Button>
                </Link>
              ) : (
                <Link to="/become-host">
                  <Button size="sm" className="rounded-full bg-primary text-primary-foreground gap-2 hover:scale-105 transition-transform"><Home className="w-4 h-4" /> Devenir hôte</Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="outline" size="sm" className="rounded-full gap-2 hover:scale-105 transition-transform"><Settings className="w-4 h-4" /> Profil</Button>
              </Link>
            </div>
          </div>

          {/* Host Stats - Clickable Cards */}
          {isHost && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card
                    className="border-none shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.02] transition-all duration-300 group"
                    onClick={() => navigate(`/dashboard/${stat.tab}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {stat.trend}</span>
                      </div>
                      <p className="font-display text-2xl font-bold text-foreground leading-none mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-card rounded-xl p-1 shadow-[var(--shadow-card)] flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(t.id === (isHost ? "overview" : "my-bookings") ? "/dashboard" : `/dashboard/${t.id}`)}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02] whitespace-nowrap shrink-0",
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {isHost && activeTab === "overview" && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Réservations récentes</CardTitle></CardHeader>
                <CardContent>
                  {ownerBookings && ownerBookings.length > 0 ? (
                    <div className="space-y-3">
                      {ownerBookings.slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => navigate("/dashboard/reservations")}>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""}</p>
                          </div>
                          <Badge variant={statusMap[b.status]?.variant || "secondary"}>{statusMap[b.status]?.label || b.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-sm py-4">Aucune réservation reçue.</p>}
                </CardContent>
              </Card>
              <Card className="border-none shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow" onClick={() => navigate("/dashboard/revenue")}>
                <CardHeader><CardTitle className="font-display text-lg">Revenus</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-bold text-foreground mb-2">{totalEarnings.toLocaleString("fr-FR")} F</p>
                  <p className="text-sm text-muted-foreground">Revenus totaux cumulés</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">Ce mois: <span className="font-semibold text-foreground">
                      {thisMonthBookings.reduce((s, b) => s + b.total_price, 0).toLocaleString("fr-FR")} F
                    </span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isHost && activeTab === "properties" && (
            <>
              {listingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings?.map((listing, i) => (
                    <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-none shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01] transition-all duration-300 group">
                        <div className="relative cursor-pointer" onClick={() => navigate(`/property/${listing.id}`)}>
                          <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <Badge className={`absolute top-3 left-3 ${listing.status === "published" ? "bg-primary text-primary-foreground" : listing.status === "pending_approval" ? "bg-amber-500/90 text-white" : listing.status === "needs_modification" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
                            {statusMap[listing.status]?.label || listing.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4 space-y-2.5">
                          <h3 className="font-display font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary/60" /> {listing.location || "Non précisé"}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="font-bold text-foreground">{listing.price_per_night.toLocaleString("fr-FR")} F<span className="text-xs text-muted-foreground font-normal"> /nuit</span></span>
                            {ratingsMap?.[listing.id] && (
                              <span className="flex items-center gap-1 text-sm bg-primary/5 px-2 py-0.5 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                                <span className="font-semibold text-foreground">{ratingsMap[listing.id].avg}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button variant="outline" size="sm" className="rounded-full flex-1 text-xs gap-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/property/${listing.id}`)}><Eye className="w-3 h-3" /> Voir</Button>
                            <Button variant="outline" size="sm" className="rounded-full flex-1 text-xs gap-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate(`/edit-listing/${listing.id}`)}><Pencil className="w-3 h-3" /> Modifier</Button>
                            <Button variant="outline" size="sm" className="rounded-full text-xs text-destructive gap-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleDeleteListing(listing.id)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                          {/* Admin remark */}
                          {(listing as any).admin_remark && (
                            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground">{(listing as any).admin_remark}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  <Link to="/create-listing" className="flex items-center justify-center">
                    <Card className="border-2 border-dashed border-border hover:border-primary hover:scale-[1.02] transition-all duration-300 w-full h-full min-h-[320px] flex items-center justify-center cursor-pointer group">
                      <CardContent className="text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Plus className="w-7 h-7 text-primary" /></div>
                        <p className="font-display font-semibold text-foreground text-lg">Ajouter un logement</p>
                        <p className="text-sm text-muted-foreground mt-1">Créez une nouvelle annonce</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}
            </>
          )}

          {isHost && activeTab === "reservations" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Réservations reçues</CardTitle></CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : ownerBookings && ownerBookings.length > 0 ? (
                  <div className="space-y-4">
                    {ownerBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}
                          </p>
                          <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""} · {b.guests} voyageur{b.guests > 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusMap[b.status]?.variant || "secondary"}>{statusMap[b.status]?.label || b.status}</Badge>
                          <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">Aucune réservation reçue.</p>}
              </CardContent>
            </Card>
          )}

          {isHost && activeTab === "requests" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Demandes de réservation</CardTitle></CardHeader>
              <CardContent>
                {bookingRequests && bookingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {bookingRequests.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {format(new Date(req.check_in), "d MMM", { locale: fr })} → {format(new Date(req.check_out), "d MMM yyyy", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">{req.guests} voyageur{req.guests > 1 ? "s" : ""}</p>
                            {req.message && <p className="text-xs text-foreground mt-1 italic">"{req.message}"</p>}
                          </div>
                          <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"} className="text-xs">
                            {req.status === "approved" ? "Approuvée" : req.status === "rejected" ? "Rejetée" : "En attente"}
                          </Badge>
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="rounded-full bg-primary text-primary-foreground text-xs gap-1"
                              disabled={respondToRequest.isPending}
                              onClick={() => respondToRequest.mutate({ requestId: req.id, status: "approved" })}
                            >
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs text-destructive gap-1"
                              disabled={respondToRequest.isPending}
                              onClick={() => respondToRequest.mutate({ requestId: req.id, status: "rejected" })}
                            >
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">Aucune demande de réservation.</p>}
              </CardContent>
            </Card>
          )}

          {isHost && activeTab === "revenue" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Revenus</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Revenus totaux</p>
                    <p className="font-display text-3xl font-bold text-foreground">{totalEarnings.toLocaleString("fr-FR")} F</p>
                  </div>
                  <div className="p-6 rounded-xl bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Ce mois</p>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {thisMonthBookings.reduce((s, b) => s + b.total_price, 0).toLocaleString("fr-FR")} F
                    </p>
                  </div>
                </div>
                {ownerBookings && ownerBookings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-display font-semibold text-foreground mb-4">Historique des transactions</h4>
                    <div className="space-y-3">
                      {ownerBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(b.check_in), "d MMM", { locale: fr })} – {format(new Date(b.check_out), "d MMM", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""}</p>
                          </div>
                          <span className="font-semibold text-foreground">{b.total_price.toLocaleString("fr-FR")} F</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isHost && activeTab === "reviews" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Avis sur mes logements</CardTitle></CardHeader>
              <CardContent>
                {activeListings.length > 0 ? (
                  <div className="space-y-4">
                    {activeListings.map((listing) => {
                      const r = ratingsMap?.[listing.id];
                      return (
                        <div key={listing.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/property/${listing.id}`)}>
                          <div className="flex items-center gap-3">
                            <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{listing.title}</p>
                              <p className="text-xs text-muted-foreground">{listing.location || "Non précisé"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {r && r.avg !== null ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-primary text-primary" />
                                  <span className="font-semibold text-foreground">{r.avg}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{r.count} avis</p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">Aucun avis</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">Aucun logement publié.</p>}
              </CardContent>
            </Card>
          )}

          {isHost && activeTab === "calendar" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Calendrier de disponibilité</CardTitle></CardHeader>
              <CardContent>
                {listings && listings.length > 0 ? (
                  <div className="space-y-8">
                    {listings.filter((l) => l.status === "published").map((listing) => (
                      <div key={listing.id}>
                        <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {listing.title}
                        </h4>
                        <BlockedDatesCalendar listingId={listing.id} />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">Aucun logement publié.</p>}
              </CardContent>
            </Card>
          )}

          {activeTab === "my-bookings" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Mes réservations</CardTitle></CardHeader>
              <CardContent>
                {guestBookings && guestBookings.length > 0 ? (
                  <div className="space-y-4">
                    {guestBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/property/${b.listing_id}`)}>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}
                          </p>
                          <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusMap[b.status]?.variant || "secondary"}>{statusMap[b.status]?.label || b.status}</Badge>
                          <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">Vous n'avez pas encore de réservation.</p>}
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardHeader><CardTitle className="font-display text-lg">Mes favoris</CardTitle></CardHeader>
              <CardContent>
                {favorites && favorites.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((f: any) => f.listings && (
                      <Link key={f.id} to={`/property/${f.listings.id}`} className="block rounded-xl overflow-hidden border border-border hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                        <img src={f.listings.photos?.[0] || "/placeholder.svg"} alt={f.listings.title} className="w-full h-36 object-cover" />
                        <div className="p-3">
                          <h4 className="font-medium text-foreground text-sm line-clamp-1">{f.listings.title}</h4>
                          <p className="text-xs text-muted-foreground">{f.listings.price_per_night?.toLocaleString("fr-FR")} F / nuit</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun favori sauvegardé.</p>
                    <Link to="/explore"><Button variant="outline" className="rounded-full mt-3 cursor-pointer hover:scale-105 transition-transform" size="sm">Explorer</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
