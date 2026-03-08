import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarIcon, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ExploreHeroProps {
  destination: string;
  setDestination: (v: string) => void;
  checkIn: Date | undefined;
  setCheckIn: (d: Date | undefined) => void;
  checkOut: Date | undefined;
  setCheckOut: (d: Date | undefined) => void;
  guestCount: number;
  setGuestCount: (n: number) => void;
}

const ExploreHero = ({
  destination, setDestination,
  checkIn, setCheckIn,
  checkOut, setCheckOut,
  guestCount, setGuestCount,
}: ExploreHeroProps) => {
  return (
    <section className="bg-background pt-10 pb-8 md:pt-16 md:pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-3 leading-tight">
            Trouvez l'endroit parfait, à votre façon.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Affinez votre recherche, explorez la carte et réservez le logement idéal en toute simplicité.
          </p>
        </motion.div>

        {/* Search fields — sejour.sn style */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-border rounded-xl overflow-hidden bg-card shadow-[var(--shadow-card)]">
            {/* Destination */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-border">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Destination</p>
                <Input
                  placeholder="Pays ou zone"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="border-0 bg-transparent h-auto p-0 text-sm font-medium text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-border">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Durée du séjour</p>
                <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="hover:text-primary transition-colors">
                        {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : <span className="text-muted-foreground/60">Arrivée</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">-</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="hover:text-primary transition-colors">
                        {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : <span className="text-muted-foreground/60">Départ</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date < (checkIn || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Nombre de voyageurs</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {guestCount}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-4" align="start">
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</Button>
                      <span className="font-medium text-foreground">{guestCount}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setGuestCount(Math.min(12, guestCount + 1))}>+</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Search button */}
          <div className="flex justify-center mt-5">
            <Button className="rounded-full bg-primary text-primary-foreground gap-2 px-8 py-2.5 h-auto text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreHero;
