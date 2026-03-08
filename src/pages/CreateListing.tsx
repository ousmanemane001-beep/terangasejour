import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, DollarSign, Bed, Bath, Users,
  ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind,
  UtensilsCrossed, Tv, Lock, Flower2, CheckCircle, Loader2, Eye, PlusCircle,
} from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const propertyTypes = [
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "appartement", label: "Appartement", icon: "🏢" },
  { value: "maison", label: "Maison d'hôtes", icon: "🏠" },
  { value: "lodge", label: "Lodge", icon: "🌿" },
  { value: "loft", label: "Loft", icon: "🏙️" },
  { value: "studio", label: "Studio", icon: "🛏️" },
];

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "pool", label: "Piscine", icon: Waves },
  { id: "ac", label: "Climatisation", icon: Wind },
  { id: "kitchen", label: "Cuisine", icon: UtensilsCrossed },
  { id: "tv", label: "Télévision", icon: Tv },
  { id: "security", label: "Sécurité 24h", icon: Lock },
  { id: "garden", label: "Jardin", icon: Flower2 },
];

const rulesList = [
  "Animaux acceptés",
  "Fumeurs autorisés",
  "Fêtes/événements autorisés",
  "Arrivée autonome (serrure connectée)",
];

const TOTAL_STEPS = 4;

const CreateListing = () => {
  const { user, isHost } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Step 1
  const [selectedType, setSelectedType] = useState("villa");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Step 2
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Step 3
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([]);

  // Step 4
  const [price, setPrice] = useState("");
  const [weekDiscount, setWeekDiscount] = useState("");
  const [monthDiscount, setMonthDiscount] = useState("");
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  // UI state
  const [step, setStep] = useState(1);

  // Redirect non-hosts to become-host page
  const [loading, setLoading] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleRule = (rule: string) => {
    setSelectedRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const canGoNext = useCallback(() => {
    if (step === 1) return !!title.trim() && !!description.trim() && !!location.trim();
    if (step === 3) return photos.length >= 5;
    return true;
  }, [step, title, description, location, photos.length]);

  // Redirect non-hosts to become-host page
  if (!isHost && user) {
    navigate("/become-host");
    return null;
  }

  const validate = (): string | null => {
    if (!title.trim()) return "Le titre est obligatoire.";
    if (!description.trim()) return "La description est obligatoire.";
    if (!location.trim()) return "La localisation est obligatoire.";
    if (!price || parseInt(price) <= 0) return "Le prix par nuit est obligatoire.";
    if (photos.length < 5) return "Vous devez ajouter au moins 5 photos.";
    return null;
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour publier un logement.");
      navigate("/login");
      return;
    }

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      // Upload photos to storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, photo.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      // Insert listing
      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          property_type: selectedType,
          location: location.trim(),
          bedrooms,
          bathrooms,
          capacity,
          price_per_night: parseInt(price),
          photos: photoUrls,
          status: "published",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setPublishedId(data.id);
      // Invalidate listings cache so homepage and explore show the new listing immediately
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      toast.success("Votre logement a été publié avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (publishedId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-warm-gray flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Votre logement a été publié avec succès !
            </h1>
            <p className="text-muted-foreground mb-8">
              Votre annonce est maintenant visible par les voyageurs sur la plateforme.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate(`/property/${publishedId}`)}
                className="rounded-full bg-accent text-accent-foreground gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir mon annonce
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-full gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Publier un autre logement
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-warm-gray">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">Étape {step} sur {TOTAL_STEPS}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Type & Basic Info */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Quel type de logement proposez-vous ?
                </h1>
                <p className="text-muted-foreground mb-8">Sélectionnez le type qui correspond le mieux à votre propriété.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {propertyTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer border-2 transition-all hover:shadow-[var(--shadow-card-hover)] ${
                        selectedType === type.value ? "border-accent shadow-[var(--shadow-card-hover)]" : "border-transparent"
                      }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      <CardContent className="p-6 text-center">
                        <span className="text-3xl mb-3 block">{type.icon}</span>
                        <p className="font-medium text-foreground">{type.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce *</label>
                      <Input placeholder="Ex: Belle villa avec piscine à Saly" className="rounded-xl h-12" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                      <Textarea placeholder="Décrivez votre logement, son ambiance, ses points forts..." rows={4} className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        Adresse / Localisation *
                      </label>
                      <Input placeholder="Ville, quartier, rue..." className="rounded-xl h-12" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Details & Amenities */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Détails de votre logement
                </h1>
                <p className="text-muted-foreground mb-8">Précisez la capacité et les équipements disponibles.</p>

                <Card className="border-none shadow-[var(--shadow-card)] mb-8">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">Capacité</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Bed className="w-4 h-4 text-accent" /> Chambres
                        </label>
                        <Input type="number" min={1} className="rounded-xl h-12" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value) || 1)} />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Bath className="w-4 h-4 text-accent" /> Salles de bain
                        </label>
                        <Input type="number" min={1} className="rounded-xl h-12" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value) || 1)} />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Users className="w-4 h-4 text-accent" /> Voyageurs max
                        </label>
                        <Input type="number" min={1} className="rounded-xl h-12" value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 1)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">Équipements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {amenitiesList.map((amenity) => (
                        <div
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAmenities.includes(amenity.id) ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                          }`}
                        >
                          <amenity.icon className={`w-5 h-5 ${selectedAmenities.includes(amenity.id) ? "text-accent" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Ajoutez vos photos
                </h1>
                <p className="text-muted-foreground mb-8">
                  Des photos de qualité attirent plus de voyageurs. La première photo sera la photo principale de votre annonce.
                </p>
                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <PhotoUploader photos={photos} onChange={setPhotos} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Pricing & Rules */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Fixez votre tarif
                </h1>
                <p className="text-muted-foreground mb-8">Définissez un prix compétitif pour attirer les voyageurs.</p>

                <Card className="border-none shadow-[var(--shadow-card)] mb-8">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                        <DollarSign className="w-4 h-4 text-accent" />
                        Prix par nuit (FCFA) *
                      </label>
                      <Input type="number" placeholder="Ex: 45000" className="rounded-xl h-14 text-xl font-semibold text-center" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Réduction semaine (7+ nuits)</label>
                        <Input type="number" placeholder="Ex: 10" className="rounded-xl h-12" value={weekDiscount} onChange={(e) => setWeekDiscount(e.target.value)} />
                        <span className="text-xs text-muted-foreground">% de réduction</span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Réduction mois (30+ nuits)</label>
                        <Input type="number" placeholder="Ex: 20" className="rounded-xl h-12" value={monthDiscount} onChange={(e) => setMonthDiscount(e.target.value)} />
                        <span className="text-xs text-muted-foreground">% de réduction</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">Règles de la maison</h3>
                    <div className="space-y-3">
                      {rulesList.map((rule) => (
                        <div key={rule} className="flex items-center gap-3">
                          <Checkbox
                            id={rule}
                            checked={selectedRules.includes(rule)}
                            onCheckedChange={() => toggleRule(rule)}
                          />
                          <label htmlFor={rule} className="text-sm text-foreground cursor-pointer">{rule}</label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              className="rounded-full gap-1"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            {step < TOTAL_STEPS ? (
              <Button
                className="rounded-full bg-primary text-primary-foreground gap-1"
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                disabled={!canGoNext()}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="rounded-full bg-accent text-accent-foreground gap-2"
                onClick={handlePublish}
                disabled={loading || !price}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publication en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Publier mon logement
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateListing;
