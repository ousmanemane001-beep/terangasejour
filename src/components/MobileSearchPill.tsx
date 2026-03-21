import { useState } from "react";
import { Search, X, MapPin, Calendar, Users, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const MobileSearchPill = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<"where" | "when" | "who">("where");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [guests, setGuests] = useState(1);

  const SUGGESTIONS = ["Dakar", "Saly", "Somone", "Gorée", "Saint-Louis", "Cap Skirring", "Lac Rose", "Mbour"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (dateRange.from) params.set("checkIn", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange.to) params.set("checkOut", format(dateRange.to, "yyyy-MM-dd"));
    if (guests > 1) params.set("guests", String(guests));
    navigate(`/explore?${params.toString()}`);
    setExpanded(false);
  };

  const reset = () => {
    setDestination("");
    setDateRange({});
    setGuests(1);
    setStep("where");
  };

  const close = () => {
    setExpanded(false);
    setStep("where");
  };

  const dateLabel = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, "d MMM", { locale: fr })} - ${format(dateRange.to, "d MMM", { locale: fr })}`
      : format(dateRange.from, "d MMM", { locale: fr })
    : "N'importe quand";

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <Search className="w-5 h-5 text-foreground shrink-0" />
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold text-foreground leading-tight">Où allez-vous ?</span>
          <span className="text-xs text-muted-foreground leading-tight">
            {destination || "N'importe où"} · {dateLabel} · {guests} voyageur{guests > 1 ? "s" : ""}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={close} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <button onClick={reset} className="text-xs font-semibold text-foreground underline">
          Effacer tout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {[
          { key: "where" as const, label: "Lieu" },
          { key: "when" as const, label: "Dates" },
          { key: "who" as const, label: "Voyageurs" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStep(t.key)}
            className={cn(
              "flex-1 py-2 rounded-full text-sm font-medium transition-colors",
              step === t.key
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {step === "where" && (
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Rechercher une destination"
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Suggestions</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.filter((s) =>
                  !destination || s.toLowerCase().includes(destination.toLowerCase())
                ).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setDestination(city);
                      setStep("when");
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-xl text-sm text-foreground hover:bg-accent transition-colors text-left"
                  >
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "when" && (
          <div className="flex flex-col items-center">
            <CalendarComponent
              mode="range"
              selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range) => {
                setDateRange({ from: range?.from, to: range?.to });
                if (range?.to) setStep("who");
              }}
              numberOfMonths={1}
              disabled={(date) => date < new Date()}
              locale={fr}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        )}

        {step === "who" && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Voyageurs</p>
                <p className="text-xs text-muted-foreground">Nombre de personnes</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(20, guests + 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <button onClick={reset} className="text-sm font-semibold text-foreground underline">
          Tout effacer
        </button>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold"
        >
          <Search className="w-4 h-4" />
          Rechercher
        </button>
      </div>
    </div>
  );
};

export default MobileSearchPill;
