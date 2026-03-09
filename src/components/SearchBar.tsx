import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Navigation } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { destinations, Destination } from "@/data/destinations";

const POPULAR_DESTINATIONS: { name: string; region: string; lat: number; lng: number }[] = [
  { name: "Dakar", region: "Région de Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Saly", region: "Petite Côte", lat: 14.4474, lng: -17.0174 },
  { name: "Saint-Louis", region: "Nord du Sénégal", lat: 16.0326, lng: -16.4896 },
  { name: "Cap Skirring", region: "Casamance", lat: 12.3933, lng: -16.7461 },
  { name: "Somone", region: "Petite Côte", lat: 14.4860, lng: -17.0768 },
  { name: "Mbour", region: "Petite Côte", lat: 14.4167, lng: -16.9667 },
];

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const isSearching = destination.length > 0;

  const filteredDestinations = isSearching
    ? destinations.filter((d) =>
        d.name.toLowerCase().includes(destination.toLowerCase()) ||
        d.region.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 8)
    : [];

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

  const selectDestination = (name: string, lat?: number, lng?: number) => {
    setDestination(name);
    const found = destinations.find((d) => d.name === name);
    setSelectedDest(found || (lat && lng ? { name, category: "ville" as const, region: "", lat, lng } : null));
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    if (guestCount > 1) params.set("guests", String(guestCount));
    if (selectedDest) {
      params.set("lat", String(selectedDest.lat));
      params.set("lng", String(selectedDest.lng));
    }
    navigate(`/explore?${params.toString()}`);
  };

  const fieldStyle = "bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] h-[41px] md:h-[56px] px-4 flex items-center cursor-pointer hover:border-[#ccc] transition-colors";

  return (
    <div className="w-full" style={{ zIndex: 1000 }}>
      {/* Desktop: horizontal row */}
      <div className="hidden md:flex items-end gap-4">
        {/* Destination */}
        <div className="relative flex-1 min-w-[180px]" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Destination</span>
          </div>
          <div className={fieldStyle} onClick={() => inputRef.current?.focus()}>
            <Input
              ref={inputRef}
              placeholder="Pays ou zone"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#333] font-normal placeholder:text-[#aaa]"
            />
          </div>
          {showSuggestions && <SuggestionsDropdown
            isSearching={isSearching}
            filteredDestinations={filteredDestinations}
            selectDestination={selectDestination}
            setShowSuggestions={setShowSuggestions}
            navigate={navigate}
            suggestionsRef={suggestionsRef}
          />}
        </div>

        {/* Date arrivée */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Date arrivée</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle)}>
                <span className={cn("text-[15px] flex-1", checkIn ? "text-[#333]" : "text-[#aaa]")}>
                  {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                </span>
                <Calendar className="w-4 h-4 text-[#aaa] shrink-0" />
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
            <Calendar className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Date départ</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle)}>
                <span className={cn("text-[15px] flex-1", checkOut ? "text-[#333]" : "text-[#aaa]")}>
                  {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                </span>
                <Calendar className="w-4 h-4 text-[#aaa] shrink-0" />
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
            <Users className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Voyageurs</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle, "justify-between")}>
                <span className="text-[15px] text-[#333]">{guestCount} voyageur{guestCount > 1 ? "s" : ""}</span>
                <svg className="w-4 h-4 text-[#aaa] shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <p className="text-sm font-semibold text-[#333] mb-3">Voyageurs</p>
              <div className="flex items-center justify-between">
                <button className="h-9 w-9 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
                <span className="font-semibold text-[#333] text-lg">{guestCount}</span>
                <button className="h-9 w-9 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bouton */}
        <div className="shrink-0 pb-[1px]">
          <div className="mb-1.5 h-5" />
          <button onClick={handleSearch} className="h-[56px] px-8 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-[28px] font-semibold text-base flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
            Rechercher
          </button>
        </div>
      </div>

      {/* Mobile: stacked 4 rows */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Row 1: Destination */}
        <div className="relative" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Destination</span>
          </div>
          <div className={fieldStyle} onClick={() => inputRef.current?.focus()}>
            <Input
              placeholder="Pays ou zone"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#333] font-normal placeholder:text-[#aaa]"
            />
          </div>
          {showSuggestions && <SuggestionsDropdown
            isSearching={isSearching}
            filteredDestinations={filteredDestinations}
            selectDestination={selectDestination}
            setShowSuggestions={setShowSuggestions}
            navigate={navigate}
            suggestionsRef={suggestionsRef}
          />}
        </div>

        {/* Row 2: Durée du séjour — two dates side by side */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Durée du séjour</span>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className={cn(fieldStyle, "flex-1")}>
                  <span className={cn("text-[15px] flex-1", checkIn ? "text-[#333]" : "text-[#aaa]")}>
                    {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                  </span>
                  <Calendar className="w-4 h-4 text-[#aaa] shrink-0" />
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
                <div className={cn(fieldStyle, "flex-1")}>
                  <span className={cn("text-[15px] flex-1", checkOut ? "text-[#333]" : "text-[#aaa]")}>
                    {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : "jj/mm/aaaa"}
                  </span>
                  <Calendar className="w-4 h-4 text-[#aaa] shrink-0" />
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

        {/* Row 3: Voyageurs */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-4 h-4 text-[#0d9488]" />
            <span className="text-sm font-semibold text-[#333]">Voyageurs</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle, "justify-between !h-[30px] md:!h-[56px]")}>
                <span className="text-[15px] text-[#333]">{guestCount} voyageur{guestCount > 1 ? "s" : ""}</span>
                <svg className="w-4 h-4 text-[#aaa] shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <p className="text-sm font-semibold text-[#333] mb-3">Voyageurs</p>
              <div className="flex items-center justify-between">
                <button className="h-9 w-9 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
                <span className="font-semibold text-[#333] text-lg">{guestCount}</span>
                <button className="h-9 w-9 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 4: Bouton Rechercher */}
        <button onClick={handleSearch} className="w-full h-[40px] md:h-[56px] bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-[28px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
          <Search className="w-5 h-5" />
          Rechercher
        </button>
      </div>
    </div>
  );
};

/* Extracted suggestions dropdown */
interface SuggestionsDropdownProps {
  isSearching: boolean;
  filteredDestinations: Destination[];
  selectDestination: (name: string, lat?: number, lng?: number) => void;
  setShowSuggestions: (v: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}

const SuggestionsDropdown = ({ isSearching, filteredDestinations, selectDestination, setShowSuggestions, navigate, suggestionsRef }: SuggestionsDropdownProps) => (
  <div
    ref={suggestionsRef}
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e5e5] rounded-lg max-h-[400px] overflow-y-auto"
    style={{ zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
  >
    {isSearching ? (
      filteredDestinations.length === 0 ? (
        <p className="p-5 text-sm text-[#999] text-center">Aucun résultat trouvé</p>
      ) : (
        <div className="py-1">
          {filteredDestinations.map((d) => (
            <button
              key={`${d.category}-${d.name}`}
              onClick={() => selectDestination(d.name)}
              className="w-full text-left px-4 py-3 hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#555]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#333] truncate">{d.name}</p>
                <p className="text-xs text-[#999] truncate">{d.region}, Sénégal</p>
              </div>
            </button>
          ))}
        </div>
      )
    ) : (
      <div className="py-1">
        <p className="px-4 pt-3 pb-2 text-[11px] font-bold text-[#999] uppercase tracking-wider">
          Destinations populaires
        </p>
        {POPULAR_DESTINATIONS.map((d) => (
          <button
            key={d.name}
            onClick={() => selectDestination(d.name, d.lat, d.lng)}
            className="w-full text-left px-4 py-3 hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-[#555]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#333]">{d.name}</p>
              <p className="text-xs text-[#999]">{d.region}</p>
            </div>
          </button>
        ))}
        <div className="border-t border-[#f0f0f0] mt-1 pt-1">
          <button
            onClick={() => { setShowSuggestions(false); navigate("/map"); }}
            className="w-full text-left px-4 py-3 hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a56db]">Explorer sur la carte</p>
              <p className="text-xs text-[#999]">Voir tous les logements</p>
            </div>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default SearchBar;
