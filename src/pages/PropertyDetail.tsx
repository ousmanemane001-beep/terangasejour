import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import ReviewSection from "@/components/ReviewSection";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import VerifiedBadge from "@/components/VerifiedBadge";
import PropertyMap from "@/components/PropertyMap";
import PhotoLightbox from "@/components/PhotoLightbox";
import { motion } from "framer-motion";
import { useListingRating } from "@/hooks/useReviews";
import { useParams, Link, useNavigate } from "react-router-dom";
import { properties } from "@/data/properties";
import { useListing } from "@/hooks/useListings";
import { useStartConversation } from "@/hooks/useConversations";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Star, MapPin, Heart, Share2, Bed, Bath, Users,
  Wifi, Car, AirVent, ChefHat, Waves, ArrowLeft, Loader2,
  Tv, Lock, Flower2, ShieldCheck, MessageCircle, CheckCircle, AlertTriangle,
  Eye, Clock, ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";

const amenityMap: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parking: { icon: Car, label: "Parking" },
  ac: { icon: AirVent, label: "Climatisation" },
  kitchen: { icon: ChefHat, label: "Cuisine équipée" },
  pool: { icon: Waves, label: "Piscine" },
  tv: { icon: Tv, label: "Télévision" },
  security: { icon: Lock, label: "Sécurité 24h" },
  garden: { icon: Flower2, label: "Jardin" },
};

const PropertyDetail = () => {
  const { id } = useParams();
  const isUUID = id && id.includes("-");
  const { data: dbListing, isLoading } = useListing(isUUID ? id : undefined);
  const { data: dbRating } = useListingRating(isUUID ? id : undefined);
  const staticProperty = !isUUID ? properties.find((p) => p.id === Number(id)) : null;
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  // Social proof (stable random per listing ID)
  const socialProof = useMemo(() => ({
    viewers: Math.floor((id?.charCodeAt?.(0) || 5) % 15) + 3,
    lastBookingHours: Math.floor((id?.charCodeAt?.(1) || 8) % 20) + 1,
  }), [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  const listing = dbListing
    ? {
        id: dbListing.id, title: dbListing.title, description: dbListing.description || "",
        location: dbListing.location || "Non précisé", type: dbListing.property_type,
        price: dbListing.price_per_night, bedrooms: dbListing.bedrooms, bathrooms: dbListing.bathrooms,
        guests: dbListing.capacity, images: dbListing.photos || [],
        coverImage: dbListing.photos?.[0] || "/placeholder.svg",
        rating: dbRating?.avg ?? null, reviewCount: dbRating?.count ?? null, isDB: true, verified: dbListing.verified,
        latitude: dbListing.latitude, longitude: dbListing.longitude,
        address: dbListing.address, city: dbListing.city,
        cancellationPolicy: (dbListing as any).cancellation_policy || "flexible",
      }
    : staticProperty
    ? {
        id: String(staticProperty.id), title: staticProperty.title,
        description: staticProperty.description || `Bienvenue dans ce magnifique ${staticProperty.type.toLowerCase()} situé à ${staticProperty.location}.`,
        location: staticProperty.location, type: staticProperty.type, price: staticProperty.price,
        bedrooms: staticProperty.bedrooms, bathrooms: staticProperty.bathrooms || 2,
        guests: staticProperty.guests, images: staticProperty.images || [staticProperty.image],
        coverImage: staticProperty.image, rating: staticProperty.rating,
        reviewCount: staticProperty.reviewCount, isDB: false, verified: false,
        latitude: null as number | null, longitude: null as number | null,
        address: null as string | null, city: null as string | null,
        cancellationPolicy: "flexible",
      }
    : null;

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Logement non trouvé</h1>
            <p className="text-muted-foreground mb-4">Ce logement n'existe pas ou a été supprimé.</p>
            <Link to="/explore" className="text-primary hover:underline">Retour à l'exploration</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const amenities = listing.isDB
    ? Object.entries(amenityMap).map(([, v]) => v)
    : (staticProperty?.amenities || []).map((a) => amenityMap[a] || { icon: Wifi, label: a }).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="py-6">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/explore" className="hover:text-foreground">Explorer</Link>
            {listing && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium truncate max-w-[200px]">{listing?.title}</span>
              </>
            )}
          </nav>

          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 relative">
            {listing.images.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] md:aspect-auto md:row-span-2 cursor-pointer" onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}>
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {listing.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-[4/3] cursor-pointer overflow-hidden" onClick={() => { setSelectedImage(i + 1); setLightboxOpen(true); }}>
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <img src={listing.coverImage} alt={listing.title} className="w-full h-64 md:h-96 object-cover" loading="lazy" />
              </div>
            )}
            {listing.images.length > 5 && (
              <button
                onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
                className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-card transition-colors"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Voir les {listing.images.length} photos
              </button>
            )}
          </motion.div>

          {/* Lightbox */}
          <PhotoLightbox
            images={listing.images}
            initialIndex={selectedImage}
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">{listing.type}</span>
                      {listing.verified && <VerifiedBadge size="md" />}
                    </div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{listing.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{listing.location}</span>
                      {listing.rating && (
                        <>
                          <span className="mx-2">•</span>
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground">{listing.rating}</span>
                          <span className="text-sm">({listing.reviewCount} avis)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"><Heart className="w-4 h-4" /></button>
                    <button
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      onClick={async () => {
                        const url = window.location.href;
                        const shareData = { title: listing.title, text: `${listing.title} — ${listing.price.toLocaleString("fr-FR")} F/nuit sur TerangaSéjour`, url };
                        if (navigator.share) {
                          try { await navigator.share(shareData); } catch {}
                        } else {
                          await navigator.clipboard.writeText(url);
                          toast.success("Lien copié dans le presse-papier !");
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{Math.floor(Math.random() * 15) + 3} personnes consultent ce logement</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Dernière réservation il y a {Math.floor(Math.random() * 20) + 1}h</span>
                  </div>
                </div>

                {/* Contact host button */}
                {isUUID && dbListing && user && user.id !== dbListing.user_id && (
                  <Button
                    variant="outline"
                    className="mt-3 rounded-full gap-2 hover:scale-105 transition-transform"
                    onClick={async () => {
                      try {
                        const conv = await startConversation.mutateAsync({
                          listingId: dbListing.id,
                          guestId: user.id,
                          hostId: dbListing.user_id,
                        });
                        navigate(`/messages?conv=${conv.id}`);
                      } catch (e: any) {
                        toast.error("Impossible de démarrer la conversation");
                      }
                    }}
                    disabled={startConversation.isPending}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contacter l'hôte
                  </Button>
                )}
              </div>

              {/* Trust elements */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "🔒", text: "Paiement sécurisé" },
                  { icon: "✓", text: "Logements vérifiés" },
                  { icon: "📞", text: "Assistance 7j/7" },
                  { icon: "⚡", text: "Réservation rapide" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/5 text-sm text-foreground border border-primary/10">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Bed className="w-4 h-4" /><span>{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Bath className="w-4 h-4" /><span>{listing.bathrooms} salle{listing.bathrooms > 1 ? "s" : ""} de bain</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" /><span>{listing.guests} voyageur{listing.guests > 1 ? "s" : ""}</span></div>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border">
                      <amenity.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="border-t border-border pt-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Politique d'annulation</h2>
                {listing.cancellationPolicy === "flexible" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-700 text-sm">Annulation flexible</p>
                      <p className="text-xs text-emerald-600 mt-1">Annulation gratuite jusqu'à 24h avant l'arrivée. Remboursement intégral.</p>
                    </div>
                  </div>
                )}
                {listing.cancellationPolicy === "moderate" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-700 text-sm">Annulation modérée</p>
                      <p className="text-xs text-amber-600 mt-1">Annulation gratuite jusqu'à 5 jours avant l'arrivée. 50% remboursé ensuite.</p>
                    </div>
                  </div>
                )}
                {listing.cancellationPolicy === "strict" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                    <ShieldCheck className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-700 text-sm">Annulation stricte</p>
                      <p className="text-xs text-red-600 mt-1">Annulation gratuite dans les 48h suivant la réservation. Aucun remboursement après.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Map */}
              {listing.latitude && listing.longitude && (
                <div className="border-t border-border pt-8">
                  <PropertyMap
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    title={listing.title}
                    address={listing.address || undefined}
                    city={listing.city || undefined}
                  />
                </div>
              )}

              {/* Availability Calendar */}
              {isUUID && id && (
                <div className="border-t border-border pt-8">
                  <AvailabilityCalendar listingId={id} />
                </div>
              )}

              {isUUID && id && (
                <div className="border-t border-border pt-8">
                  <ReviewSection listingId={id} />
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              {isUUID && id ? (
                <BookingWidget
                  listingId={id}
                  pricePerNight={listing.price}
                  maxGuests={listing.guests}
                  bookingMode={dbListing ? (dbListing as any).booking_mode : "instant"}
                  hostId={dbListing?.user_id}
                  cancellationPolicy={listing.cancellationPolicy}
                />
              ) : (
                <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6">
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-foreground">{listing.price.toLocaleString("fr-FR")} F</span>
                    <span className="text-muted-foreground"> / nuit</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Contactez l'hôte pour réserver ce logement.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
