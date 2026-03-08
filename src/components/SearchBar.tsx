import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-background rounded-2xl shadow-[var(--shadow-card)] border border-border p-2 flex flex-col md:flex-row items-stretch gap-2">
        {/* Destination */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Destination</p>
            <p className="text-sm text-foreground">Pays ou zone</p>
          </div>
        </div>

        <div className="hidden md:block w-px bg-border self-stretch my-2" />

        {/* Date */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <Calendar className="w-4 h-4 text-accent shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Durée du séjour</p>
            <p className="text-sm text-foreground">08/03/2026 – 15/03/2026</p>
          </div>
        </div>

        <div className="hidden md:block w-px bg-border self-stretch my-2" />

        {/* Guests */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <Users className="w-4 h-4 text-accent shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Voyageurs</p>
            <p className="text-sm text-foreground">2</p>
          </div>
        </div>

        {/* Search button */}
        <Button className="bg-primary text-primary-foreground rounded-xl px-6 h-12 font-medium shrink-0">
          <Search className="w-4 h-4 mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
