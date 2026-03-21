import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Navigation, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDestinations, usePopularDestinations, type DbDestination } from "@/hooks/useDestinations";

const CATEGORY_ICONS: Record<string, string> = {
  ville: "🏙️",
  aeroport: "✈️",
  site_historique: "🏛️",
  plage: "🏖️",
  lac: "🌊",
  restaurant: "🍽️",
  hotel: "🏨",
  ile: "🏝️",
  parc_naturel: "🌿",
};

const CATEGORY_LABELS: Record<string, string> = {
  ville: "Ville",
  aeroport: "Aéroport",
  site_historique: "Site historique",
  plage: "Plage",
  lac: "Lac",
  restaurant: "Restaurant",
  hotel: "Hôtel",
  ile: "Île",
  parc_naturel: "Parc naturel",
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [selectedDest, setSelectedDest] = useState<DbDestination | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(destination), 200);
    return () => clearTimeout(t);
  }, [destination]);

  const { data: searchResults, isLoading: searching } = useDestinations(
    debouncedSearch.length > 0 ? debouncedSearch : undefined
  );
  const { data: popularDestinations } = usePopularDestinations();

  const isSearching = destination.length > 0;
  const filteredDestinations = isSearching ? (searchResults || []).slice(0, 10) : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node) &&
          mobileInputRef.current && !mobileInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDestination = (dest: DbDestination) => {
    setDestination(dest.name);
    setSelectedDest(dest);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    if (guestCount > 1) params.set("guests", String(guestCount));
    if (selectedDest?.latitude && selectedDest?.longitude) {
      params.set("lat", String(selectedDest.latitude));
      params.set("lng", String(selectedDest.longitude));
    }
    navigate(`/explore?${params.toString()}`);
  };

  const fieldStyle = "bg-[#fafafa] border border-border rounded-[10px] h-[41px] md:h-[56px] px-4 flex items-center cursor-pointer hover:border-[#ccc] transition-colors";

  return (
    <div className="w-full" style={{ zIndex: 1000 }}>
      {/* Desktop */}
      <div className="hidden md:flex items-end gap-4">
        <div className="relative flex-1 min-w-[180px]" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Destination</span>
          </div>
          <div className={fieldStyle} onClick={() => inputRef.current?.focus()}>
            <Input
              ref={inputRef}
              placeholder="Ville, plage, site…"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground font-normal placeholder:text-muted-foreground"
            />
          </div>
          {showSuggestions && (
            <SuggestionsDropdown
              isSearching={isSearching}
              searching={searching}
              filteredDestinations={filteredDestinations}
              popularDestinations={popularDestinations || []}
              selectDestination={selectDestination}
              setShowSuggestions={setShowSuggestions}
              navigate={navigate}
              suggestionsRef={suggestionsRef}
            />
          )}
        </div>

        {/* Date arrivée */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Date arrivée</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle)}>
                <span className={cn("text-[15px] flex-1", checkIn ? "text-foreground" : "text-muted-foreground")}>
                  {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                </span>
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <CalendarComponent
                mode="single" selected={checkIn}
                onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                disabled={(date) => date < new Date()}
                className={cn("pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date départ */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Date départ</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle)}>
                <span className={cn("text-[15px] flex-1", checkOut ? "text-foreground" : "text-muted-foreground")}>
                  {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                </span>
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <CalendarComponent
                mode="single" selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date < (checkIn || new Date())}
                className={cn("pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Voyageurs */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Voyageurs</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle, "justify-between")}>
                <span className="text-[15px] text-foreground">{guestCount} voyageur{guestCount > 1 ? "s" : ""}</span>
                <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <p className="text-sm font-semibold text-foreground mb-3">Voyageurs</p>
              <div className="flex items-center justify-between">
                <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
                <span className="font-semibold text-foreground text-lg">{guestCount}</span>
                <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="shrink-0 pb-[1px]">
          <div className="mb-1.5 h-5" />
          <button onClick={handleSearch} className="h-[56px] px-8 bg-primary hover:bg-primary/90 text-white rounded-[28px] font-semibold text-base flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
            Rechercher
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Destination</span>
          </div>
          <div className={fieldStyle} onClick={() => mobileInputRef.current?.focus()}>
            <Input
              ref={mobileInputRef}
              placeholder="Ville, plage, site…"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground font-normal placeholder:text-muted-foreground"
            />
          </div>
          {showSuggestions && (
            <SuggestionsDropdown
              isSearching={isSearching}
              searching={searching}
              filteredDestinations={filteredDestinations}
              popularDestinations={popularDestinations || []}
              selectDestination={selectDestination}
              setShowSuggestions={setShowSuggestions}
              navigate={navigate}
              suggestionsRef={suggestionsRef}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Durée du séjour</span>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className={cn(fieldStyle, "flex-1 !h-[39px] md:!h-[56px]")}>
                  <span className={cn("text-[15px] flex-1", checkIn ? "text-foreground" : "text-muted-foreground")}>
                    {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <CalendarComponent
                  mode="single" selected={checkIn}
                  onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                  disabled={(date) => date < new Date()}
                  className={cn("pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <div className={cn(fieldStyle, "flex-1 !h-[39px] md:!h-[56px]")}>
                  <span className={cn("text-[15px] flex-1", checkOut ? "text-foreground" : "text-muted-foreground")}>
                    {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <CalendarComponent
                  mode="single" selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  className={cn("pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Voyageurs</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle, "justify-between !h-[28px] md:!h-[56px]")}>
                <span className="text-[15px] text-foreground">{guestCount} voyageur{guestCount > 1 ? "s" : ""}</span>
                <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <p className="text-sm font-semibold text-foreground mb-3">Voyageurs</p>
              <div className="flex items-center justify-between">
                <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
                <span className="font-semibold text-foreground text-lg">{guestCount}</span>
                <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <button onClick={handleSearch} className="w-full h-[38px] md:h-[56px] bg-primary hover:bg-primary/90 text-white rounded-[28px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
          <Search className="w-5 h-5" />
          Rechercher
        </button>
      </div>
    </div>
  );
};

/* Suggestions dropdown using DB destinations */
interface SuggestionsDropdownProps {
  isSearching: boolean;
  searching: boolean;
  filteredDestinations: DbDestination[];
  popularDestinations: DbDestination[];
  selectDestination: (dest: DbDestination) => void;
  setShowSuggestions: (v: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}

const SuggestionsDropdown = ({
  isSearching, searching, filteredDestinations, popularDestinations,
  selectDestination, setShowSuggestions, navigate, suggestionsRef,
}: SuggestionsDropdownProps) => (
  <div
    ref={suggestionsRef}
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg max-h-[400px] overflow-y-auto"
    style={{ zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
  >
    {isSearching ? (
      searching ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground text-center">Aucun résultat trouvé</p>
      ) : (
        <div className="py-1">
          {filteredDestinations.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDestination(d)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0 text-base">
                {CATEGORY_ICONS[d.category] || "📍"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {CATEGORY_LABELS[d.category] || d.category} · {d.region || "Sénégal"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )
    ) : (
      <div className="py-1">
        <p className="px-4 pt-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Destinations populaires
        </p>
        {popularDestinations.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDestination(d)}
            className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-[#555]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.region || "Sénégal"}</p>
            </div>
          </button>
        ))}
        <div className="border-t border-[#f0f0f0] mt-1 pt-1">
          <button
            onClick={() => { setShowSuggestions(false); navigate("/map"); }}
            className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a56db]">Explorer sur la carte</p>
              <p className="text-xs text-muted-foreground">Voir tous les logements</p>
            </div>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default SearchBar;
