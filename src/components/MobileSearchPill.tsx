import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileSearchPill = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/explore")}
      className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <Search className="w-5 h-5 text-foreground shrink-0" />
      <div className="flex flex-col items-start text-left">
        <span className="text-sm font-semibold text-foreground leading-tight">Où allez-vous ?</span>
        <span className="text-xs text-muted-foreground leading-tight">
          N'importe où · N'importe quand · Voyageurs
        </span>
      </div>
    </button>
  );
};

export default MobileSearchPill;
