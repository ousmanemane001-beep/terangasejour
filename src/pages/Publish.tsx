import { Component, type ErrorInfo, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Camera, Bed, DollarSign, CheckCircle, Loader2,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCcw,
} from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import PropertyTypeStep from "@/components/publish/PropertyTypeStep";
import DetailsStep from "@/components/publish/DetailsStep";
import PriceAvailabilityStep from "@/components/publish/PriceAvailabilityStep";
import type { BookingMode } from "@/components/publish/BookingModeStep";
import type { AvailabilitySubType } from "@/components/publish/AvailabilityTypeStep";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateListingText } from "@/lib/contentFilter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { PhotoItem } from "@/components/PhotoUploader";

const STEPS = [
  { id: "type_location", icon: MapPin, title: "Type & Lieu" },
  { id: "photos", icon: Camera, title: "Photos" },
  { id: "details", icon: Bed, title: "Détails" },
  { id: "price_availability", icon: DollarSign, title: "Prix" },
  { id: "summary", icon: CheckCircle, title: "Publier" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const DEFAULT_CURRENCY = "XOF";

interface ListingDraft {
  propertyType: string;
  location: string;
  capacity: number;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  price: string;
  currency: string;
  photos: PhotoItem[];
  bookingMode: BookingMode;
  availabilitySubType: AvailabilitySubType;
  blockedDates: Date[];
}

class StepRenderBoundary extends Component<
  { onFallback: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Une erreur est survenue sur cette étape.</p>
          </div>
          <Button type="button" variant="outline" onClick={this.props.onFallback} className="rounded-xl">
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            La page de création d&apos;annonce a rencontré un problème.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => this.setState({ hasError: false })}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Réessayer
            </Button>
            <Button className="rounded-xl" onClick={() => { window.location.href = "/dashboard"; }}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DRAFT_STORAGE_KEY = "terangasejour_listing_draft_v2";

function loadDraft(): Partial<ListingDraft> & { _step?: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.blockedDates)) {
      parsed.blockedDates = parsed.blockedDates.map((d: string) => new Date(d));
    }
    parsed.photos = [];
    return parsed;
  } catch { return null; }
}

function saveDraft(draft: ListingDraft, step: number) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      propertyType: draft.propertyType,
      location: draft.location,
      capacity: draft.capacity,
      title: draft.title,
      description: draft.description,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      amenities: draft.amenities,
      price: draft.price,
      bookingMode: draft.bookingMode,
      availabilitySubType: draft.availabilitySubType,
      blockedDates: draft.blockedDates.map((d) => d.toISOString()),
      _step: step,
    }));
  } catch {}
}

const Publish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saved = useMemo(() => loadDraft(), []);

  const [step, setStep] = useState(() => Math.min(Math.max(saved?._step ?? 0, 0), 4));
  const [propertyType, setPropertyType] = useState(saved?.propertyType ?? "villa");
  const [location, setLocation] = useState(saved?.location ?? "");
  const [capacity, setCapacity] = useState(saved?.capacity ?? 2);
  const [title, setTitle] = useState(saved?.title ?? "");
  const [description, setDescription] = useState(saved?.description ?? "");
  const [bedrooms, setBedrooms] = useState(saved?.bedrooms ?? 1);
  const [bathrooms, setBathrooms] = useState(saved?.bathrooms ?? 1);
  const [amenities, setAmenities] = useState<string[]>(saved?.amenities ?? []);
  const [price, setPrice] = useState(saved?.price ?? "0");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [bookingMode, setBookingMode] = useState<BookingMode>(saved?.bookingMode ?? "instant");
  const [availabilitySubType, setAvailabilitySubType] = useState<AvailabilitySubType>(saved?.availabilitySubType ?? "contact");
  const [blockedDates, setBlockedDates] = useState<Date[]>(Array.isArray(saved?.blockedDates) ? saved!.blockedDates : []);
  const [loading, setLoading] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const currentStepId = STEPS[step].id;

  const draft = useMemo<ListingDraft>(() => ({
    propertyType, location, capacity, title, description, bedrooms, bathrooms, amenities,
    price, currency: DEFAULT_CURRENCY, photos: photos.filter((p) => !!p?.id && !!p?.file && !!p?.preview),
    bookingMode, availabilitySubType, blockedDates,
  }), [propertyType, location, capacity, title, description, bedrooms, bathrooms, amenities, price, photos, bookingMode, availabilitySubType, blockedDates]);

  useEffect(() => { saveDraft(draft, step); }, [draft, step]);

  const validPhotoCount = draft.photos.filter((p) => !p.error && p.validated).length;
  const hasPhotoErrors = draft.photos.some((p) => !!p.error);

  const handleBookingModeChange = (mode: BookingMode) => {
    setBookingMode(mode);
    if (mode === "instant") { setAvailabilitySubType("contact"); setBlockedDates([]); }
  };

  const handleAvailabilitySubTypeChange = (sub: AvailabilitySubType) => {
    setAvailabilitySubType(sub);
    if (sub === "contact") setBlockedDates([]);
  };

  const validate = (id: StepId): string | null => {
    switch (id) {
      case "type_location":
        if (!location.trim()) return "Veuillez indiquer la localisation.";
        return null;
      case "photos":
        if (isPhotoProcessing) return "Traitement des images en cours.";
        if (validPhotoCount < 1) return "Ajoutez au moins 1 photo valide.";
        if (hasPhotoErrors) return "Corrigez les images avant de continuer.";
        return null;
      case "details":
        if (!title.trim()) return "Veuillez saisir un titre.";
        const titleCheck = validateListingText(title);
        if (titleCheck) return titleCheck;
        if (description) { const descCheck = validateListingText(description); if (descCheck) return descCheck; }
        return null;
      case "price_availability":
        if (!price || Number.parseInt(price, 10) <= 0) return "Veuillez indiquer un prix valide.";
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const error = validate(currentStepId);
    if (error) { toast.error(error); return; }
    window.scrollTo({ top: 0 });
    setStep(Math.min(step + 1, 4));
  };

  const goBack = () => {
    window.scrollTo({ top: 0 });
    setStep(Math.max(step - 1, 0));
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Délai dépassé : ${label}`)), ms);
      promise.then(
        (val) => { clearTimeout(timer); resolve(val); },
        (err) => { clearTimeout(timer); reject(err); },
      );
    });

  const uploadSinglePhoto = async (photo: PhotoItem, userId: string, retries = 2): Promise<string> => {
    const ext = photo.file.name.split(".").pop() || "jpg";
    const rawPath = `raw/${userId}/${crypto.randomUUID()}.${ext}`;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { error: uploadError } = await withTimeout(
          supabase.storage.from("listing-photos").upload(rawPath, photo.file, { contentType: photo.file.type || "image/jpeg" }),
          60_000, `upload ${photo.file.name}`,
        );
        if (uploadError) { if (attempt < retries) continue; throw uploadError; }
        break;
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    try {
      const { data: fnData, error: fnError } = await withTimeout(
        supabase.functions.invoke("process-listing-photo", { body: { rawPath } }),
        90_000, `traitement ${photo.file.name}`,
      );
      if (fnError) throw fnError;
      if (fnData?.url) return fnData.url;
      throw new Error("No URL returned");
    } catch {
      const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(rawPath);
      return urlData.publicUrl;
    }
  };

  const mapUploadError = (rawMessage?: string) => {
    const message = (rawMessage || "").toLowerCase();
    if (message.includes("mime") || message.includes("content-type")) return "Format non accepté. Utilisez JPG, PNG ou WEBP.";
    if (message.includes("size") || message.includes("too large")) return "Image trop lourde (max 20 MB).";
    return "Échec d'upload. Réessayez.";
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Veuillez vous connecter"); navigate("/login"); return; }
    if (isPhotoProcessing) { toast.error("Traitement en cours…"); return; }
    const error = validate("details") || validate("photos") || validate("price_availability");
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      const photoUrls: string[] = [];
      const validPhotos = draft.photos.filter((p) => !p.error);
      setUploadProgress({ current: 0, total: validPhotos.length });

      for (let i = 0; i < validPhotos.length; i++) {
        const photo = validPhotos[i];
        if (photo.file.size > 20 * 1024 * 1024) throw new Error(`"${photo.file.name}" trop lourde`);
        try {
          const url = await uploadSinglePhoto(photo, user.id);
          photoUrls.push(url);
        } catch (uploadErr: any) {
          const friendlyError = mapUploadError(uploadErr?.message);
          setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, error: friendlyError, validated: false } : p));
          throw new Error(`"${photo.file.name}" : ${friendlyError}`);
        }
        setUploadProgress({ current: i + 1, total: validPhotos.length });
      }

      const safePrice = Number.parseInt(price || "0", 10);
      const dbBookingMode = bookingMode === "request" ? "request" : "instant";
      const dbAvailabilityMode = bookingMode === "instant" ? "always" : "request";

      const { data: insertedListing, error: insertError } = await withTimeout(
        Promise.resolve(
          supabase.from("listings").insert({
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            property_type: propertyType,
            location: location.trim(),
            bedrooms, bathrooms, capacity,
            price_per_night: safePrice,
            photos: photoUrls,
            status: "published",
            booking_mode: dbBookingMode,
            availability_mode: dbAvailabilityMode,
          }).select("id").single()
        ), 30_000, "insertion annonce",
      );
      if (insertError) throw insertError;

      if (bookingMode === "request" && availabilitySubType === "calendar" && blockedDates.length > 0 && insertedListing) {
        const blockedRows = blockedDates.map((d) => ({
          listing_id: insertedListing.id,
          date: format(d, "yyyy-MM-dd"),
        }));
        await withTimeout(
          Promise.resolve(supabase.from("blocked_dates").insert(blockedRows)),
          15_000, "dates bloquées",
        );
      }

      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-listings"] });
      toast.success("Logement publié avec succès !");
      try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "";
      toast.error(msg.includes("Délai") ? "Connexion trop longue. Réessayez." : (msg || "Erreur lors de la publication."));
    } finally {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const displayedPrice = Number.parseInt(price || "0", 10);
  const isLastStep = step === 4;
  const isFirstStep = step === 0;
  const isNextDisabled = loading || (currentStepId === "photos" && (isPhotoProcessing || validPhotoCount < 1 || hasPhotoErrors));

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Étape {step + 1} sur 5</span>
              <span className="text-xs font-semibold text-foreground">{STEPS[step].title}</span>
            </div>
            <Progress value={((step + 1) / 5) * 100} className="h-2" />
            <div className="flex items-center justify-between mt-3">
              {STEPS.map((s, i) => {
                const isCompleted = i < step;
                const isActive = i === step;
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div className={cn(
                      "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                      isCompleted ? "bg-accent text-accent-foreground"
                        : isActive ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium hidden lg:inline whitespace-nowrap",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>{s.title}</span>
                    {i < 4 && (
                      <div className={cn(
                        "w-4 sm:w-6 lg:w-8 h-0.5 mx-0.5 shrink-0",
                        isCompleted ? "bg-accent" : "bg-border"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <StepRenderBoundary onFallback={goBack}>
            <div key={currentStepId} className="animate-fade-in">
              {/* Step 1: Type & Location */}
              {currentStepId === "type_location" && (
                <PropertyTypeStep
                  propertyType={propertyType}
                  location={location}
                  capacity={capacity}
                  onChangeType={setPropertyType}
                  onChangeLocation={setLocation}
                  onChangeCapacity={setCapacity}
                />
              )}

              {/* Step 2: Photos */}
              {currentStepId === "photos" && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    <Camera className="w-5 h-5 inline mr-2" />Ajoutez des photos
                  </h2>
                  <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground">
                    📸 Les annonces avec photos reçoivent plus de réservations. La première image sera la couverture.
                  </div>
                  <PhotoUploader photos={draft.photos} onChange={setPhotos} onProcessingChange={setIsPhotoProcessing} />
                  {isPhotoProcessing && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />Traitement en cours…
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Details */}
              {currentStepId === "details" && (
                <DetailsStep
                  title={title}
                  description={description}
                  bedrooms={bedrooms}
                  bathrooms={bathrooms}
                  amenities={amenities}
                  onChangeTitle={setTitle}
                  onChangeDescription={setDescription}
                  onChangeBedrooms={setBedrooms}
                  onChangeBathrooms={setBathrooms}
                  onChangeAmenities={setAmenities}
                />
              )}

              {/* Step 4: Price & Availability */}
              {currentStepId === "price_availability" && (
                <PriceAvailabilityStep
                  price={price}
                  currency={DEFAULT_CURRENCY}
                  bookingMode={bookingMode}
                  availabilitySubType={availabilitySubType}
                  blockedDates={blockedDates}
                  onChangePrice={setPrice}
                  onChangeBookingMode={handleBookingModeChange}
                  onChangeAvailabilitySubType={handleAvailabilitySubTypeChange}
                  onChangeBlockedDates={setBlockedDates}
                />
              )}

              {/* Step 5: Summary */}
              {currentStepId === "summary" && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    <CheckCircle className="w-5 h-5 inline mr-2" />Récapitulatif
                  </h2>
                  <p className="text-sm text-muted-foreground">Vérifiez avant de publier.</p>

                  <div className="space-y-3 text-sm">
                    {[
                      ["Type", propertyType],
                      ["Localisation", location || "—"],
                      ["Capacité", `${capacity} voyageur(s)`],
                      ["Titre", title || "—"],
                      ["Chambres / SdB", `${bedrooms} / ${bathrooms}`],
                      ["Équipements", amenities.length > 0 ? amenities.join(", ") : "Aucun"],
                      ["Prix / nuit", `${(Number.isFinite(displayedPrice) ? displayedPrice : 0).toLocaleString("fr-FR")} ${DEFAULT_CURRENCY}`],
                      ["Mode", bookingMode === "instant" ? "Réservation instantanée" : "Demande de disponibilité"],
                      ["Photos", `${draft.photos.length} photo(s)`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground text-right max-w-[60%] capitalize">{value}</span>
                      </div>
                    ))}
                  </div>

                  {draft.photos.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {draft.photos.slice(0, 5).map((p, i) => (
                        <div key={p?.id || i} className="relative w-full aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted">
                          {p?.preview && <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </StepRenderBoundary>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 gap-3">
            {!isFirstStep ? (
              <Button type="button" variant="outline" onClick={goBack} className="rounded-xl h-12 px-6" disabled={loading}>
                <ChevronLeft className="w-4 h-4 mr-1" />Retour
              </Button>
            ) : <div />}

            {!isLastStep ? (
              <Button type="button" onClick={goNext} disabled={isNextDisabled} className="rounded-xl h-12 px-6 bg-primary text-primary-foreground">
                Suivant<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading || isPhotoProcessing} className="rounded-xl h-12 px-8 bg-primary text-primary-foreground font-medium">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publication…</> : "Publier mon logement"}
              </Button>
            )}
          </div>

          {loading && uploadProgress.total > 0 && (
            <div className="mt-3 bg-muted/50 border border-border rounded-xl p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Upload : {uploadProgress.current}/{uploadProgress.total}</p>
              <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const PublishPage = () => (
  <PageErrorBoundary>
    <Publish />
  </PageErrorBoundary>
);

export default PublishPage;
