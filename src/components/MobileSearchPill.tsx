import { useState } from "react";
import { Search, X, MapPin, ChevronLeft, ChevronRight, Minus, Plus, Building2, Home, Hotel, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const MobileSearchPill = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showCalendar, setShowCalendar] = useState<"in" | "out" | null>(null);

  const SUGGESTIONS = ["Dakar", "Saly", "Somone", "Gorée", "Saint-Louis", "Cap Skirring", "Lac Rose", "Mbour"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    const totalGuests = adults + children;
    if (totalGuests > 1) params.set("guests", String(totalGuests));
    navigate(`/explore?${params.toString()}`);
    setExpanded(false);
  };

  const close = () => {
    setExpanded(false);
    setShowCalendar(null);
  };

  const totalGuests = adults + children;
  const dateLabel = `${format(checkIn, "d MMM", { locale: fr })} - ${format(checkOut, "d MMM", { locale: fr })}`;

  const PROPERTY_TYPES = [
    { label: "Appartement", icon: Building2, type: "apartment" },
    { label: "Villa", icon: Home, type: "villa" },
    { label: "Hôtel", icon: Hotel, type: "hotel" },
  ];

  if (!expanded) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <Search className="w-5 h-5 text-foreground shrink-0" />
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-foreground leading-tight">Où allez-vous ?</span>
            <span className="text-xs text-muted-foreground leading-tight">
              {destination || "N'importe où"} · {dateLabel} · {totalGuests} voyageur{totalGuests > 1 ? "s" : ""}
            </span>
          </div>
        </button>

        <div className="flex items-center justify-around px-2">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.type}
              onClick={() => navigate(`/explore?type=${pt.type}`)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <pt.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">{pt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Calendar overlay
  if (showCalendar) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-3 pb-3 border-b border-border bg-primary">
          <button onClick={() => setShowCalendar(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold text-primary-foreground">
            {showCalendar === "in" ? "Date d'arrivée" : "Date de départ"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto flex justify-center pt-4">
          <CalendarComponent
            mode="single"
            selected={showCalendar === "in" ? checkIn : checkOut}
            onSelect={(d) => {
              if (!d) return;
              if (showCalendar === "in") {
                setCheckIn(d);
                if (d >= checkOut) setCheckOut(addDays(d, 1));
                setShowCalendar(null);
              } else {
                setCheckOut(d);
                setShowCalendar(null);
              }
            }}
            disabled={(date) => {
              if (showCalendar === "in") return date < new Date();
              return date <= checkIn;
            }}
            locale={fr}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>
      </div>
    );
  }

  // Main expanded form (Agoda-style)
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-3 bg-primary">
        <button onClick={close} className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold text-primary-foreground">Modifier la recherche</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Destination */}
        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Rechercher une destination"
              autoFocus
              className="w-full pl-12 pr-4 py-3 bg-secondary rounded-full text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>
          {/* Show suggestions only when typing and not exact match */}
          {destination.length > 0 && !SUGGESTIONS.some(s => s.toLowerCase() === destination.toLowerCase()) && (
            <div className="mt-1 max-h-32 overflow-y-auto">
              {SUGGESTIONS.filter((s) => s.toLowerCase().includes(destination.toLowerCase())).map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-xl transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-border mx-5" />

        {/* Dates */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowCalendar("in")} className="flex-1 text-left">
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Arrivée</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-foreground">{format(checkIn, "d")}</span>
                <span className="text-xs text-muted-foreground">{format(checkIn, "EEE MMM", { locale: fr })}</span>
              </div>
            </button>
            <ArrowRight className="w-4 h-4 text-muted-foreground mx-2 shrink-0" />
            <button onClick={() => setShowCalendar("out")} className="flex-1 text-right">
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Départ</p>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-bold text-foreground">{format(checkOut, "d")}</span>
                <span className="text-xs text-muted-foreground">{format(checkOut, "EEE MMM", { locale: fr })}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="h-px bg-border mx-5" />

        {/* Counters */}
        <div className="px-5 divide-y divide-border">
          <CounterRow label="Chambre" value={rooms} min={1} max={10} onChange={setRooms} />
          <CounterRow label="Adultes" value={adults} min={1} max={20} onChange={setAdults} />
          <CounterRow label="Enfants" value={children} min={0} max={10} onChange={setChildren} />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t border-border">
        <button
          onClick={handleSearch}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Rechercher
        </button>
      </div>
    </div>
  );
};

/* Counter row component */
const CounterRow = ({
  label, value, min, max, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-foreground w-6">{value}</span>
      <span className="text-sm text-foreground font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center disabled:opacity-30 text-muted-foreground"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary disabled:opacity-30"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

export default MobileSearchPill;
