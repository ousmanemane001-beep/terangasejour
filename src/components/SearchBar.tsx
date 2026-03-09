import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Navigation } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
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

const fieldClasses = "bg-white border border-[#e6e6e6] rounded-[4px] h-[60px] px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#ccc] transition-colors";

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(2);
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

  return (
    <div className="w-full max-w-[900px] relative" style={{ zIndex: 1000 }}>
      {/* Desktop: horizontal row | Mobile: vertical stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] md:gap-4">

        {/* Destination */}
        <div className="relative" style={{ zIndex: 1000 }}>
          <div className={fieldClasses} onClick={() => inputRef.current?.focus()}>
            <MapPin className="w-5 h-5 text-[#333] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#333] leading-none mb-0.5">Destination</p>
              <Input
                ref={inputRef}
                placeholder="Pays ou zone"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="border-0 bg-transparent h-auto p-0 text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#333] font-normal placeholder:text-[#999]"
              />
            </div>
          </div>

          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e6e6e6] rounded-lg max-h-[400px] overflow-y-auto"
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
          )}
        </div>

        {/* Durée du séjour */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={fieldClasses}>
              <Calendar className="w-5 h-5 text-[#333] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#333] leading-none mb-0.5">Durée du séjour</p>
                <p className="text-[13px] text-[#333] font-normal truncate">
                  {checkIn && checkOut
                    ? `${format(checkIn, "dd/MM/yyyy", { locale: fr })} - ${format(checkOut, "dd/MM/yyyy", { locale: fr })}`
                    : <span className="text-[#999]">Sélectionnez vos dates</span>}
                </p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <div className="flex flex-col sm:flex-row gap-2 p-3">
              <div>
                <p className="text-xs font-medium text-[#666] mb-1 px-1">Arrivée</p>
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                  disabled={(date) => date < new Date()}
                  className={cn("pointer-events-auto")}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#666] mb-1 px-1">Départ</p>
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

        {/* Nombre de voyageurs */}
        <Popover>
          <PopoverTrigger asChild>
            <div className={fieldClasses}>
              <Users className="w-5 h-5 text-[#333] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#333] leading-none mb-0.5">Nombre de voyageurs</p>
                <p className="text-[13px] text-[#333] font-normal">{guestCount}</p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <p className="text-sm font-semibold text-[#333] mb-3">Voyageurs</p>
            <div className="flex items-center justify-between">
              <button
                className="h-9 w-9 rounded-full border border-[#e6e6e6] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              >-</button>
              <span className="font-semibold text-[#333] text-lg">{guestCount}</span>
              <button
                className="h-9 w-9 rounded-full border border-[#e6e6e6] flex items-center justify-center text-[#333] hover:border-[#999] transition-colors"
                onClick={() => setGuestCount(Math.min(12, guestCount + 1))}
              >+</button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={handleSearch}
          className="w-full md:w-[180px] h-[52px] bg-[#1a2b49] hover:bg-[#152240] text-white rounded-[28px] font-semibold text-base flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          Rechercher
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
