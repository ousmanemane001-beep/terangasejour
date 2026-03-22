import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, ChevronLeft, Minus, Plus, Building2, Home, Hotel, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Dakar", "Saly", "Somone", "Gorée", "Saint-Louis", "Cap Skirring", "Lac Rose", "Mbour"];

const PROPERTY_TYPES = [
  { label: "Appartement", icon: Building2, type: "apartment" },
  { label: "Villa", icon: Home, type: "villa" },
  { label: "Hôtel", icon: Hotel, type: "hotel" },
];

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

  /* ── Collapsed pill ── */
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

  /* ── Calendar overlay ── */
  if (showCalendar) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
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
              } else {
                setCheckOut(d);
              }
              setShowCalendar(null);
            }}
            disabled={(date) => {
              if (showCalendar === "in") return date < new Date();
              return date <= checkIn;
            }}
            locale={fr}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>
      </div>,
      document.body
    );
  }

  /* ── Expanded bottom-sheet style form ── */
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end" onClick={close}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative bg-background rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-sm font-semibold text-foreground pt-2">Rechercher</span>
          <button onClick={close} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-2">
          {/* Destination */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Où allez-vous ?"
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>

          {/* Suggestions */}
          {destination.length > 0 && !SUGGESTIONS.some(s => s.toLowerCase() === destination.toLowerCase()) && (
            <div className="mt-1 max-h-28 overflow-y-auto">
              {SUGGESTIONS.filter((s) => s.toLowerCase().includes(destination.toLowerCase())).map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{city}</span>
                </button>
              ))}
            </div>
          )}

          <div className="h-px bg-border my-3" />

          {/* Dates */}
          <div className="flex items-center justify-between">
            <button onClick={() => setShowCalendar("in")} className="flex-1 text-left">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Arrivée</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {format(checkIn, "d MMM yyyy", { locale: fr })}
              </p>
            </button>
            <ArrowRight className="w-4 h-4 text-muted-foreground mx-3 shrink-0" />
            <button onClick={() => setShowCalendar("out")} className="flex-1 text-right">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Départ</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {format(checkOut, "d MMM yyyy", { locale: fr })}
              </p>
            </button>
          </div>

          <div className="h-px bg-border my-3" />

          {/* Counters */}
          <div className="space-y-0 divide-y divide-border">
            <CounterRow label="Chambre" value={rooms} min={1} max={10} onChange={setRooms} />
            <CounterRow label="Adultes" value={adults} min={1} max={20} onChange={setAdults} />
            <CounterRow label="Enfants" value={children} min={0} max={10} onChange={setChildren} />
          </div>
        </div>

        {/* Search button - always visible */}
        <div className="px-5 py-3 border-t border-border safe-bottom">
          <button
            onClick={handleSearch}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Rechercher
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── Counter row ── */
const CounterRow = ({
  label, value, min, max, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-sm text-foreground font-medium">{label}</span>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-25 text-muted-foreground"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-semibold text-foreground w-5 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-full border border-primary flex items-center justify-center text-primary disabled:opacity-25"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default MobileSearchPill;
