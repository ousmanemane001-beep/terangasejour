import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Bed } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { destinations, destinationCategories, Destination } from "@/data/destinations";

const categoryLabelsOnly: Record<Destination["category"], string> = {
  ville: "Villes",
  region: "Regions",
  plage: "Plages",
  lac: "Lacs",
  site_historique: "Sites historiques",
  musee: "Musees",
  hotel: "Hotels",
  commerce: "Commerces",
  lieu_public: "Lieux publics",
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(2);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredDestinations = destination.length > 0
    ? destinations.filter((d) =>
        d.name.toLowerCase().includes(destination.toLowerCase()) ||
        d.region.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 12)
    : destinations.slice(0, 8);

  const grouped = filteredDestinations.reduce<Record<string, Destination[]>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = [];
    acc[d.category].push(d);
    return acc;
  }, {});

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDestination = (d: Destination) => {
    setDestination(d.name);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    if (guestCount > 1) params.set("guests", String(guestCount));
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Booking.com style: horizontal bar with yellow search button */}
      <div className="flex flex-col md:flex-row items-stretch gap-1 p-1 rounded-xl" style={{ backgroundColor: 'hsl(var(--search-highlight))' }}>
        {/* Destination */}
        <div className="flex-[2] relative">
          <div className="flex items-center gap-2 bg-background rounded px-3 py-2.5 h-full">
            <Bed className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              placeholder="Où allez-vous ?"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground font-medium"
            />
          </div>

          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-[var(--shadow-elevated)] z-50 max-h-80 overflow-y-auto"
            >
              {Object.entries(grouped).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</p>
              ) : (
                Object.entries(grouped).map(([cat, items]) => {
                  const catLabel = destinationCategories.find((c) => c.value === cat)?.label || cat;
                  return (
                    <div key={cat}>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {categoryLabelsOnly[cat as Destination["category"]] || catLabel}
                      </p>
                      {items.map((d) => (
                        <button
                          key={`${d.category}-${d.name}`}
                          onClick={() => selectDestination(d)}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{d.region}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Date */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-[2] bg-background rounded px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground font-medium truncate">
                {checkIn && checkOut
                  ? `${format(checkIn, "dd/MM/yyyy", { locale: fr })} — ${format(checkOut, "dd/MM/yyyy", { locale: fr })}`
                  : "Date d'arrivée — Date de départ"}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <div className="flex flex-col sm:flex-row gap-2 p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Arrivée</p>
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                  disabled={(date) => date < new Date()}
                  className={cn("pointer-events-auto")}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 px-1">Départ</p>
                <CalendarComponent
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  className={cn("pointer-events-auto")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 bg-background rounded px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground font-medium whitespace-nowrap">
                {guestCount} adulte{guestCount > 1 ? "s" : ""} · 1 chambre
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-4" align="start">
            <p className="text-sm font-medium text-foreground mb-3">Voyageurs</p>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</Button>
              <span className="font-medium text-foreground">{guestCount}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search button — Booking.com blue */}
        <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-6 h-auto font-semibold text-base shrink-0">
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
