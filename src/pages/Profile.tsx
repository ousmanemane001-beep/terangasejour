import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Shield, Key, Bell,
  Camera, ChevronLeft, Globe, CreditCard, LogOut,
  Home, Star, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOwnerListings } from "@/hooks/useOwnerData";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: listings } = useOwnerListings();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setPhone(data.phone || "");
        }
        setProfileLoaded(true);
      });
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-secondary">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">{t("auth.loginRequired")}</h1>
            <p className="text-muted-foreground mb-6">{t("auth.loginRequiredProfile")}</p>
            <Link to="/login">
              <Button className="rounded-full bg-primary text-primary-foreground">{t("auth.loginBtn")}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "U";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || t("roles.user");

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("profile.profileUpdated"));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const listingsCount = listings?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
                {t("profile.dashboard")}
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-72 shrink-0">
              <Card className="border-none shadow-[var(--shadow-card)] text-center">
                <CardContent className="p-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-6 pt-4 border-t border-border text-left space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="w-4 h-4" />
                      <span>{listingsCount} {listingsCount > 1 ? t("profile.listingsPlural") : t("profile.listings")}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="bg-card rounded-xl p-1 shadow-[var(--shadow-card)] w-full justify-start">
                  <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {t("profile.information")}
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {t("profile.security")}
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {t("profile.payment")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{t("profile.personalInfo")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                            <User className="w-3.5 h-3.5 text-accent" /> {t("profile.firstName")}
                          </label>
                          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl h-12" />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                            <User className="w-3.5 h-3.5 text-accent" /> {t("profile.lastName")}
                          </label>
                          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl h-12" />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Mail className="w-3.5 h-3.5 text-accent" /> {t("profile.email")}
                        </label>
                        <Input type="email" value={user.email || ""} disabled className="rounded-xl h-12 bg-muted" />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Phone className="w-3.5 h-3.5 text-accent" /> {t("profile.phone")}
                        </label>
                        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 123 45 67" className="rounded-xl h-12" />
                      </div>
                      <Button onClick={handleSaveProfile} disabled={saving} className="rounded-full bg-primary text-primary-foreground">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {t("profile.saveChanges")}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{t("profile.accountSecurity")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{t("profile.changePassword")}</p>
                              <p className="text-xs text-muted-foreground">{t("profile.changePasswordDesc")}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/forgot-password")}>{t("profile.modify")}</Button>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <Button variant="destructive" className="rounded-full gap-2" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" />
                          {t("nav.logout")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment">
                  <Card className="border-none shadow-[var(--shadow-card)]">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{t("profile.paymentMethods")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{t("profile.paymentDesc")}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {["Wave", "Orange Money", "Carte bancaire"].map((method) => (
                          <div key={method} className="p-4 rounded-xl bg-muted/50 text-center">
                            <CreditCard className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs font-medium text-foreground">{method}</p>
                            <Badge variant="outline" className="mt-1 text-[10px]">{t("profile.comingSoon")}</Badge>
                          </div>
                        ))}
                      </div>
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

export default Profile;
