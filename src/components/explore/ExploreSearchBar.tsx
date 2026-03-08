import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarIcon, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ExploreSearchBarProps {
  destination: string;
  setDestination: (v: string) => void;
  checkIn: Date | undefined;
  setCheckIn: (d: Date | undefined) => void;
  checkOut: Date | undefined;
  setCheckOut: (d: Date | undefined) => void;
  guestCount: number;
  setGuestCount: (n: number) => void;
}

const ExploreSearchBar = ({
  destination, setDestination,
  checkIn, setCheckIn,
  checkOut, setCheckOut,
  guestCount, setGuestCount,
}: ExploreSearchBarProps) => {
  return (
    <div className="sticky top-16 z-40 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5 flex-1 min-w-[180px]">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <Input
              placeholder="Où allez-vous ?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {checkIn ? format(checkIn, "d MMM", { locale: fr }) : "Arrivée"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {checkOut ? format(checkOut, "d MMM", { locale: fr }) : "Départ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date < (checkIn || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="bg-muted rounded-full px-4 py-2.5 h-auto gap-2 text-sm font-normal">
                <Users className="w-4 h-4 text-primary" />
                {guestCount} voyageur{guestCount > 1 ? "s" : ""}
              </Button>
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
          <Button className="rounded-full bg-primary text-primary-foreground gap-2 px-6">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Rechercher</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExploreSearchBar;
