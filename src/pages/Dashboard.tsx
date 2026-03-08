import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home, CalendarDays, Star, TrendingUp, Plus, Settings,
  CreditCard, MapPin, Loader2, Eye, Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerListings, useOwnerBookings, useGuestBookings } from "@/hooks/useOwnerData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmée", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
  published: { label: "Actif", variant: "default" },
  draft: { label: "Brouillon", variant: "outline" },
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: listings, isLoading: listingsLoading } = useOwnerListings();
  const { data: ownerBookings, isLoading: bookingsLoading } = useOwnerBookings();
  const { data: guestBookings } = useGuestBookings();

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
            <p className="text-muted-foreground mb-6">Accédez à votre espace pour gérer vos logements et réservations.</p>
            <Link to="/login"><Button className="rounded-full bg-primary text-primary-foreground">Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = `${(user.user_metadata?.first_name || "")[0] || ""}${(user.user_metadata?.last_name || "")[0] || ""}`.toUpperCase() || "U";
  const displayName = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") || "Utilisateur";

  const activeListings = listings?.filter((l) => l.status === "published") || [];
  const totalEarnings = ownerBookings?.filter((b) => b.status === "confirmed" || b.status === "pending").reduce((sum, b) => sum + b.total_price, 0) || 0;
  const thisMonthBookings = ownerBookings?.filter((b) => {
    const d = new Date(b.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }) || [];

  const stats = [
    { label: "Logements actifs", value: String(activeListings.length), icon: Home, trend: `${listings?.length || 0} total` },
    { label: "Réservations reçues", value: String(ownerBookings?.length || 0), icon: CalendarDays, trend: `${thisMonthBookings.length} ce mois` },
    { label: "Revenus totaux", value: `${totalEarnings.toLocaleString("fr-FR")} F`, icon: CreditCard, trend: "FCFA" },
    { label: "Mes voyages", value: String(guestBookings?.length || 0), icon: Star, trend: "réservations" },
  ];

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Supprimer ce logement ?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Logement supprimé");
    qc.invalidateQueries({ queryKey: ["owner-listings"] });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Bonjour, {displayName} 👋</h1>
                <p className="text-muted-foreground text-sm">Voici un aperçu de votre activité</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/create-listing">
                <Button className="rounded-full bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Nouveau logement</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="rounded-full gap-2"><Settings className="w-4 h-4" /> Profil</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {stat.trend}</span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="bg-card rounded-xl p-1 shadow-[var(--shadow-card)]">
              <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarDays className="w-4 h-4 mr-2" /> Réservations
              </TabsTrigger>
              <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Home className="w-4 h-4 mr-2" /> Mes logements
              </TabsTrigger>
              <TabsTrigger value="trips" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="w-4 h-4 mr-2" /> Mes voyages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Réservations reçues</CardTitle></CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : ownerBookings && ownerBookings.length > 0 ? (
                    <div className="space-y-4">
                      {ownerBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div>
                            <p className="font-medium text-foreground text-sm">{format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}</p>
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""} · {b.guests} voyageur{b.guests > 1 ? "s" : ""}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusMap[b.status]?.variant || "secondary"}>{statusMap[b.status]?.label || b.status}</Badge>
                            <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Aucune réservation reçue pour le moment.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              {listingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings?.map((listing) => (
                    <Card key={listing.id} className="border-none shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                      <div className="relative">
                        <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full h-48 object-cover" />
                        <Badge className={`absolute top-3 left-3 ${listing.status === "published" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {statusMap[listing.status]?.label || listing.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" /> {listing.location || "Non précisé"}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-foreground">{listing.price_per_night.toLocaleString("fr-FR")} F<span className="text-xs text-muted-foreground font-normal"> /nuit</span></span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-full flex-1 text-xs gap-1" onClick={() => navigate(`/property/${listing.id}`)}><Eye className="w-3 h-3" /> Voir</Button>
                          <Button variant="outline" size="sm" className="rounded-full text-xs text-destructive gap-1" onClick={() => handleDeleteListing(listing.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Link to="/create-listing" className="flex items-center justify-center">
                    <Card className="border-2 border-dashed border-border hover:border-primary transition-colors w-full h-full min-h-[300px] flex items-center justify-center cursor-pointer">
                      <CardContent className="text-center p-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Plus className="w-6 h-6 text-primary" /></div>
                        <p className="font-display font-semibold text-foreground">Ajouter un logement</p>
                        <p className="text-sm text-muted-foreground mt-1">Créez une nouvelle annonce</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trips">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Mes réservations</CardTitle></CardHeader>
                <CardContent>
                  {guestBookings && guestBookings.length > 0 ? (
                    <div className="space-y-4">
                      {guestBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div>
                            <p className="font-medium text-foreground text-sm">{format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}</p>
                            <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusMap[b.status]?.variant || "secondary"}>{statusMap[b.status]?.label || b.status}</Badge>
                            <p className="text-sm font-semibold text-foreground mt-1">{b.total_price.toLocaleString("fr-FR")} F</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Vous n'avez pas encore de réservation.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
