import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
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

  // Group by category
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
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-background rounded-2xl shadow-[var(--shadow-card)] border border-border p-2 flex flex-col md:flex-row items-stretch gap-2">
        {/* Destination */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors relative">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Destination</p>
            <Input
              ref={inputRef}
              placeholder="Pays ou zone"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {Object.entries(grouped).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</p>
              ) : (
                Object.entries(grouped).map(([cat, items]) => {
                  const catLabel = destinationCategories.find((c) => c.value === cat)?.label || cat;
                  return (
                    <div key={cat}>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {categoryIcons[cat as Destination["category"]]} {catLabel}
                      </p>
                      {items.map((d) => (
                        <button
                          key={`${d.category}-${d.name}`}
                          onClick={() => selectDestination(d)}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.region}</p>
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

        <div className="hidden md:block w-px bg-border self-stretch my-2" />

        {/* Date */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Durée du séjour</p>
                <p className="text-sm text-foreground">
                  {checkIn && checkOut
                    ? `${format(checkIn, "dd/MM/yyyy", { locale: fr })} – ${format(checkOut, "dd/MM/yyyy", { locale: fr })}`
                    : checkIn
                    ? `${format(checkIn, "dd/MM/yyyy", { locale: fr })} – ...`
                    : "Sélectionner"}
                </p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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

        <div className="hidden md:block w-px bg-border self-stretch my-2" />

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Voyageurs</p>
                <p className="text-sm text-foreground">{guestCount}</p>
              </div>
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

        {/* Search button */}
        <Button onClick={handleSearch} className="bg-primary text-primary-foreground rounded-xl px-6 h-12 font-semibold shrink-0">
          <Search className="w-4 h-4 mr-2" />
          RECHERCHER
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
