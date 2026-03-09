import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useNotifications, useMarkAsRead } from "@/hooks/useAdmin";
import { toast } from "sonner";
import {
  Users, Home, CalendarDays, CreditCard, Star, ShieldCheck, X, Check,
  Loader2, TrendingUp, Eye, Bell, Clock, Ban, LayoutDashboard,
  Search, Filter, Trash2, AlertTriangle, DollarSign, Settings,
  ChevronRight, MessageCircle, Flag, UserCheck, UserX, Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_approval: { label: "En attente", color: "bg-yellow-500/10 text-yellow-700" },
  published: { label: "Approuvé", color: "bg-green-500/10 text-green-700" },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive" },
  needs_modification: { label: "Modification demandée", color: "bg-orange-500/10 text-orange-700" },
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  suspended: { label: "Suspendu", color: "bg-orange-500/10 text-orange-700" },
};

const paymentLabels: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", free_money: "Free Money",
  paydunya: "PayDunya", card: "Carte bancaire",
};

type AdminSection = "overview" | "properties" | "approvals" | "reservations" | "users" | "payments" | "reviews" | "notifications" | "settings";

const sidebarItems: { id: AdminSection; label: string; icon: any }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "approvals", label: "Approbations", icon: Clock },
  { id: "properties", label: "Logements", icon: Home },
  { id: "reservations", label: "Réservations", icon: CalendarDays },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "payments", label: "Paiements", icon: CreditCard },
  { id: "reviews", label: "Avis", icon: Star },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkAsRead();
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [remarkListingId, setRemarkListingId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");

  const { data: allProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  const { data: allListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  const { data: allReviews } = useQuery({
    queryKey: ["admin-all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  const { data: allBookingRequests } = useQuery({
    queryKey: ["admin-booking-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin === true,
  });

  // Computed stats (must be before early returns)
  const pendingListings = allListings?.filter((l) => l.status === "pending_approval") || [];
  const totalRevenue = allBookings?.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total_price, 0) || 0;
  const platformCommission = Math.round(totalRevenue * 0.15);
  const unreadNotifs = notifications?.filter((n) => !n.read).length || 0;
  const hosts = allProfiles?.filter((p) => p.is_host) || [];
  const guests = allProfiles?.filter((p) => !p.is_host) || [];
  const avgRating = allReviews && allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : "—";
  const cities = [...new Set(allListings?.map((l) => l.city).filter(Boolean) || [])];

  const filteredListings = useMemo(() => {
    let items = allListings || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((l) => l.title.toLowerCase().includes(q) || l.location?.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") items = items.filter((l) => l.status === filterStatus);
    if (filterLocation !== "all") items = items.filter((l) => l.city === filterLocation);
    return items;
  }, [allListings, searchQuery, filterStatus, filterLocation]);

  const filteredBookings = useMemo(() => {
    let items = allBookings || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((b) => b.payment_method?.toLowerCase().includes(q) || b.id.includes(q));
    }
    if (filterStatus !== "all") items = items.filter((b) => b.status === filterStatus);
    if (filterPayment !== "all") items = items.filter((b) => b.payment_method === filterPayment);
    return items;
  }, [allBookings, searchQuery, filterStatus, filterPayment]);

  const filteredUsers = useMemo(() => {
    let items = allProfiles || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) => [p.first_name, p.last_name].join(" ").toLowerCase().includes(q) || p.phone?.includes(q));
    }
    if (filterStatus === "hosts") items = items.filter((p) => p.is_host);
    else if (filterStatus === "guests") items = items.filter((p) => !p.is_host);
    return items;
  }, [allProfiles, searchQuery, filterStatus]);

  // Early returns AFTER all hooks
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

  const handleListingAction = async (id: string, action: "approve" | "reject" | "suspend" | "delete") => {
    setUpdatingId(id);
    if (action === "delete") {
      if (!confirm("Supprimer définitivement ce logement ?")) { setUpdatingId(null); return; }
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) { toast.error(error.message); setUpdatingId(null); return; }
      toast.success("Logement supprimé");
      qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      setUpdatingId(null);
      return;
    }
    const statusMap = { approve: "published", reject: "rejected", suspend: "suspended" };
    const newStatus = statusMap[action];
    const { error } = await supabase.from("listings").update({ status: newStatus, verified: action === "approve" }).eq("id", id);
    if (error) { toast.error(error.message); setUpdatingId(null); return; }
    const listing = allListings?.find((l) => l.id === id);
    if (listing) {
      const msgs: Record<string, string> = {
        approve: `Votre logement "${listing.title}" a été approuvé et est maintenant visible.`,
        reject: `Votre logement "${listing.title}" n'a pas été approuvé. Veuillez vérifier les critères.`,
        suspend: `Votre logement "${listing.title}" a été suspendu.`,
      };
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: `listing_${action}`,
        title: action === "approve" ? "Logement approuvé !" : action === "reject" ? "Logement non approuvé" : "Logement suspendu",
        message: msgs[action],
        data: { listing_id: id },
      } as any);
    }
    toast.success(action === "approve" ? "Logement approuvé" : action === "reject" ? "Logement rejeté" : "Logement suspendu");
    qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    qc.invalidateQueries({ queryKey: ["listings"] });
    setUpdatingId(null);
  };

  const handleRequestModification = async () => {
    if (!remarkListingId || !remarkText.trim()) {
      toast.error("Veuillez entrer une remarque.");
      return;
    }
    setUpdatingId(remarkListingId);
    const { error } = await supabase
      .from("listings")
      .update({ status: "needs_modification", admin_remark: remarkText.trim() } as any)
      .eq("id", remarkListingId);
    if (error) { toast.error(error.message); setUpdatingId(null); return; }

    const listing = allListings?.find((l) => l.id === remarkListingId);
    if (listing) {
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: "listing_modification_requested",
        title: "Modification demandée",
        message: `Votre logement "${listing.title}" nécessite des modifications : ${remarkText.trim()}`,
        data: { listing_id: remarkListingId },
      } as any);
    }

    toast.success("Demande de modification envoyée");
    qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    qc.invalidateQueries({ queryKey: ["listings"] });
    setUpdatingId(null);
    setRemarkDialogOpen(false);
    setRemarkText("");
    setRemarkListingId(null);
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Annuler cette réservation ?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation annulée");
    qc.invalidateQueries({ queryKey: ["admin-all-bookings"] });
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Avis supprimé");
    qc.invalidateQueries({ queryKey: ["admin-all-reviews"] });
  };

  const overviewStats = [
    { label: "Total logements", value: allListings?.length || 0, icon: Home, section: "properties" as AdminSection, color: "bg-blue-500/10 text-blue-600" },
    { label: "En attente", value: pendingListings.length, icon: Clock, section: "approvals" as AdminSection, color: "bg-yellow-500/10 text-yellow-600" },
    { label: "Réservations", value: allBookings?.length || 0, icon: CalendarDays, section: "reservations" as AdminSection, color: "bg-green-500/10 text-green-600" },
    { label: "Revenus totaux", value: `${totalRevenue.toLocaleString("fr-FR")} F`, icon: DollarSign, section: "payments" as AdminSection, color: "bg-primary/10 text-primary" },
    { label: "Hôtes", value: hosts.length, icon: UserCheck, section: "users" as AdminSection, color: "bg-purple-500/10 text-purple-600" },
    { label: "Voyageurs", value: guests.length, icon: Users, section: "users" as AdminSection, color: "bg-cyan-500/10 text-cyan-600" },
    { label: "Note moyenne", value: avgRating, icon: Star, section: "reviews" as AdminSection, color: "bg-amber-500/10 text-amber-600" },
  ];

  const renderSearchBar = (placeholder: string) => (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl border-border"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Mobile nav */}
      <div className="lg:hidden w-full overflow-x-auto border-b border-border bg-card px-4 py-2 flex gap-1 sticky top-0 z-10">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveSection(item.id); setSearchQuery(""); setFilterStatus("all"); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              activeSection === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex bg-secondary">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 bg-card border-r border-border flex-shrink-0 transition-all duration-300",
          "hidden lg:flex flex-col"
        )}>
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground text-sm">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSearchQuery(""); setFilterStatus("all"); setFilterLocation("all"); setFilterPayment("all"); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.id === "approvals" && pendingListings.length > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0">{pendingListings.length}</Badge>
                )}
                {item.id === "notifications" && unreadNotifs > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0">{unreadNotifs}</Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ============ OVERVIEW ============ */}
          {activeSection === "overview" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Vue d'ensemble</h1>
              <p className="text-muted-foreground text-sm mb-8">Statistiques globales de la plateforme TerangaSéjour</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {overviewStats.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card
                      className="border-none shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.03] transition-all duration-300 group"
                      onClick={() => setActiveSection(stat.section)}
                    >
                      <CardContent className="p-5">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="font-display text-2xl font-bold text-foreground leading-none mb-1">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-lg">Logements en attente</CardTitle>
                    {pendingListings.length > 0 && (
                      <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => setActiveSection("approvals")}>
                        Voir tout <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {pendingListings.length > 0 ? pendingListings.slice(0, 3).map((l) => (
                      <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-2 last:mb-0">
                        <img src={l.photos?.[0] || "/placeholder.svg"} alt={l.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.location || l.city || "Non précisé"}</p>
                        </div>
                        <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
                          onClick={() => handleListingAction(l.id, "approve")} disabled={updatingId === l.id}>
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    )) : <p className="text-center text-muted-foreground text-sm py-4">Aucun logement en attente</p>}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-lg">Réservations récentes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => setActiveSection("reservations")}>
                      Voir tout <ChevronRight className="w-3 h-3" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {allBookings && allBookings.length > 0 ? allBookings.slice(0, 4).map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 mb-2 last:mb-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM", { locale: fr })}
                          </p>
                          <p className="text-xs text-muted-foreground">{b.nights} nuit{b.nights > 1 ? "s" : ""} · {paymentLabels[b.payment_method] || b.payment_method}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px]">
                            {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{b.total_price.toLocaleString("fr-FR")} F</p>
                        </div>
                      </div>
                    )) : <p className="text-center text-muted-foreground text-sm py-4">Aucune réservation</p>}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle className="font-display text-lg">Revenus</CardTitle></CardHeader>
                  <CardContent>
                    <p className="font-display text-3xl font-bold text-foreground mb-1">{totalRevenue.toLocaleString("fr-FR")} F</p>
                    <p className="text-sm text-muted-foreground mb-4">Revenus totaux de la plateforme</p>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5">
                      <span className="text-sm text-muted-foreground">Commission (15%)</span>
                      <span className="font-semibold text-primary">{platformCommission.toLocaleString("fr-FR")} F</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle className="font-display text-lg">Notifications récentes</CardTitle></CardHeader>
                  <CardContent>
                    {notifications && notifications.length > 0 ? notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className={cn("p-3 rounded-xl mb-2 last:mb-0 cursor-pointer", n.read ? "bg-muted/30" : "bg-primary/5 border border-primary/10")}
                        onClick={() => !n.read && markAsRead.mutate(n.id)}>
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(n.created_at), "d MMM HH:mm", { locale: fr })}</p>
                      </div>
                    )) : <p className="text-center text-muted-foreground text-sm py-4">Aucune notification</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ============ APPROVALS ============ */}
          {activeSection === "approvals" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Approbation des logements</h1>
              <p className="text-muted-foreground text-sm mb-6">{pendingListings.length} logement{pendingListings.length > 1 ? "s" : ""} en attente de validation</p>

              {pendingListings.length > 0 ? (
                <div className="space-y-4">
                  {pendingListings.map((listing) => {
                    const photoCount = listing.photos?.length || 0;
                    const hasEnoughPhotos = photoCount >= 5;
                    const hasDesc = listing.description && listing.description.length >= 20;
                    const hasLocation = !!listing.location || !!listing.city;
                    const canApprove = hasEnoughPhotos && hasDesc && hasLocation;
                    const ownerProfile = allProfiles?.find((p) => p.id === listing.user_id);

                    return (
                      <Card key={listing.id} className="border-none shadow-[var(--shadow-card)] overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col lg:flex-row">
                            {/* Photos preview */}
                            <div className="lg:w-80 flex-shrink-0">
                              <div className="grid grid-cols-2 gap-0.5 h-full">
                                {(listing.photos || []).slice(0, 4).map((photo: string, i: number) => (
                                  <img key={i} src={photo} alt="" className={cn("object-cover w-full", i === 0 ? "col-span-2 h-40" : "h-24")} />
                                ))}
                                {photoCount === 0 && <div className="col-span-2 h-40 bg-muted flex items-center justify-center"><Home className="w-8 h-8 text-muted-foreground" /></div>}
                              </div>
                            </div>
                            {/* Details */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                  <h3 className="font-display font-bold text-foreground text-lg">{listing.title}</h3>
                                  <p className="text-sm text-muted-foreground">{listing.location || listing.city || "Non précisé"} · {listing.price_per_night.toLocaleString("fr-FR")} F/nuit</p>
                                </div>
                                <Badge className={(listing as any).booking_mode === "request" ? "bg-blue-500/10 text-blue-600 border-none" : "bg-green-500/10 text-green-600 border-none"}>
                                  {(listing as any).booking_mode === "request" ? "📩 Sur demande" : "⚡ Instantané"}
                                </Badge>
                              </div>

                              {listing.description && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
                              )}

                              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                                <span>{listing.bedrooms} ch.</span>
                                <span>·</span>
                                <span>{listing.bathrooms} sdb.</span>
                                <span>·</span>
                                <span>{listing.capacity} pers.</span>
                                <span>·</span>
                                <span>{listing.property_type}</span>
                              </div>

                              {/* Host info */}
                              {ownerProfile && (
                                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-muted/50">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {(ownerProfile.first_name?.[0] || "").toUpperCase()}{(ownerProfile.last_name?.[0] || "").toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{[ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(" ")}</p>
                                    <p className="text-xs text-muted-foreground">{ownerProfile.phone || "Pas de téléphone"}</p>
                                  </div>
                                </div>
                              )}

                              {/* Verification checklist */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className={hasEnoughPhotos ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>
                                  📷 {photoCount}/5 photos
                                </Badge>
                                <Badge className={hasDesc ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>
                                  📝 Description {hasDesc ? "✓" : "✗"}
                                </Badge>
                                <Badge className={hasLocation ? "bg-green-500/10 text-green-700 border-none text-xs" : "bg-destructive/10 text-destructive border-none text-xs"}>
                                  📍 Localisation {hasLocation ? "✓" : "✗"}
                                </Badge>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Link to={`/property/${listing.id}`}>
                                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Eye className="w-3 h-3" /> Voir le détail</Button>
                                </Link>
                                <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                                  disabled={!canApprove || updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "approve")}>
                                  {updatingId === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approuver
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1"
                                  disabled={updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "reject")}>
                                  <X className="w-3 h-3" /> Rejeter
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 text-orange-600"
                                  disabled={updatingId === listing.id}
                                  onClick={() => { setRemarkListingId(listing.id); setRemarkDialogOpen(true); }}>
                                  <Pencil className="w-3 h-3" /> Demander modification
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="py-16 text-center">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="font-display font-semibold text-foreground text-lg">Tout est à jour !</p>
                    <p className="text-muted-foreground text-sm mt-1">Aucun logement en attente d'approbation.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ============ PROPERTIES ============ */}
          {activeSection === "properties" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Gestion des logements</h1>
              <p className="text-muted-foreground text-sm mb-6">{allListings?.length || 0} logements sur la plateforme</p>

              {renderSearchBar("Rechercher un logement...")}
              <div className="flex gap-3 mb-6 flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] rounded-xl"><Filter className="w-3.5 h-3.5 mr-2" /><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Approuvé</SelectItem>
                    <SelectItem value="pending_approval">En attente</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                    <SelectItem value="needs_modification">Modification demandée</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
                {cities.length > 0 && (
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Ville" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {cities.map((c) => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {listingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-3">
                  {filteredListings.map((listing) => {
                    const st = statusLabels[listing.status] || { label: listing.status, color: "bg-muted text-muted-foreground" };
                    const owner = allProfiles?.find((p) => p.id === listing.user_id);
                    return (
                      <Card key={listing.id} className="border-none shadow-[var(--shadow-card)]">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <img src={listing.photos?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full sm:w-28 h-20 object-cover rounded-xl" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-medium text-foreground text-sm truncate">{listing.title}</p>
                                <Badge className={`${st.color} border-none text-[10px]`}>{st.label}</Badge>
                                {listing.verified && <Badge className="bg-primary/10 text-primary border-none text-[10px] gap-0.5"><ShieldCheck className="w-3 h-3" /> Vérifié</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{listing.location || listing.city || "Non précisé"} · {listing.price_per_night.toLocaleString("fr-FR")} F/nuit</p>
                              {owner && <p className="text-xs text-muted-foreground mt-1">Hôte: {[owner.first_name, owner.last_name].filter(Boolean).join(" ")}</p>}
                            </div>
                            <div className="flex gap-2 shrink-0 flex-wrap">
                              <Link to={`/property/${listing.id}`}>
                                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Eye className="w-3 h-3" /> Voir</Button>
                              </Link>
                              {listing.status === "published" && (
                                <Button size="sm" variant="outline" className="rounded-full text-xs text-orange-600 gap-1" disabled={updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "suspend")}><Ban className="w-3 h-3" /> Suspendre</Button>
                              )}
                              {(listing.status === "rejected" || listing.status === "suspended") && (
                                <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs gap-1" disabled={updatingId === listing.id}
                                  onClick={() => handleListingAction(listing.id, "approve")}><Check className="w-3 h-3" /> Réactiver</Button>
                              )}
                              <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1" disabled={updatingId === listing.id}
                                onClick={() => handleListingAction(listing.id, "delete")}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredListings.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun logement trouvé.</p>}
                </div>
              )}
            </div>
          )}

          {/* ============ RESERVATIONS ============ */}
          {activeSection === "reservations" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Réservations</h1>
              <p className="text-muted-foreground text-sm mb-6">{allBookings?.length || 0} réservations sur la plateforme</p>

              {renderSearchBar("Rechercher une réservation...")}
              <div className="flex gap-3 mb-6 flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPayment} onValueChange={setFilterPayment}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Paiement" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                    <SelectItem value="free_money">Free Money</SelectItem>
                    <SelectItem value="card">Carte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bookingsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => {
                    const listing = allListings?.find((l) => l.id === b.listing_id);
                    const guest = allProfiles?.find((p) => p.id === b.guest_id);
                    const host = listing ? allProfiles?.find((p) => p.id === listing.user_id) : undefined;
                    return (
                      <Card key={b.id} className="border-none shadow-[var(--shadow-card)]">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-medium text-foreground text-sm">
                                  {format(new Date(b.check_in), "d MMM", { locale: fr })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: fr })}
                                </p>
                                <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px]">
                                  {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
                                </Badge>
                              </div>
                              {listing && <p className="text-xs text-muted-foreground">🏠 {listing.title}</p>}
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                {guest && <span>👤 Voyageur: {[guest.first_name, guest.last_name].filter(Boolean).join(" ")}</span>}
                                {host && <span>🏡 Hôte: {[host.first_name, host.last_name].filter(Boolean).join(" ")}</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{b.nights} nuit{b.nights > 1 ? "s" : ""}</span>
                                <span>💳 {paymentLabels[b.payment_method] || b.payment_method}</span>
                                <span>💰 {b.payment_status === "paid" ? "Payé" : "En attente"}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="font-display font-bold text-foreground">{b.total_price.toLocaleString("fr-FR")} F</p>
                              {b.status !== "cancelled" && (
                                <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1"
                                  onClick={() => handleCancelBooking(b.id)}>
                                  <X className="w-3 h-3" /> Annuler
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredBookings.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune réservation trouvée.</p>}
                </div>
              )}
            </div>
          )}

          {/* ============ USERS ============ */}
          {activeSection === "users" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Utilisateurs</h1>
              <p className="text-muted-foreground text-sm mb-6">{allProfiles?.length || 0} utilisateurs ({hosts.length} hôtes, {guests.length} voyageurs)</p>

              {renderSearchBar("Rechercher un utilisateur...")}
              <div className="flex gap-3 mb-6">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="hosts">Hôtes</SelectItem>
                    <SelectItem value="guests">Voyageurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profilesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((p) => {
                    const userListings = allListings?.filter((l) => l.user_id === p.id) || [];
                    const userBookings = allBookings?.filter((b) => b.guest_id === p.id) || [];
                    return (
                      <Card key={p.id} className="border-none shadow-[var(--shadow-card)]">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                {(p.first_name?.[0] || "").toUpperCase()}{(p.last_name?.[0] || "").toUpperCase() || "U"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground text-sm">{[p.first_name, p.last_name].filter(Boolean).join(" ") || "Sans nom"}</p>
                                  {p.is_host && <Badge className="bg-primary/10 text-primary border-none text-[10px]">Hôte</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{p.phone || "Pas de téléphone"} · Inscrit le {format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {p.is_host && <span>{userListings.length} logement{userListings.length > 1 ? "s" : ""}</span>}
                              <span>{userBookings.length} réservation{userBookings.length > 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé.</p>}
                </div>
              )}
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeSection === "payments" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Paiements</h1>
              <p className="text-muted-foreground text-sm mb-6">Suivi des revenus et transactions</p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">Revenus totaux</p>
                    <p className="font-display text-2xl font-bold text-foreground">{totalRevenue.toLocaleString("fr-FR")} F</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">Commission plateforme (15%)</p>
                    <p className="font-display text-2xl font-bold text-primary">{platformCommission.toLocaleString("fr-FR")} F</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">Paiements en attente</p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {(allBookings?.filter((b) => b.payment_status === "pending").length || 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader><CardTitle className="font-display text-lg">Détails des transactions</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">ID</th>
                          <th className="pb-3 font-medium">Montant</th>
                          <th className="pb-3 font-medium">Méthode</th>
                          <th className="pb-3 font-medium">Statut paiement</th>
                          <th className="pb-3 font-medium">Statut résa</th>
                          <th className="pb-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings?.map((b) => (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}...</td>
                            <td className="py-3 font-semibold text-foreground">{b.total_price.toLocaleString("fr-FR")} F</td>
                            <td className="py-3">{paymentLabels[b.payment_method] || b.payment_method}</td>
                            <td className="py-3">
                              <Badge className={b.payment_status === "paid" ? "bg-green-500/10 text-green-700 border-none text-[10px]" : "bg-yellow-500/10 text-yellow-700 border-none text-[10px]"}>
                                {b.payment_status === "paid" ? "Payé" : "En attente"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px]">
                                {b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente"}
                              </Badge>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">{format(new Date(b.created_at), "d MMM yyyy", { locale: fr })}</td>
                          </tr>
                        ))}
                        {(!allBookings || allBookings.length === 0) && (
                          <tr><td colSpan={6} className="text-center text-muted-foreground py-8">Aucune transaction.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============ REVIEWS ============ */}
          {activeSection === "reviews" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Modération des avis</h1>
              <p className="text-muted-foreground text-sm mb-6">{allReviews?.length || 0} avis · Note moyenne: {avgRating}/5</p>

              {renderSearchBar("Rechercher un avis...")}

              <div className="space-y-3">
                {allReviews?.map((r) => {
                  const listing = allListings?.find((l) => l.id === r.listing_id);
                  const reviewer = allProfiles?.find((p) => p.id === r.user_id);
                  return (
                    <Card key={r.id} className="border-none shadow-[var(--shadow-card)]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}</span>
                            </div>
                            {r.comment && <p className="text-sm text-foreground mb-2">{r.comment}</p>}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              {reviewer && <span>Par: {[reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ")}</span>}
                              {listing && <span>Sur: {listing.title}</span>}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive gap-1"
                            onClick={() => handleDeleteReview(r.id)}>
                            <Trash2 className="w-3 h-3" /> Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {(!allReviews || allReviews.length === 0) && <p className="text-center text-muted-foreground py-8">Aucun avis.</p>}
              </div>
            </div>
          )}

          {/* ============ NOTIFICATIONS ============ */}
          {activeSection === "notifications" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Notifications</h1>
              <p className="text-muted-foreground text-sm mb-6">{unreadNotifs} non lue{unreadNotifs > 1 ? "s" : ""}</p>

              <div className="space-y-3">
                {notifications && notifications.length > 0 ? notifications.map((n) => (
                  <Card key={n.id} className={cn("border-none shadow-[var(--shadow-card)] cursor-pointer transition-all", !n.read && "ring-1 ring-primary/20")}
                    onClick={() => !n.read && markAsRead.mutate(n.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{n.title}</p>
                          {!n.read && <Badge className="bg-primary text-primary-foreground text-[10px]">Nouveau</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "d MMM yyyy HH:mm", { locale: fr })}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                    </CardContent>
                  </Card>
                )) : <p className="text-center text-muted-foreground py-8">Aucune notification.</p>}
              </div>
            </div>
          )}

          {/* ============ SETTINGS ============ */}
          {activeSection === "settings" && (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Paramètres</h1>
              <p className="text-muted-foreground text-sm mb-6">Configuration de la plateforme</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-2">Commission</h3>
                    <p className="text-sm text-muted-foreground mb-4">Taux de commission appliqué sur chaque réservation.</p>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-display text-2xl font-bold text-primary">15%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-2">Critères de vérification</h3>
                    <p className="text-sm text-muted-foreground mb-4">Conditions requises pour approuver un logement.</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Minimum 5 photos</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Description détaillée (≥20 caractères)</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Localisation renseignée</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-2">Méthodes de paiement</h3>
                    <p className="text-sm text-muted-foreground mb-4">Moyens de paiement acceptés sur la plateforme.</p>
                    <div className="flex flex-wrap gap-2">
                      {["Wave", "Orange Money", "Free Money", "PayDunya", "Carte bancaire"].map((m) => (
                        <Badge key={m} className="bg-muted text-foreground border-none">{m}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-2">Rôles</h3>
                    <p className="text-sm text-muted-foreground mb-4">Contrôle d'accès basé sur les rôles.</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Super Admin — Accès complet</li>
                      <li className="flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Hôte — Gestion de ses logements</li>
                      <li className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Voyageur — Réservation uniquement</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
      {/* Remark Dialog */}
      <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Demander une modification</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Décrivez les modifications nécessaires. L'hôte recevra une notification avec votre remarque.
            </p>
            <Textarea
              placeholder="Ex: Veuillez ajouter plus de photos de l'intérieur, préciser l'adresse exacte..."
              rows={4}
              className="rounded-xl"
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRemarkDialogOpen(false); setRemarkText(""); }}>Annuler</Button>
            <Button onClick={handleRequestModification} disabled={!remarkText.trim() || updatingId === remarkListingId} className="bg-primary text-primary-foreground gap-1">
              {updatingId === remarkListingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3 h-3" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
