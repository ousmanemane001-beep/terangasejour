import { Home, Building2, Hotel, Warehouse, LayoutGrid, Box, Users, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "villa", label: "Villa", icon: Home },
  { value: "appartement", label: "Appartement", icon: Building2 },
  { value: "maison", label: "Maison d'hôtes", icon: Hotel },
  { value: "studio", label: "Studio", icon: Box },
  { value: "lodge", label: "Lodge", icon: Warehouse },
  { value: "loft", label: "Loft", icon: LayoutGrid },
] as const;

interface PropertyTypeStepProps {
  propertyType: string;
  location: string;
  capacity: number;
  onChangeType: (type: string) => void;
  onChangeLocation: (loc: string) => void;
  onChangeCapacity: (cap: number) => void;
}

const CounterButton = ({ value, onChange, min = 1, max = 20, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string;
}) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >−</button>
      <span className="w-6 text-center font-semibold text-foreground">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >+</button>
    </div>
  </div>
);

const PropertyTypeStep = ({
  propertyType, location, capacity,
  onChangeType, onChangeLocation, onChangeCapacity,
}: PropertyTypeStepProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Type de logement</h2>
          <p className="text-sm text-muted-foreground mt-1">Quel type de logement proposez-vous ?</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map((pt) => {
            const Icon = pt.icon;
            const selected = propertyType === pt.value;
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => onChangeType(pt.value)}
                className={cn(
                  "group flex flex-col items-center gap-3 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200",
                  selected
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary/60"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  selected ? "text-foreground" : "text-muted-foreground"
                )}>{pt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            <MapPin className="w-5 h-5 inline mr-2" />Localisation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Où se situe votre logement ?</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Ville, quartier *</label>
          <Input
            placeholder="Ex: Saly, Mbour"
            className="rounded-xl h-12"
            value={location}
            onChange={(e) => onChangeLocation(e.target.value)}
          />
        </div>

        <div className="border-t border-border pt-4">
          <CounterButton
            label="Nombre de voyageurs"
            value={capacity}
            onChange={onChangeCapacity}
            min={1}
            max={30}
          />
        </div>
      </div>
    </div>
  );
};

export { CounterButton };
export default PropertyTypeStep;
