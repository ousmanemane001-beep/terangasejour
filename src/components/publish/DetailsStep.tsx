import { Bed, Bath, Wifi, Wind, CookingPot, Tv, Car, Waves } from "lucide-react";
import { CounterButton } from "./PropertyTypeStep";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "climatisation", label: "Climatisation", icon: Wind },
  { id: "cuisine", label: "Cuisine", icon: CookingPot },
  { id: "tv", label: "TV", icon: Tv },
  { id: "parking", label: "Parking", icon: Car },
  { id: "piscine", label: "Piscine", icon: Waves },
] as const;

interface DetailsStepProps {
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeBedrooms: (v: number) => void;
  onChangeBathrooms: (v: number) => void;
  onChangeAmenities: (v: string[]) => void;
}

const DetailsStep = ({
  title, description, bedrooms, bathrooms, amenities,
  onChangeTitle, onChangeDescription, onChangeBedrooms, onChangeBathrooms, onChangeAmenities,
}: DetailsStepProps) => {
  const toggleAmenity = (id: string) => {
    if (amenities.includes(id)) {
      onChangeAmenities(amenities.filter((a) => a !== id));
    } else {
      onChangeAmenities([...amenities, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Décrivez votre logement</h2>
          <p className="text-sm text-muted-foreground mt-1">Donnez envie aux voyageurs de réserver.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce *</label>
          <Input
            placeholder="Ex: Belle villa avec piscine à Saly"
            className="rounded-xl h-12"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <Textarea
            placeholder="Décrivez votre logement en détail..."
            rows={4}
            className="rounded-xl"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            Ne partagez pas vos coordonnées personnelles.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Bed className="w-5 h-5" /> Chambres et salles de bain
        </h3>
        <div className="divide-y divide-border">
          <CounterButton label="Chambres" value={bedrooms} onChange={onChangeBedrooms} min={1} max={20} />
          <CounterButton label="Salles de bain" value={bathrooms} onChange={onChangeBathrooms} min={1} max={10} />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Équipements</h3>
        <p className="text-sm text-muted-foreground">Sélectionnez les équipements disponibles.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENITIES.map((am) => {
            const Icon = am.icon;
            const selected = amenities.includes(am.id);
            return (
              <button
                key={am.id}
                type="button"
                onClick={() => toggleAmenity(am.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-3 transition-all duration-200",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 shrink-0",
                  selected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selected ? "text-foreground" : "text-muted-foreground"
                )}>{am.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
