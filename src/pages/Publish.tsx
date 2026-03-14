import { Component, type ErrorInfo, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Camera,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Users,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import AvailabilityStep, { type AvailabilityType } from "@/components/publish/AvailabilityStep";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateListingText } from "@/lib/contentFilter";
import { useQueryClient } from "@tanstack/react-query";

const STEP_LABELS = [
  { icon: Home, title: "Description" },
  { icon: Camera, title: "Photos" },
  { icon: DollarSign, title: "Tarif" },
  { icon: Clock, title: "Disponibilité" },
  { icon: CheckCircle, title: "Publier" },
] as const;

const DEFAULT_CURRENCY = "XOF";

import type { PhotoItem } from "@/components/PhotoUploader";

interface ListingDraft {
  title: string;
  description: string;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  price: string;
  currency: string;
  photos: PhotoItem[];
  availabilityType: AvailabilityType;
  blockedDates: Date[];
}

class StepRenderBoundary extends Component<
  { onFallback: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Render-safe fallback only
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Une erreur est survenue sur cette étape.</p>
          </div>
          <p className="text-sm text-muted-foreground">Retour à l’étape précédente pour continuer.</p>
          <Button type="button" variant="outline" onClick={this.props.onFallback} className="rounded-xl">
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
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
  const [price, setPrice] = useState("0");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>("always");
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  const listingDraft = useMemo<ListingDraft>(
    () => ({
      title: title ?? "",
      description: description ?? "",
      propertyType: propertyType ?? "villa",
      location: location ?? "",
      bedrooms: Number.isFinite(bedrooms) ? bedrooms : 1,
      bathrooms: Number.isFinite(bathrooms) ? bathrooms : 1,
      capacity: Number.isFinite(capacity) ? capacity : 1,
      price: price ?? "0",
      currency: DEFAULT_CURRENCY,
      photos: Array.isArray(photos)
        ? photos.filter((p) => !!p?.id && !!p?.file && !!p?.preview)
        : [],
      availabilityType: availabilityType ?? "always",
      blockedDates: Array.isArray(blockedDates) ? blockedDates : [],
    }),
    [title, description, propertyType, location, bedrooms, bathrooms, capacity, price, photos, availabilityType, blockedDates]
  );

  const safeStep = useMemo(() => {
    if (!Number.isInteger(step)) return 0;
    return Math.min(Math.max(step, 0), STEP_LABELS.length - 1);
  }, [step]);

  useEffect(() => {
    if (safeStep !== step) setStep(safeStep);
  }, [safeStep, step]);

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 0: {
        if (!listingDraft.title.trim()) return "Veuillez saisir un titre pour votre annonce.";
        if (!listingDraft.location.trim()) return "Veuillez indiquer la localisation.";
        // Check for blocked personal contact info
        const titleCheck = validateListingText(listingDraft.title);
        if (titleCheck) return titleCheck;
        const descCheck = validateListingText(listingDraft.description);
        if (descCheck) return descCheck;
        return null;
      }
      case 1:
        if (listingDraft.photos.length < 5) {
          return `Ajoutez au moins 5 photos (${listingDraft.photos.length}/5).`;
        }
        if (listingDraft.photos.some((p) => !!p.error)) {
          return "Veuillez remplacer les images non conformes avant de continuer.";
        }
        return null;
      case 2: {
        const parsedPrice = Number.parseInt(listingDraft.price || "0", 10);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
          return "Veuillez indiquer un prix valide.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const goNext = () => {
    const error = validateStep(safeStep);
    if (error) {
      toast.error(error);
      return;
    }

    const nextStep = Math.min(safeStep + 1, STEP_LABELS.length - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(nextStep);
  };

  const goBack = () => {
    const previousStep = Math.max(safeStep - 1, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(previousStep);
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
      const validPhotos = listingDraft.photos.filter((p) => !p.error);
      for (const photo of validPhotos) {
        const ext = photo.file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, photo.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const safePrice = Number.parseInt(listingDraft.price || "0", 10);

      const bookingMode = listingDraft.availabilityType === "request_only" ? "request" : "instant";
      const availabilityMode = listingDraft.availabilityType === "always" ? "always" : "request";

      const { data: insertedListing, error: insertError } = await supabase.from("listings").insert({
        user_id: user.id,
        title: listingDraft.title.trim(),
        description: listingDraft.description.trim() || null,
        property_type: listingDraft.propertyType,
        location: listingDraft.location.trim(),
        bedrooms: listingDraft.bedrooms,
        bathrooms: listingDraft.bathrooms,
        capacity: listingDraft.capacity,
        price_per_night: safePrice,
        photos: photoUrls,
        status: "published",
        booking_mode: bookingMode,
        availability_mode: availabilityMode,
      }).select("id").single();

      if (insertError) throw insertError;

      // Insert blocked dates if request mode with blocked dates
      if (listingDraft.availabilityType === "request_only" && listingDraft.blockedDates.length > 0 && insertedListing) {
        const blockedRows = listingDraft.blockedDates.map((d) => ({
          listing_id: insertedListing.id,
          date: format(d, "yyyy-MM-dd"),
        }));
        await supabase.from("blocked_dates").insert(blockedRows);
      }

      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      toast.success("Logement publié avec succès !");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  const displayedPrice = Number.parseInt(listingDraft.price || "0", 10);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEP_LABELS.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < safeStep
                      ? "bg-accent text-accent-foreground"
                      : i === safeStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < safeStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i === safeStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 ${i < safeStep ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <StepRenderBoundary onFallback={goBack}>
            <AnimatePresence mode="wait">
              <motion.div
                key={safeStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                {safeStep === 0 && (
                  <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                    <h2 className="font-display text-xl font-bold text-foreground">Décrivez votre logement</h2>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce *</label>
                      <Input
                        placeholder="Ex: Belle villa avec piscine à Saly"
                        className="rounded-xl h-12"
                        value={listingDraft.title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                      <Textarea
                        placeholder="Décrivez votre logement en détail..."
                        rows={4}
                        className="rounded-xl"
                        value={listingDraft.description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        Ne partagez pas vos coordonnées personnelles. Les échanges avec les voyageurs se feront via la plateforme.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Type de logement</label>
                        <select
                          className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                          value={listingDraft.propertyType}
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
                          value={listingDraft.location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          <Bed className="w-3.5 h-3.5 inline mr-1" />Chambres
                        </label>
                        <Input
                          type="number"
                          min={1}
                          className="rounded-xl h-12"
                          value={listingDraft.bedrooms}
                          onChange={(e) => setBedrooms(Number(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          <Bath className="w-3.5 h-3.5 inline mr-1" />Salles de bain
                        </label>
                        <Input
                          type="number"
                          min={1}
                          className="rounded-xl h-12"
                          value={listingDraft.bathrooms}
                          onChange={(e) => setBathrooms(Number(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          <Users className="w-3.5 h-3.5 inline mr-1" />Capacité
                        </label>
                        <Input
                          type="number"
                          min={1}
                          className="rounded-xl h-12"
                          value={listingDraft.capacity}
                          onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {safeStep === 1 && (
                  <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      <Camera className="w-5 h-5 inline mr-2" />Ajoutez des photos
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Des photos de qualité attirent plus de voyageurs. Ajoutez au moins 5 photos.
                    </p>
                    <PhotoUploader photos={listingDraft.photos} onChange={setPhotos} />
                  </div>
                )}

                {safeStep === 2 && (
                  <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      <DollarSign className="w-5 h-5 inline mr-2" />Fixez votre prix
                    </h2>
                    <p className="text-sm text-muted-foreground">Définissez un tarif compétitif par nuit.</p>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Prix par nuit ({listingDraft.currency}) *
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 45000"
                        className="rounded-xl h-14 text-lg font-semibold"
                        value={listingDraft.price}
                        onChange={(e) => setPrice(e.target.value || "0")}
                      />
                    </div>
                    {Number.isFinite(displayedPrice) && displayedPrice > 0 && (
                      <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                        Tarif affiché : <strong className="text-foreground">{displayedPrice.toLocaleString("fr-FR")} {listingDraft.currency} / nuit</strong>
                      </div>
                    )}
                  </div>
                )}

                {safeStep === 3 && (
                  <AvailabilityStep
                    availabilityType={listingDraft.availabilityType}
                    blockedDates={listingDraft.blockedDates}
                    onChangeType={setAvailabilityType}
                    onChangeBlockedDates={setBlockedDates}
                  />
                )}

                {safeStep === 4 && (
                  <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      <CheckCircle className="w-5 h-5 inline mr-2" />Récapitulatif
                    </h2>
                    <p className="text-sm text-muted-foreground">Vérifiez les informations avant de publier votre logement.</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Titre</span>
                        <span className="font-medium text-foreground text-right max-w-[60%]">{listingDraft.title || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium text-foreground capitalize">{listingDraft.propertyType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Localisation</span>
                        <span className="font-medium text-foreground">{listingDraft.location || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Chambres / SdB / Capacité</span>
                        <span className="font-medium text-foreground">{listingDraft.bedrooms} / {listingDraft.bathrooms} / {listingDraft.capacity}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Prix par nuit</span>
                        <span className="font-bold text-foreground">{Number.isFinite(displayedPrice) ? displayedPrice.toLocaleString("fr-FR") : "0"} {listingDraft.currency}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Photos</span>
                        <span className="font-medium text-foreground">{listingDraft.photos.length} photo(s)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Disponibilité</span>
                        <span className="font-medium text-foreground">
                          {listingDraft.availabilityType === "always" && "Toujours disponible (réservation instantanée)"}
                          {listingDraft.availabilityType === "request_only" && `Sur demande${listingDraft.blockedDates.length > 0 ? ` (${listingDraft.blockedDates.length} date(s) bloquée(s))` : ""}`}
                        </span>
                      </div>
                    </div>

                    {listingDraft.photos.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {listingDraft.photos.slice(0, 5).map((p, i) => (
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
          </StepRenderBoundary>

          <div className="flex items-center justify-between mt-6 gap-3">
            {safeStep > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} className="rounded-xl h-12 px-6">
                <ChevronLeft className="w-4 h-4 mr-1" />Précédent
              </Button>
            ) : (
              <div />
            )}

            {safeStep < STEP_LABELS.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={safeStep === 1 && (listingDraft.photos.filter(p => !p.error && p.validated).length < 5 || listingDraft.photos.some(p => !!p.error))}
                className="rounded-xl h-12 px-6 bg-primary text-primary-foreground disabled:opacity-50"
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
