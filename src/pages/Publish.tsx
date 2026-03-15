import { Component, type ErrorInfo, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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
  RefreshCcw,
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

class PageErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Top-level recovery — prevents white screen
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            La page de création d'annonce a rencontré un problème. Vos données sont sauvegardées automatiquement.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCcw className="w-4 h-4 mr-1" /> Réessayer
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => { window.location.href = "/dashboard"; }}
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DRAFT_STORAGE_KEY = "terangasejour_listing_draft";

function loadDraftFromStorage(): Partial<ListingDraft> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore blockedDates as Date objects
    if (Array.isArray(parsed.blockedDates)) {
      parsed.blockedDates = parsed.blockedDates.map((d: string) => new Date(d));
    }
    // Photos with File objects cannot be serialized — we only persist metadata
    // so photos will be empty on reload (File/Blob can't survive localStorage)
    parsed.photos = [];
    return parsed as Partial<ListingDraft> & { _step?: number };
  } catch {
    return null;
  }
}

function saveDraftToStorage(draft: ListingDraft, currentStep: number) {
  try {
    const serializable = {
      title: draft.title,
      description: draft.description,
      propertyType: draft.propertyType,
      location: draft.location,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      capacity: draft.capacity,
      price: draft.price,
      currency: draft.currency,
      availabilityType: draft.availabilityType,
      blockedDates: draft.blockedDates.map((d) => d.toISOString()),
      _step: currentStep,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

const Publish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load saved draft on mount
  const savedDraft = useMemo(() => loadDraftFromStorage(), []) as (Partial<ListingDraft> & { _step?: number }) | null;

  const [step, setStep] = useState(() => {
    const s = savedDraft?._step;
    return Number.isInteger(s) ? Math.min(Math.max(s!, 0), STEP_LABELS.length - 1) : 0;
  });
  const [title, setTitle] = useState(savedDraft?.title ?? "");
  const [description, setDescription] = useState(savedDraft?.description ?? "");
  const [propertyType, setPropertyType] = useState(savedDraft?.propertyType ?? "villa");
  const [location, setLocation] = useState(savedDraft?.location ?? "");
  const [bedrooms, setBedrooms] = useState(savedDraft?.bedrooms ?? 1);
  const [bathrooms, setBathrooms] = useState(savedDraft?.bathrooms ?? 1);
  const [capacity, setCapacity] = useState(savedDraft?.capacity ?? 2);
  const [price, setPrice] = useState(savedDraft?.price ?? "0");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>(savedDraft?.availabilityType ?? "always");
  const [blockedDates, setBlockedDates] = useState<Date[]>(
    Array.isArray(savedDraft?.blockedDates) ? savedDraft!.blockedDates : []
  );
  const [loading, setLoading] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [submitUploadProgress, setSubmitUploadProgress] = useState({ current: 0, total: 0 });

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

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    saveDraftToStorage(listingDraft, safeStep);
  }, [listingDraft, safeStep]);

  const validPhotoCount = listingDraft.photos.filter((p) => !p.error && p.validated).length;
  const hasPhotoErrors = listingDraft.photos.some((p) => !!p.error);

  const mapUploadError = (rawMessage?: string) => {
    const message = (rawMessage || "").toLowerCase();
    if (message.includes("mime") || message.includes("content-type")) {
      return "Format non accepté. Utilisez JPG, PNG ou WEBP.";
    }
    if (message.includes("size") || message.includes("too large") || message.includes("file_size_limit")) {
      return "Image trop lourde. Taille maximale : 20 MB.";
    }
    return "Échec d'upload. Vérifiez l'image et réessayez.";
  };

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
        if (isPhotoProcessing) {
          return "Traitement des images en cours. Veuillez patienter.";
        }
        if (validPhotoCount < 1) {
          return `Ajoutez au moins 1 photo valide.`;
        }
        if (hasPhotoErrors) {
          return "Veuillez corriger les images avant de continuer.";
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
    try {
      const error = validateStep(safeStep);
      if (error) {
        toast.error(error);
        return;
      }

      const nextStep = Math.min(safeStep + 1, STEP_LABELS.length - 1);
      window.scrollTo({ top: 0 });
      setStep(nextStep);
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const goBack = () => {
    const previousStep = Math.max(safeStep - 1, 0);
    window.scrollTo({ top: 0 });
    setStep(previousStep);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour publier un logement");
      navigate("/login");
      return;
    }

    if (isPhotoProcessing) {
      toast.error("Traitement des images en cours. Veuillez patienter.");
      setStep(1);
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
      setSubmitUploadProgress({ current: 0, total: validPhotos.length });

      for (let i = 0; i < validPhotos.length; i++) {
        const photo = validPhotos[i];

        if (photo.file.size > 20 * 1024 * 1024) {
          const sizeError = "Image trop lourde. Taille maximale : 20 MB.";
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? {
                    ...p,
                    error: sizeError,
                    validated: false,
                  }
                : p
            )
          );
          setStep(1);
          throw new Error(`"${photo.file.name}" : ${sizeError}`);
        }

        const ext = photo.file.name.split(".").pop() || "webp";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, photo.file, {
          contentType: photo.file.type || "image/webp",
        });

        if (uploadError) {
          const friendlyError = mapUploadError(uploadError.message);
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? {
                    ...p,
                    error: friendlyError,
                    validated: false,
                  }
                : p
            )
          );
          setStep(1);
          throw new Error(`"${photo.file.name}" : ${friendlyError}`);
        }

        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
        setSubmitUploadProgress({ current: i + 1, total: validPhotos.length });
      }

      const safePrice = Number.parseInt(listingDraft.price || "0", 10);

      const bookingMode = listingDraft.availabilityType === "request_only" ? "request" : "instant";
      const availabilityMode = listingDraft.availabilityType === "always" ? "always" : "request";

      const { data: insertedListing, error: insertError } = await supabase
        .from("listings")
        .insert({
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
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

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
      try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setLoading(false);
      setSubmitUploadProgress({ current: 0, total: 0 });
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
              <div
                key={safeStep}
                className="animate-fade-in"
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
                      Ajoutez jusqu'à 10 photos de votre logement. Les images seront optimisées automatiquement.
                    </p>
                    <PhotoUploader
                      photos={listingDraft.photos}
                      onChange={setPhotos}
                      onProcessingChange={setIsPhotoProcessing}
                    />
                    {isPhotoProcessing && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        Traitement des images en cours…
                      </p>
                    )}
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
                        <span className="font-medium text-foreground capitalize">{listingDraft.propertyType || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Localisation</span>
                        <span className="font-medium text-foreground">{listingDraft.location || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Chambres / SdB / Capacité</span>
                        <span className="font-medium text-foreground">{listingDraft.bedrooms || 1} / {listingDraft.bathrooms || 1} / {listingDraft.capacity || 1}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Prix par nuit</span>
                        <span className="font-bold text-foreground">{(Number.isFinite(displayedPrice) ? displayedPrice : 0).toLocaleString("fr-FR")} {listingDraft.currency}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Photos</span>
                        <span className="font-medium text-foreground">{(listingDraft.photos || []).length} photo(s)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Disponibilité</span>
                        <span className="font-medium text-foreground">
                          {listingDraft.availabilityType === "always" && "Toujours disponible (réservation instantanée)"}
                          {listingDraft.availabilityType === "request_only" && `Sur demande${(listingDraft.blockedDates || []).length > 0 ? ` (${(listingDraft.blockedDates || []).length} date(s) bloquée(s))` : ""}`}
                        </span>
                      </div>
                    </div>

                    {(listingDraft.photos || []).length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {(listingDraft.photos || []).slice(0, 5).map((p, i) => (
                          <div key={p?.id || i} className="relative w-full aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted">
                            {p?.preview ? (
                              <img
                                src={p.preview}
                                alt={`Photo ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Camera className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
          </StepRenderBoundary>

          <div className="flex items-center justify-between mt-6 gap-3">
            {safeStep > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} className="rounded-xl h-12 px-6" disabled={loading}>
                <ChevronLeft className="w-4 h-4 mr-1" />Retour
              </Button>
            ) : (
              <div />
            )}

            {safeStep < STEP_LABELS.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={loading || (safeStep === 1 && (isPhotoProcessing || validPhotoCount < 1 || hasPhotoErrors))}
                className="rounded-xl h-12 px-6 bg-primary text-primary-foreground"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isPhotoProcessing}
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

          {loading && submitUploadProgress.total > 0 && (
            <div className="mt-3 bg-muted/50 border border-border rounded-xl p-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                Upload des images : {submitUploadProgress.current}/{submitUploadProgress.total}
              </p>
              <Progress
                value={(submitUploadProgress.current / submitUploadProgress.total) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Publish;
