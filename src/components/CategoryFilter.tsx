import { useRef, useState, useEffect } from "react";
import {
  Building2, Waves, Star, TrendingDown, Flame,
  TreePine, Hotel, ShieldCheck, ChevronLeft, ChevronRight
} from "lucide-react";

export type CategoryKey =
  | "all" | "dakar" | "bord_mer" | "mieux_notes"
  | "moins_chers" | "populaires" | "region" | "hotels" | "verifies";

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: "dakar", label: "Dakar", icon: Building2 },
  { key: "bord_mer", label: "Bord de mer", icon: Waves },
  { key: "mieux_notes", label: "Les mieux notés", icon: Star },
  { key: "moins_chers", label: "Moins chers", icon: TrendingDown },
  { key: "populaires", label: "Populaires", icon: Flame },
  { key: "region", label: "En région", icon: TreePine },
  { key: "hotels", label: "Hôtels", icon: Hotel },
  { key: "verifies", label: "Vérifiés", icon: ShieldCheck },
];

interface Props {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
}

const CategoryFilter = ({ active, onChange }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-border bg-background shadow-sm items-center justify-center hover:scale-105 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide px-1 py-2 md:px-8"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onChange(cat.key)}
              className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 border-b-2 transition-all duration-200 ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <cat.icon className={`w-5 h-5 ${isActive ? "text-foreground" : ""}`} />
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-border bg-background shadow-sm items-center justify-center hover:scale-105 transition-transform"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;
