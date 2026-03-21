import { useState } from "react";
import { useSeasonalPrices, useAddSeasonalPrice, useDeleteSeasonalPrice } from "@/hooks/useSeasonalPrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SeasonalPriceManagerProps {
  listingId: string;
  basePricePerNight: number;
}

const SEASON_PRESETS = [
  { name: "Tabaski", start: "2026-06-15", end: "2026-06-22" },
  { name: "Noël / Nouvel An", start: "2026-12-20", end: "2027-01-05" },
  { name: "Été (Juillet-Août)", start: "2026-07-01", end: "2026-08-31" },
  { name: "Magal de Touba", start: "2026-09-20", end: "2026-09-25" },
];

const SeasonalPriceManager = ({ listingId, basePricePerNight }: SeasonalPriceManagerProps) => {
  const { data: prices, isLoading } = useSeasonalPrices(listingId);
  const addPrice = useAddSeasonalPrice();
  const deletePrice = useDeleteSeasonalPrice();

  const [seasonName, setSeasonName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = () => {
    if (!seasonName || !startDate || !endDate || !price) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (startDate >= endDate) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }
    addPrice.mutate(
      {
        listing_id: listingId,
        season_name: seasonName,
        start_date: startDate,
        end_date: endDate,
        price_per_night: parseInt(price),
      },
      {
        onSuccess: () => {
          toast.success("Prix saisonnier ajouté");
          setSeasonName("");
          setStartDate("");
          setEndDate("");
          setPrice("");
        },
        onError: () => toast.error("Erreur lors de l'ajout"),
      }
    );
  };

  const applyPreset = (preset: typeof SEASON_PRESETS[0]) => {
    setSeasonName(preset.name);
    setStartDate(preset.start);
    setEndDate(preset.end);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Prix saisonniers
      </h3>
      <p className="text-sm text-muted-foreground">
        Prix de base : <span className="font-semibold text-foreground">{basePricePerNight.toLocaleString("fr-FR")} F/nuit</span>
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {SEASON_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => applyPreset(preset)}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Input
          placeholder="Nom de la saison"
          value={seasonName}
          onChange={(e) => setSeasonName(e.target.value)}
          className="col-span-2 md:col-span-1"
        />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Input
          type="number"
          placeholder="Prix/nuit (F)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button onClick={handleAdd} disabled={addPrice.isPending} className="gap-1">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : prices && prices.length > 0 ? (
        <div className="space-y-2">
          {prices.map((sp) => (
            <div key={sp.id} className="flex items-center justify-between bg-muted rounded-lg p-3">
              <div>
                <span className="font-medium text-sm text-foreground">{sp.season_name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(sp.start_date).toLocaleDateString("fr-FR")} — {new Date(sp.end_date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-foreground">
                  {sp.price_per_night.toLocaleString("fr-FR")} F/nuit
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deletePrice.mutate({ id: sp.id, listingId })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Aucun prix saisonnier défini. Le prix de base s'applique toute l'année.</p>
      )}
    </div>
  );
};

export default SeasonalPriceManager;
