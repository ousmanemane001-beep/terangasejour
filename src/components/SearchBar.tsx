import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Navigation, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDestinations, usePopularDestinations, type DbDestination } from "@/hooks/useDestinations";
import { useTranslation } from "react-i18next";

const CATEGORY_ICONS: Record<string, string> = {
  ville: "🏙️", aeroport: "✈️", site_historique: "🏛️", plage: "🏖️",
  lac: "🌊", restaurant: "🍽️", hotel: "🏨", ile: "🏝️", parc_naturel: "🌿",
};

const SearchBar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const datePlaceholder = i18n.language === "fr" ? "jj/mm/aaaa" : "mm/dd/yyyy";

  const CATEGORY_LABELS: Record<string, string> = {
    ville: t("discover.cities"), aeroport: i18n.language === "fr" ? "Aéroport" : "Airport",
    site_historique: t("discover.historical"), plage: t("discover.beaches"),
    lac: i18n.language === "fr" ? "Lac" : "Lake", restaurant: "Restaurant",
    hotel: t("search.hotel"), ile: t("discover.islands"),
    parc_naturel: t("discover.nature"),
  };

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

  useEffect(() => {
    const ti = setTimeout(() => setDebouncedSearch(destination), 200);
    return () => clearTimeout(ti);
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

  const guestLabel = `${guestCount} ${guestCount > 1 ? t("search.travelers_plural") : t("search.traveler")}`;

  const fieldStyle = "bg-[#fafafa] border border-border rounded-[10px] h-[41px] md:h-[56px] px-4 flex items-center cursor-pointer hover:border-[#ccc] transition-colors";

  return (
    <div className="w-full" style={{ zIndex: 1000 }}>
      {/* Desktop — single unified bar */}
      <div className="hidden md:flex items-center bg-white border border-border rounded-full shadow-lg h-[60px] pl-6 pr-2 relative" style={{ zIndex: 1000 }}>
        {/* Destination */}
        <div className="relative flex-1 min-w-0 pr-4" style={{ zIndex: 1000 }}>
          <div className="flex flex-col justify-center cursor-pointer" onClick={() => inputRef.current?.focus()}>
            <span className="text-[13px] font-semibold text-foreground leading-tight">{t("search.destination")}</span>
            <Input
              ref={inputRef}
              placeholder={t("search.cityOrArea")}
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground font-normal placeholder:text-muted-foreground"
            />
          </div>
          {showSuggestions && (
            <SuggestionsDropdown
              isSearching={isSearching} searching={searching}
              filteredDestinations={filteredDestinations}
              popularDestinations={popularDestinations || []}
              selectDestination={selectDestination}
              setShowSuggestions={setShowSuggestions}
              navigate={navigate} suggestionsRef={suggestionsRef}
              categoryLabels={CATEGORY_LABELS} t={t}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border shrink-0" />

        {/* Dates */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 min-w-0 px-4 flex flex-col justify-center cursor-pointer">
              <span className="text-[13px] font-semibold text-foreground leading-tight">Dates</span>
              <span className="text-[14px] text-muted-foreground truncate">
                {checkIn && checkOut
                  ? `${format(checkIn, "dd MMM", { locale: dateLocale })} → ${format(checkOut, "dd MMM", { locale: dateLocale })}`
                  : checkIn
                    ? format(checkIn, "dd MMM", { locale: dateLocale })
                    : t("search.when")}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            {!checkIn ? (
              <CalendarComponent mode="single" selected={checkIn}
                onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                disabled={(date) => date < new Date()} className={cn("pointer-events-auto")} />
            ) : (
              <CalendarComponent mode="single" selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date < (checkIn || new Date())} className={cn("pointer-events-auto")} />
            )}
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-px h-8 bg-border shrink-0" />

        {/* Voyageurs */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 min-w-0 px-4 flex flex-col justify-center cursor-pointer">
              <span className="text-[13px] font-semibold text-foreground leading-tight">{t("search.travelers")}</span>
              <span className="text-[14px] text-muted-foreground truncate">
                {guestCount > 1 ? guestLabel : (i18n.language === "fr" ? "Ajouter des ..." : "Add guests ...")}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="end">
            <p className="text-sm font-semibold text-foreground mb-3">{t("search.travelers")}</p>
            <div className="flex items-center justify-between">
              <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
              <span className="font-semibold text-foreground text-lg">{guestCount}</span>
              <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground/30 transition-colors" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search button */}
        <button onClick={handleSearch} className="shrink-0 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors ml-2">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("search.destination")}</span>
          </div>
          <div className={fieldStyle} onClick={() => mobileInputRef.current?.focus()}>
            <Input
              ref={mobileInputRef}
              placeholder={t("search.cityOrArea")}
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-transparent h-auto p-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground font-normal placeholder:text-muted-foreground"
            />
          </div>
          {showSuggestions && (
            <SuggestionsDropdown
              isSearching={isSearching} searching={searching}
              filteredDestinations={filteredDestinations}
              popularDestinations={popularDestinations || []}
              selectDestination={selectDestination}
              setShowSuggestions={setShowSuggestions}
              navigate={navigate} suggestionsRef={suggestionsRef}
              categoryLabels={CATEGORY_LABELS} t={t}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("search.stayDuration")}</span>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <div className={cn(fieldStyle, "flex-1 !h-[39px] md:!h-[56px]")}>
                  <span className={cn("text-[15px] flex-1", checkIn ? "text-foreground" : "text-muted-foreground")}>
                    {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: dateLocale }) : datePlaceholder}
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <CalendarComponent mode="single" selected={checkIn}
                  onSelect={(d) => { setCheckIn(d); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                  disabled={(date) => date < new Date()} className={cn("pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <div className={cn(fieldStyle, "flex-1 !h-[39px] md:!h-[56px]")}>
                  <span className={cn("text-[15px] flex-1", checkOut ? "text-foreground" : "text-muted-foreground")}>
                    {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: dateLocale }) : datePlaceholder}
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <CalendarComponent mode="single" selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())} className={cn("pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("search.travelers")}</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={cn(fieldStyle, "justify-between !h-[28px] md:!h-[56px]")}>
                <span className="text-[15px] text-foreground">{guestLabel}</span>
                <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4" align="start">
              <p className="text-sm font-semibold text-foreground mb-3">{t("search.travelers")}</p>
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
          {t("search.search")}
        </button>
      </div>
    </div>
  );
};

/* Suggestions dropdown */
interface SuggestionsDropdownProps {
  isSearching: boolean;
  searching: boolean;
  filteredDestinations: DbDestination[];
  popularDestinations: DbDestination[];
  selectDestination: (dest: DbDestination) => void;
  setShowSuggestions: (v: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  categoryLabels: Record<string, string>;
  t: (key: string) => string;
}

const SuggestionsDropdown = ({
  isSearching, searching, filteredDestinations, popularDestinations,
  selectDestination, setShowSuggestions, navigate, suggestionsRef, categoryLabels, t,
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
        <p className="p-5 text-sm text-muted-foreground text-center">{t("explore.noResults")}</p>
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
                  {categoryLabels[d.category] || d.category} · {d.region || "Sénégal"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )
    ) : (
      <div className="py-1">
        <p className="px-4 pt-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {t("searchBar.popularDestinations")}
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
              <p className="text-sm font-medium text-[#1a56db]">{t("searchBar.exploreMap")}</p>
              <p className="text-xs text-muted-foreground">{t("searchBar.viewAllListings")}</p>
            </div>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default SearchBar;
