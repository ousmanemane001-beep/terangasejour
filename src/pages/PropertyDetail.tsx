import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { properties } from "@/data/properties";
import { useListing } from "@/hooks/useListings";
import {
  Star, MapPin, Heart, Share2, Bed, Bath, Users,
  Wifi, Car, AirVent, ChefHat, Waves, ArrowLeft, Calendar, Loader2,
} from "lucide-react";
import { useState } from "react";

const amenityMap: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parking: { icon: Car, label: "Parking" },
  ac: { icon: AirVent, label: "Climatisation" },
  kitchen: { icon: ChefHat, label: "Cuisine équipée" },
  pool: { icon: Waves, label: "Piscine" },
};

const defaultAmenities = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Car, label: "Parking" },
  { icon: AirVent, label: "Climatisation" },
  { icon: ChefHat, label: "Cuisine" },
  { icon: Waves, label: "Piscine" },
];

const PropertyDetail = () => {
  const { id } = useParams();
  const isUUID = id && id.includes("-");

  // DB listing for UUID ids
  const { data: dbListing, isLoading } = useListing(isUUID ? id : undefined);

  // Static fallback for numeric ids
  const staticProperty = !isUUID ? properties.find((p) => p.id === Number(id)) : null;

  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  // Build a unified view model
  const listing = dbListing
    ? {
        title: dbListing.title,
        description: dbListing.description || "",
        location: dbListing.location || "Non précisé",
        type: dbListing.property_type,
        price: dbListing.price_per_night,
        bedrooms: dbListing.bedrooms,
        bathrooms: dbListing.bathrooms,
        guests: dbListing.capacity,
        images: dbListing.photos || [],
        coverImage: dbListing.photos?.[0] || "/placeholder.svg",
        rating: null as number | null,
        reviewCount: null as number | null,
      }
    : staticProperty
    ? {
        title: staticProperty.title,
        description:
          staticProperty.description ||
          `Bienvenue dans ce magnifique ${staticProperty.type.toLowerCase()} situé à ${staticProperty.location}. Profitez d'un séjour inoubliable.`,
        location: staticProperty.location,
        type: staticProperty.type,
        price: staticProperty.price,
        bedrooms: staticProperty.bedrooms,
        bathrooms: staticProperty.bathrooms || 2,
        guests: staticProperty.guests,
        images: staticProperty.images || [staticProperty.image],
        coverImage: staticProperty.image,
        rating: staticProperty.rating,
        reviewCount: staticProperty.reviewCount,
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
            <Link to="/explore" className="text-accent hover:underline">Retour à l'exploration</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-6">
        <div className="container mx-auto px-4">
          <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour aux résultats
          </Link>

          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            {listing.images.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] md:aspect-auto md:row-span-2">
                  <img
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover cursor-pointer"
                    loading="lazy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {listing.images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className={`aspect-[4/3] cursor-pointer overflow-hidden ${selectedImage === i ? "ring-2 ring-accent rounded-lg" : ""}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden">
                <img src={listing.coverImage} alt={listing.title} className="w-full h-64 md:h-96 object-cover" loading="lazy" />
              </div>
            )}
            {listing.images.length > 4 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${selectedImage === i ? "border-accent" : "border-transparent"}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-2 capitalize">
                      {listing.type}
                    </span>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{listing.location}</span>
                      {listing.rating && (
                        <>
                          <span className="mx-2">•</span>
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-medium text-foreground">{listing.rating}</span>
                          <span className="text-sm">({listing.reviewCount} avis)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="w-4 h-4" />
                  <span>{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bath className="w-4 h-4" />
                  <span>{listing.bathrooms} salle{listing.bathrooms > 1 ? "s" : ""} de bain</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{listing.guests} voyageur{listing.guests > 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {defaultAmenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border">
                      <amenity.icon className="w-5 h-5 text-accent" />
                      <span className="text-sm text-foreground">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border p-6">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    {listing.price.toLocaleString("fr-FR")} F
                  </span>
                  <span className="text-muted-foreground"> / nuit</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="rounded-xl border border-border p-3">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Arrivée
                    </label>
                    <p className="text-sm text-foreground mt-0.5">Sélectionner</p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Départ
                    </label>
                    <p className="text-sm text-foreground mt-0.5">Sélectionner</p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Voyageurs
                    </label>
                    <p className="text-sm text-foreground mt-0.5">2 voyageurs</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{listing.price.toLocaleString("fr-FR")} F × 7 nuits</span>
                    <span>{(listing.price * 7).toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais de service</span>
                    <span>{Math.round(listing.price * 0.1).toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{(listing.price * 7 + Math.round(listing.price * 0.1)).toLocaleString("fr-FR")} F</span>
                  </div>
                </div>

                <Button className="w-full rounded-xl h-12 bg-accent text-accent-foreground font-medium text-base hover:bg-accent/90">
                  Réserver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
