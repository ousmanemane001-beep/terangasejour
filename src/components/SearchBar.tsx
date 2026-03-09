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
    <div className="w-full max-w-4xl relative" style={{ zIndex: 1000 }}>
      {/* White card container */}
      <div className="bg-white rounded-xl shadow-lg p-5">
        <div className="flex flex-col gap-4">
          {/* Fields row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Destination */}
            <div className="relative" style={{ zIndex: 1000 }}>
              <label className="text-xs font-semibold text-blue-600 mb-1.5 block">Destination</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 h-[50px] bg-white hover:border-blue-400 transition-colors">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Où allez-vous ?"
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 font-medium placeholder:text-gray-400"
                />
              </div>

              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl max-h-[420px] overflow-y-auto shadow-xl"
                  style={{ zIndex: 1000 }}
                >
                  {isSearching ? (
                    filteredDestinations.length === 0 ? (
                      <p className="p-5 text-sm text-gray-500 text-center">Aucun résultat trouvé</p>
                    ) : (
                      <div className="py-2">
                        {filteredDestinations.map((d) => (
                          <button
                            key={`${d.category}-${d.name}`}
                            onClick={() => selectDestination(d.name)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                              <p className="text-xs text-gray-500 truncate">{d.region}, Sénégal</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="py-2">
                      <p className="px-4 pt-2 pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Destinations populaires
                      </p>
                      {POPULAR_DESTINATIONS.map((d) => (
                        <button
                          key={d.name}
                          onClick={() => selectDestination(d.name, d.lat, d.lng)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Navigation className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                            <p className="text-xs text-gray-500">{d.region}</p>
                          </div>
                        </button>
                      ))}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => { setShowSuggestions(false); navigate("/map"); }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-blue-600">Explorer sur la carte</p>
                            <p className="text-xs text-gray-500">Voir tous les logements géolocalisés</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <Popover>
              <div>
                <label className="text-xs font-semibold text-blue-600 mb-1.5 block">Dates</label>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 h-[50px] bg-white cursor-pointer hover:border-blue-400 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-sm text-gray-800 font-medium truncate">
                      {checkIn && checkOut
                        ? `${format(checkIn, "dd MMM", { locale: fr })} — ${format(checkOut, "dd MMM", { locale: fr })}`
                        : "Arrivée — Départ"}
                    </span>
                  </div>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <div className="flex flex-col sm:flex-row gap-2 p-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 px-1">Arrivée</p>
                    <CalendarComponent
                      mode="single"
                      selected={checkIn}
                      onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                      disabled={(date) => date < new Date()}
                      className={cn("pointer-events-auto")}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 px-1">Départ</p>
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
              <div>
                <label className="text-xs font-semibold text-blue-600 mb-1.5 block">Voyageurs</label>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 h-[50px] bg-white cursor-pointer hover:border-blue-400 transition-colors">
                    <Users className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
                      {guestCount} adulte{guestCount > 1 ? "s" : ""} · 1 chambre
                    </span>
                  </div>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-56 p-4" align="start">
                <p className="text-sm font-semibold text-gray-800 mb-3">Nombre de voyageurs</p>
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400" 
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  >
                    -
                  </Button>
                  <span className="font-semibold text-gray-800 text-lg">{guestCount}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400" 
                    onClick={() => setGuestCount(Math.min(12, guestCount + 1))}
                  >
                    +
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search button */}
          <Button 
            onClick={handleSearch} 
            className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
