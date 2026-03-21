import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PriceAvailabilityStepProps {
  price: string;
  currency: string;
  onChangePrice: (v: string) => void;
}

const PriceAvailabilityStep = ({
  price, currency, onChangePrice,
}: PriceAvailabilityStepProps) => {
  const displayedPrice = Number.parseInt(price || "0", 10);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> Prix par nuit
        </h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Tarif ({currency}) *
          </label>
          <Input
            type="number"
            placeholder="Ex: 45000"
            className="rounded-xl h-14 text-lg font-semibold"
            value={price}
            onChange={(e) => onChangePrice(e.target.value || "0")}
          />
        </div>
        {Number.isFinite(displayedPrice) && displayedPrice > 0 && (
          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
            Tarif affiché : <strong className="text-foreground">{displayedPrice.toLocaleString("fr-FR")} {currency} / nuit</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAvailabilityStep;
