import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, ChevronLeft, Minus, Plus, Building2, Home, Hotel, CalendarDays, Users, X } from "lucide-react";
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
  const dateLabel = `${format(checkIn, "d MMM", { locale: fr })} – ${format(checkOut, "d MMM", { locale: fr })}`;

  /* ── Collapsed pill ── */
  if (!expanded) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-semibold text-foreground leading-tight">Où allez-vous ?</span>
            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
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

  /* ── Expanded bottom-sheet ── */
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-stretch justify-center" onClick={close}>
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative bg-background rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-base font-bold text-foreground">Rechercher</span>
          <button onClick={close} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 pb-2 flex-1">
          {/* Destination */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ville, quartier…"
              className="w-full pl-9 pr-3 py-2.5 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Suggestions chips */}
          {destination.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTIONS.slice(0, 6).map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-foreground active:bg-primary/10 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Filtered suggestions */}
          {destination.length > 0 && !SUGGESTIONS.some(s => s.toLowerCase() === destination.toLowerCase()) && (
            <div className="mt-1">
              {SUGGESTIONS.filter((s) => s.toLowerCase().includes(destination.toLowerCase())).map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{city}</span>
                </button>
              ))}
            </div>
          )}

          {/* Dates row */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowCalendar("in")}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-xl"
            >
              <CalendarDays className="w-4 h-4 text-primary shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Arrivée</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {format(checkIn, "d MMM", { locale: fr })}
                </p>
              </div>
            </button>
            <button
              onClick={() => setShowCalendar("out")}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-xl"
            >
              <CalendarDays className="w-4 h-4 text-primary shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Départ</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {format(checkOut, "d MMM", { locale: fr })}
                </p>
              </div>
            </button>
          </div>

          {/* Guests row */}
          <div className="flex gap-2 mt-2">
            <div className="flex-1 flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">Adultes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  disabled={adults <= 1}
                  className="w-6 h-6 rounded-full border border-border flex items-center justify-center disabled:opacity-25 text-muted-foreground"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-foreground w-4 text-center">{adults}</span>
                <button
                  onClick={() => setAdults(Math.min(20, adults + 1))}
                  disabled={adults >= 20}
                  className="w-6 h-6 rounded-full border border-primary flex items-center justify-center text-primary disabled:opacity-25"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
              <span className="text-xs font-medium text-foreground">Enfants</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  disabled={children <= 0}
                  className="w-6 h-6 rounded-full border border-border flex items-center justify-center disabled:opacity-25 text-muted-foreground"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-foreground w-4 text-center">{children}</span>
                <button
                  onClick={() => setChildren(Math.min(10, children + 1))}
                  disabled={children >= 10}
                  className="w-6 h-6 rounded-full border border-primary flex items-center justify-center text-primary disabled:opacity-25"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 py-3 border-t border-border safe-bottom">
          <button
            onClick={handleSearch}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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

export default MobileSearchPill;
