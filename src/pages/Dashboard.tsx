import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home, CalendarDays, Eye, Star, TrendingUp, Plus, Settings,
  MessageSquare, Bell, CreditCard, BarChart3, Users, MapPin
} from "lucide-react";
import { properties } from "@/data/properties";

const stats = [
  { label: "Logements actifs", value: "3", icon: Home, trend: "+1 ce mois" },
  { label: "Réservations", value: "24", icon: CalendarDays, trend: "+8 ce mois" },
  { label: "Vues totales", value: "1,247", icon: Eye, trend: "+15%" },
  { label: "Note moyenne", value: "4.8", icon: Star, trend: "Stable" },
];

const recentBookings = [
  { id: 1, guest: "Aminata Diallo", property: "Villa Palmier avec Piscine", dates: "12 - 17 Mars 2026", status: "confirmed", amount: "510 000 FCFA" },
  { id: 2, guest: "Jean-Pierre Faye", property: "Appartement Vue Mer", dates: "20 - 23 Mars 2026", status: "pending", amount: "135 000 FCFA" },
  { id: 3, guest: "Ousmane Sow", property: "Villa Palmier avec Piscine", dates: "1 - 5 Avril 2026", status: "confirmed", amount: "340 000 FCFA" },
  { id: 4, guest: "Fatou Ndiaye", property: "Appartement Vue Mer", dates: "10 - 12 Avril 2026", status: "cancelled", amount: "90 000 FCFA" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmée", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

const Dashboard = () => {
  const myListings = properties.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-warm-gray">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-lg">AD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Bonjour, Amadou 👋</h1>
                <p className="text-muted-foreground text-sm">Voici un aperçu de votre activité</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/create-listing">
                <Button className="rounded-full bg-accent text-accent-foreground gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau logement
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="rounded-full gap-2">
                  <Settings className="w-4 h-4" />
                  Profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="bg-card rounded-xl p-1 shadow-[var(--shadow-card)]">
              <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarDays className="w-4 h-4 mr-2" />
                Réservations
              </TabsTrigger>
              <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Home className="w-4 h-4 mr-2" />
                Mes logements
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="earnings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="w-4 h-4 mr-2" />
                Revenus
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Réservations récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-accent/10 text-accent text-sm font-medium">
                              {booking.guest.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">{booking.guest}</p>
                            <p className="text-xs text-muted-foreground">{booking.property}</p>
                            <p className="text-xs text-muted-foreground">{booking.dates}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusMap[booking.status].variant} className="mb-1">
                            {statusMap[booking.status].label}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground">{booking.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myListings.map((property) => (
                  <Card key={property.id} className="border-none shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                    <div className="relative">
                      <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">Actif</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-display font-semibold text-foreground mb-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{property.price.toLocaleString()} FCFA<span className="text-xs text-muted-foreground font-normal"> /nuit</span></span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                          <span className="font-medium">{property.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="rounded-full flex-1 text-xs">Modifier</Button>
                        <Button variant="outline" size="sm" className="rounded-full flex-1 text-xs">Statistiques</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Link to="/create-listing" className="flex items-center justify-center">
                  <Card className="border-2 border-dashed border-border hover:border-accent transition-colors w-full h-full min-h-[300px] flex items-center justify-center cursor-pointer">
                    <CardContent className="text-center p-6">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-accent" />
                      </div>
                      <p className="font-display font-semibold text-foreground">Ajouter un logement</p>
                      <p className="text-sm text-muted-foreground mt-1">Créez une nouvelle annonce</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">Aucun message</h3>
                  <p className="text-sm text-muted-foreground">Vos conversations avec les voyageurs apparaîtront ici.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <Card className="border-none shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Aperçu des revenus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Ce mois</p>
                      <p className="font-display text-2xl font-bold text-foreground">645 000 FCFA</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Mois dernier</p>
                      <p className="font-display text-2xl font-bold text-foreground">420 000 FCFA</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-display text-2xl font-bold text-foreground">3 250 000 FCFA</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Objectif mensuel</span>
                      <span className="text-sm font-medium text-foreground">645K / 800K FCFA</span>
                    </div>
                    <Progress value={80} className="h-2" />
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

export default Dashboard;
