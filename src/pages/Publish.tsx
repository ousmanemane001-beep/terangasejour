import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Camera, MapPin, DollarSign, Bed, Bath, Users,
  CheckCircle, Loader2, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const STEP_LABELS = [
  { icon: Home, title: "Description" },
  { icon: Camera, title: "Photos" },
  { icon: DollarSign, title: "Tarif" },
  { icon: CheckCircle, title: "Publier" },
];

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

interface ListingDraft {
  title: string;
  description: string;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  price: string;
  photos: PhotoItem[];
}

const Publish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("villa");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const listingDraft = useMemo<ListingDraft>(() => ({
    title: title ?? "",
    description: description ?? "",
    propertyType: propertyType ?? "villa",
    location: location ?? "",
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : 1,
    bathrooms: Number.isFinite(bathrooms) ? bathrooms : 1,
    capacity: Number.isFinite(capacity) ? capacity : 1,
    price: price ?? "",
    photos: Array.isArray(photos) ? photos.filter((p) => !!p?.id && !!p?.file && !!p?.preview) : [],
  }), [title, description, propertyType, location, bedrooms, bathrooms, capacity, price, photos]);

  const canRenderStep = (s: number): boolean => {
    if (s === 1 && !Array.isArray(listingDraft.photos)) return false;
    if (s === 2 && typeof listingDraft.price !== "string") return false;
    if (s === 3 && (!listingDraft.title || !listingDraft.location || listingDraft.photos.length === 0)) return false;
    return true;
  };

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 0:
        if (!listingDraft.title.trim()) return "Veuillez saisir un titre pour votre annonce.";
        if (!listingDraft.location.trim()) return "Veuillez indiquer la localisation.";
        return null;
      case 1:
        if (listingDraft.photos.length < 5) return `Ajoutez au moins 5 photos (${listingDraft.photos.length}/5).`;
        return null;
      case 2:
        if (!listingDraft.price || parseInt(listingDraft.price) <= 0) return "Veuillez indiquer un prix valide.";
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!canRenderStep(step)) {
      setStep((prev) => Math.max(0, prev - 1));
      toast.error("Données incomplètes, retour à l'étape précédente.");
    }
  }, [step, listingDraft]);

  const goNext = () => {
    if (!canRenderStep(step)) {
      toast.error("Impossible de continuer : données manquantes.");
      return;
    }
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => Math.min(Math.max(0, s + 1), 3));
  };

  const goBack = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour publier un logement");
      navigate("/login");
      return;
    }

    const error = validateStep(0) || validateStep(1) || validateStep(2);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of listingDraft.photos) {
        const ext = photo.file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, photo.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const { error: insertError } = await supabase.from("listings").insert({
        user_id: user.id,
        title: listingDraft.title.trim(),
        description: listingDraft.description.trim() || null,
        property_type: listingDraft.propertyType,
        location: listingDraft.location.trim(),
        bedrooms: listingDraft.bedrooms,
        bathrooms: listingDraft.bathrooms,
        capacity: listingDraft.capacity,
        price_per_night: parseInt(listingDraft.price),
        photos: photoUrls,
        status: "published",
      });

      if (insertError) throw insertError;
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      toast.success("Logement publié avec succès !");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEP_LABELS.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-accent text-accent-foreground"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {s.title}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 ${
                    i < step ? "bg-accent" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Description */}
              {step === 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Décrivez votre logement
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Titre de l'annonce *
                    </label>
                    <Input
                      placeholder="Ex: Belle villa avec piscine à Saly"
                      className="rounded-xl h-12"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Description
                    </label>
                    <Textarea
                      placeholder="Décrivez votre logement en détail..."
                      rows={4}
                      className="rounded-xl"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Type de logement
                      </label>
                      <select
                        className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                      >
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
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        Localisation *
                      </label>
                      <Input
                        placeholder="Ville, quartier"
                        className="rounded-xl h-12"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Bed className="w-3.5 h-3.5 inline mr-1" />
                        Chambres
                      </label>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-xl h-12"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Bath className="w-3.5 h-3.5 inline mr-1" />
                        Salles de bain
                      </label>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-xl h-12"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Users className="w-3.5 h-3.5 inline mr-1" />
                        Capacité
                      </label>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-xl h-12"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Photos */}
              {step === 1 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    <Camera className="w-5 h-5 inline mr-2" />
                    Ajoutez des photos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Des photos de qualité attirent plus de voyageurs. Ajoutez au moins 5 photos.
                  </p>
                  <PhotoUploader photos={photos} onChange={setPhotos} />
                </div>
              )}

              {/* Step 2: Price */}
              {step === 2 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Fixez votre prix
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Définissez un tarif compétitif par nuit en FCFA.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Prix par nuit (FCFA) *
                    </label>
                    <Input
                      type="number"
                      placeholder="Ex: 45000"
                      className="rounded-xl h-14 text-lg font-semibold"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  {price && parseInt(price) > 0 && (
                    <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                      <p>
                        Tarif affiché : <strong className="text-foreground">{parseInt(price).toLocaleString("fr-FR")} FCFA / nuit</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review & Publish */}
              {step === 3 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Récapitulatif
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les informations avant de publier votre logement.
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Titre</span>
                      <span className="font-medium text-foreground text-right max-w-[60%]">{title || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground capitalize">{propertyType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Localisation</span>
                      <span className="font-medium text-foreground">{location || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Chambres / SdB / Capacité</span>
                      <span className="font-medium text-foreground">{bedrooms} / {bathrooms} / {capacity}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Prix par nuit</span>
                      <span className="font-bold text-foreground">{price ? parseInt(price).toLocaleString("fr-FR") : "—"} FCFA</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Photos</span>
                      <span className="font-medium text-foreground">{photos.length} photo(s)</span>
                    </div>
                  </div>

                  {/* Photo thumbnails */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {photos.slice(0, 5).map((p, i) => (
                        <img
                          key={p.id}
                          src={p.preview}
                          alt={`Photo ${i + 1}`}
                          className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="rounded-xl h-12 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                className="rounded-xl h-12 px-6 bg-primary text-primary-foreground"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl h-12 px-8 bg-primary text-primary-foreground font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Publication en cours…
                  </>
                ) : (
                  "Publier mon logement"
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

export default Publish;
