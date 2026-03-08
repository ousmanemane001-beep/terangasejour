import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Shield, Key, Bell,
  Camera, ChevronLeft, Globe, CreditCard, LogOut
} from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-warm-gray">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-72 shrink-0">
              <Card className="border-none shadow-[var(--shadow-card)] text-center">
                <CardContent className="p-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">AD</AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground">Amadou Diallo</h2>
                  <p className="text-sm text-muted-foreground">Membre depuis Mars 2024</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Vérifié
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground gap-1">
                      Hôte certifié
                    </Badge>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border text-left space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="w-4 h-4" />
                      <span>3 logements</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4" />
                      <span>4.8 note moyenne</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>Dakar, Sénégal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main */}
            <div className="flex-1">
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="bg-card rounded-xl p-1 shadow-[var(--shadow-card)] w-full justify-start">
                  <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Informations
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sécurité
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Paiement
                  </TabsTrigger>
                </TabsList>

                {/* Personal Info */}
                <TabsContent value="personal">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Informations personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                            <User className="w-3.5 h-3.5 text-accent" /> Prénom
                          </label>
                          <Input defaultValue="Amadou" className="rounded-xl h-12" />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                            <User className="w-3.5 h-3.5 text-accent" /> Nom
                          </label>
                          <Input defaultValue="Diallo" className="rounded-xl h-12" />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Mail className="w-3.5 h-3.5 text-accent" /> Email
                        </label>
                        <Input type="email" defaultValue="amadou@email.com" className="rounded-xl h-12" />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Phone className="w-3.5 h-3.5 text-accent" /> Téléphone
                        </label>
                        <Input type="tel" defaultValue="+221 77 123 45 67" className="rounded-xl h-12" />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-accent" /> Adresse
                        </label>
                        <Input defaultValue="Almadies, Dakar" className="rounded-xl h-12" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
                        <Textarea defaultValue="Passionné d'hospitalité et amoureux du Sénégal. J'accueille les voyageurs dans mes propriétés avec le sourire !" rows={3} className="rounded-xl" />
                      </div>
                      <Button className="rounded-full bg-primary text-primary-foreground">
                        Enregistrer les modifications
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Sécurité du compte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-medium text-foreground text-sm">Mot de passe</p>
                              <p className="text-xs text-muted-foreground">Dernière modification il y a 3 mois</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">Modifier</Button>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-medium text-foreground text-sm">Vérification en deux étapes</p>
                              <p className="text-xs text-muted-foreground">Non activée</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">Activer</Button>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <Button variant="destructive" className="rounded-full gap-2">
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Préférences de notification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Nouvelles réservations", desc: "Recevez une alerte pour chaque réservation" },
                        { label: "Messages des voyageurs", desc: "Notifications pour les nouveaux messages" },
                        { label: "Rappels de paiement", desc: "Alertes pour les paiements en attente" },
                        { label: "Promotions Séjour", desc: "Offres et nouveautés de la plateforme" },
                      ].map((notif) => (
                        <div key={notif.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{notif.label}</p>
                              <p className="text-xs text-muted-foreground">{notif.desc}</p>
                            </div>
                          </div>
                          <input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))] w-4 h-4" />
                        </div>
                      ))}
                      <Button className="rounded-full bg-primary text-primary-foreground mt-2">
                        Enregistrer
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment */}
                <TabsContent value="payment">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">Méthodes de paiement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-accent" />
                          <div>
                            <p className="font-medium text-foreground text-sm">Orange Money</p>
                            <p className="text-xs text-muted-foreground">+221 77 *** ** 67</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Par défaut</Badge>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground text-sm">Wave</p>
                            <p className="text-xs text-muted-foreground">+221 78 *** ** 12</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full text-xs">Définir par défaut</Button>
                      </div>
                      <Button variant="outline" className="rounded-full gap-2 mt-2">
                        <CreditCard className="w-4 h-4" />
                        Ajouter une méthode
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Icons used in sidebar that aren't imported at top
const Home = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export default Profile;
