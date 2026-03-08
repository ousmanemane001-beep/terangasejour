import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { properties } from "@/data/properties";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Bed,
  Bath,
  Users,
  Wifi,
  Car,
  AirVent,
  ChefHat,
  Waves,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Car, label: "Parking" },
  { icon: AirVent, label: "Climatisation" },
  { icon: ChefHat, label: "Cuisine" },
  { icon: Waves, label: "Piscine" },
];

const PropertyDetail = () => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Logement non trouvé</h1>
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
          {/* Breadcrumb */}
          <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour aux résultats
          </Link>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-2">
                      {property.type}
                    </span>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                      <span className="mx-2">•</span>
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium text-foreground">{property.rating}</span>
                      <span className="text-sm">({property.reviewCount} avis)</span>
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
                  <span>3 chambres</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bath className="w-4 h-4" />
                  <span>2 salles de bain</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>6 voyageurs</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bienvenue dans ce magnifique {property.type.toLowerCase()} situé à {property.location}.
                  Profitez d'un séjour inoubliable dans un cadre exceptionnel, alliant confort moderne et charme authentique sénégalais.
                  L'espace est idéalement situé, à proximité des principales attractions et commodités.
                  Vous disposerez de tout le nécessaire pour un séjour agréable et relaxant.
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, i) => (
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
                    {property.price.toLocaleString("fr-FR")} F
                  </span>
                  <span className="text-muted-foreground"> / nuit</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="rounded-xl border border-border p-3">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Arrivée
                    </label>
                    <p className="text-sm text-foreground mt-0.5">08/03/2026</p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Départ
                    </label>
                    <p className="text-sm text-foreground mt-0.5">15/03/2026</p>
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
                    <span>{property.price.toLocaleString("fr-FR")} F × 7 nuits</span>
                    <span>{(property.price * 7).toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais de service</span>
                    <span>{Math.round(property.price * 0.1).toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{(property.price * 7 + Math.round(property.price * 0.1)).toLocaleString("fr-FR")} F</span>
                  </div>
                </div>

                <Button className="w-full rounded-xl h-12 bg-accent text-accent-foreground font-medium text-base hover:bg-amber-dark">
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
