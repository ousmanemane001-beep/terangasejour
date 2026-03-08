import { cn } from "@/lib/utils";

export type PaymentMethod = "wave" | "orange_money" | "free_money" | "paydunya" | "card";

const methods: { id: PaymentMethod; label: string; icon: string; color: string }[] = [
  { id: "wave", label: "Wave", icon: "📱", color: "bg-blue-500/10 border-blue-500/30" },
  { id: "orange_money", label: "Orange Money", icon: "🟠", color: "bg-orange-500/10 border-orange-500/30" },
  { id: "free_money", label: "Free Money", icon: "🟢", color: "bg-green-500/10 border-green-500/30" },
  { id: "paydunya", label: "PayDunya", icon: "💳", color: "bg-purple-500/10 border-purple-500/30" },
  { id: "card", label: "Carte bancaire", icon: "💳", color: "bg-muted border-border" },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({ selected, onSelect }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-display font-semibold text-foreground text-sm">Mode de paiement</h4>
      <div className="grid grid-cols-1 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm",
              selected === m.id
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : `${m.color} hover:ring-1 hover:ring-primary/50`
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <span className="font-medium text-foreground">{m.label}</span>
            {selected === m.id && (
              <span className="ml-auto text-primary text-xs font-semibold">✓ Sélectionné</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
