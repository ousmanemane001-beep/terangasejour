import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, LogIn } from "lucide-react";

const items = [
  { label: "Accueil", path: "/", icon: Home },
  { label: "Explorer", path: "/explore", icon: Search },
  { label: "Favoris", path: "/favorites", icon: Heart },
  { label: "Connexion", path: "/login", icon: LogIn },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
