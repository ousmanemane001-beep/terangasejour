import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SeasonalPriceManager from "@/components/SeasonalPriceManager";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, DollarSign, Bed, Bath, Users, Loader2, Save, AlertTriangle, ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["edit-listing", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("villa");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState("");
  const [bookingMode, setBookingMode] = useState("instant");
  const [availabilityMode, setAvailabilityMode] = useState("always");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setPropertyType(listing.property_type || "villa");
      setLocation(listing.location || "");
      setAddress(listing.address || "");
      setCity(listing.city || "");
      setBedrooms(listing.bedrooms || 1);
      setBathrooms(listing.bathrooms || 1);
      setCapacity(listing.capacity || 2);
      setPrice(String(listing.price_per_night || ""));
      setBookingMode(listing.booking_mode || "instant");
      setAvailabilityMode(listing.availability_mode || "always");
    }
  }, [listing]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!listing || listing.user_id !== user.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Logement introuvable ou accès refusé.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const adminRemark = (listing as any).admin_remark;
  const needsModification = listing.status === "needs_modification";

  const handleSave = async () => {
    if (!title.trim() || !price) {
      toast.error("Le titre et le prix sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        property_type: propertyType,
        location: location.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        bedrooms,
        bathrooms,
        capacity,
        price_per_night: parseInt(price),
        booking_mode: bookingMode,
        availability_mode: availabilityMode,
        updated_at: new Date().toISOString(),
      };

      // If listing needs modification, resubmit for approval
      if (needsModification) {
        updateData.status = "pending_approval";
        updateData.admin_remark = null;
      }

      const { error } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", listing.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["edit-listing", id] });

      if (needsModification) {
        // Notify admins
        try {
          const { data: admins } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");
          if (admins) {
            for (const admin of admins) {
              await supabase.rpc("create_notification", {
                _user_id: admin.user_id,
                _type: "listing_resubmitted",
                _title: "Logement re-soumis",
                _message: `"${title.trim()}" a été modifié et re-soumis pour approbation.`,
                _data: { listing_id: listing.id },
              });
            }
          }
        } catch {}
        toast.success("Logement modifié et re-soumis pour approbation !");
      } else {
        toast.success("Logement mis à jour avec succès !");
      }

      navigate("/dashboard/properties");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate("/dashboard/properties")}>
            <ArrowLeft className="w-4 h-4" /> Retour à mes logements
          </Button>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Modifier le logement</h1>
          <p className="text-muted-foreground text-sm mb-6">Modifiez les informations de votre annonce.</p>

          {/* Admin remark banner */}
          {adminRemark && (
            <Card className="border-destructive/30 bg-destructive/5 mb-6">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm mb-1">Remarque de l'administrateur</p>
                  <p className="text-sm text-muted-foreground">{adminRemark}</p>
                  {needsModification && (
                    <Badge className="mt-2 bg-amber-500/10 text-amber-700 border-none text-xs">
                      Modification demandée — corrigez puis sauvegardez pour re-soumettre
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce</label>
                <Input className="rounded-xl h-12" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <Textarea rows={4} className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type de logement</label>
                  <select className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="villa">Villa</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison d'hôtes</option>
                    <option value="lodge">Lodge</option>
                    <option value="loft">Loft</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Localisation
                  </label>
                  <Input className="rounded-xl h-12" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Adresse</label>
                  <Input className="rounded-xl h-12" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Ville</label>
                  <Input className="rounded-xl h-12" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bed className="w-3.5 h-3.5 inline mr-1" />Chambres
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bath className="w-3.5 h-3.5 inline mr-1" />Salles de bain
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1" />Capacité
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 inline mr-1" />Prix par nuit (FCFA)
                </label>
                <Input type="number" className="rounded-xl h-12" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              {/* Booking mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mode de réservation</label>
                  <select
                    className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                    value={bookingMode}
                    onChange={(e) => {
                      setBookingMode(e.target.value);
                      if (e.target.value === "instant") setAvailabilityMode("always");
                    }}
                  >
                    <option value="instant">Toujours disponible</option>
                    <option value="request">Disponible sur demande</option>
                  </select>
                </div>
                {bookingMode === "request" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Disponibilité</label>
                    <select
                      className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                      value={availabilityMode}
                      onChange={(e) => setAvailabilityMode(e.target.value)}
                    >
                      <option value="request">Me contacter</option>
                      <option value="calendar">Calendrier personnalisé</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Photos info */}
              {listing.photos && listing.photos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Photos actuelles</label>
                  <div className="grid grid-cols-5 gap-2">
                    {listing.photos.map((photo: string, i: number) => (
                      <img key={i} src={photo} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              {/* Prix saisonniers */}
              {id && listing && (
                <div className="border-t border-border pt-6 mt-6">
                  <SeasonalPriceManager listingId={id} basePricePerNight={listing.price_per_night} />
                </div>
              )}

              <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {needsModification ? "Sauvegarder et re-soumettre" : "Sauvegarder les modifications"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditListing;
