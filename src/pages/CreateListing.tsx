import { useState } from "react";
import { Link } from "react-router-dom";
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
  Home, Camera, MapPin, DollarSign, Bed, Bath, Users,
  ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind,
  UtensilsCrossed, Tv, Lock, Flower2, CheckCircle, Upload, X
} from "lucide-react";

const propertyTypes = [
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "appartement", label: "Appartement", icon: "🏢" },
  { value: "maison", label: "Maison d'hôtes", icon: "🏠" },
  { value: "lodge", label: "Lodge", icon: "🌿" },
  { value: "loft", label: "Loft", icon: "🏙️" },
  { value: "studio", label: "Studio", icon: "🛏️" },
];

const amenities = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "pool", label: "Piscine", icon: Waves },
  { id: "ac", label: "Climatisation", icon: Wind },
  { id: "kitchen", label: "Cuisine", icon: UtensilsCrossed },
  { id: "tv", label: "Télévision", icon: Tv },
  { id: "security", label: "Sécurité 24h", icon: Lock },
  { id: "garden", label: "Jardin", icon: Flower2 },
];

const TOTAL_STEPS = 4;

const CreateListing = () => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const progress = (step / TOTAL_STEPS) * 100;

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
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Quel type de logement proposez-vous ?
                </h1>
                <p className="text-muted-foreground mb-8">Sélectionnez le type qui correspond le mieux à votre propriété.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {propertyTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer border-2 transition-all hover:shadow-[var(--shadow-card-hover)] ${
                        selectedType === type.value
                          ? "border-accent shadow-[var(--shadow-card-hover)]"
                          : "border-transparent"
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
                      <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce</label>
                      <Input placeholder="Ex: Belle villa avec piscine à Saly" className="rounded-xl h-12" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                      <Textarea placeholder="Décrivez votre logement, son ambiance, ses points forts..." rows={4} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        Adresse / Localisation
                      </label>
                      <Input placeholder="Ville, quartier, rue..." className="rounded-xl h-12" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Details & Amenities */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
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
                        <Input type="number" min={1} defaultValue={1} className="rounded-xl h-12" />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Bath className="w-4 h-4 text-accent" /> Salles de bain
                        </label>
                        <Input type="number" min={1} defaultValue={1} className="rounded-xl h-12" />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                          <Users className="w-4 h-4 text-accent" /> Voyageurs max
                        </label>
                        <Input type="number" min={1} defaultValue={2} className="rounded-xl h-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">Équipements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAmenities.includes(amenity.id)
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/30"
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
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Ajoutez vos photos
                </h1>
                <p className="text-muted-foreground mb-8">Des photos de qualité attirent plus de voyageurs. Ajoutez au moins 5 photos.</p>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-accent transition-colors cursor-pointer mb-6">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium text-foreground mb-1">Glissez vos photos ici</p>
                      <p className="text-sm text-muted-foreground">ou cliquez pour parcourir</p>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG • Max 10 photos • 5 Mo par photo</p>
                    </div>

                    {/* Preview grid placeholder */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square rounded-xl bg-muted flex items-center justify-center">
                          <Camera className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Pricing */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Fixez votre tarif
                </h1>
                <p className="text-muted-foreground mb-8">Définissez un prix compétitif pour attirer les voyageurs.</p>

                <Card className="border-none shadow-[var(--shadow-card)] mb-8">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                        <DollarSign className="w-4 h-4 text-accent" />
                        Prix par nuit (FCFA)
                      </label>
                      <Input type="number" placeholder="Ex: 45000" className="rounded-xl h-14 text-xl font-semibold text-center" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Réduction semaine (7+ nuits)</label>
                        <Input type="number" placeholder="Ex: 10" className="rounded-xl h-12" />
                        <span className="text-xs text-muted-foreground">% de réduction</span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Réduction mois (30+ nuits)</label>
                        <Input type="number" placeholder="Ex: 20" className="rounded-xl h-12" />
                        <span className="text-xs text-muted-foreground">% de réduction</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-[var(--shadow-card)]">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-4">Règles de la maison</h3>
                    <div className="space-y-3">
                      {["Animaux acceptés", "Fumeurs autorisés", "Fêtes/événements autorisés", "Arrivée autonome (serrure connectée)"].map((rule) => (
                        <div key={rule} className="flex items-center gap-3">
                          <Checkbox id={rule} />
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
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            {step < TOTAL_STEPS ? (
              <Button
                className="rounded-full bg-primary text-primary-foreground gap-1"
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button className="rounded-full bg-accent text-accent-foreground gap-2">
                <CheckCircle className="w-4 h-4" />
                Publier mon logement
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
