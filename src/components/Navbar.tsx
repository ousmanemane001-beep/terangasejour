import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Heart, Home, CalendarDays, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isHost, profile, signOut } = useAuth();

  const initials = profile
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : user?.user_metadata
    ? `${(user.user_metadata.first_name || "")[0] || ""}${(user.user_metadata.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : "U";

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Explorer", path: "/explore" },
    { label: "Carte", path: "/map" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-xs">TS</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">TerangaSéjour</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >{link.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to={isHost ? "/create-listing" : "/become-host"}>
            <Button variant="outline" size="sm" className="rounded-full text-sm">Publier un logement</Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-foreground">
                    {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground">{isHost ? "Hôte" : "Voyageur"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2"><Home className="w-4 h-4" /> Mon espace</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2"><Heart className="w-4 h-4" /> Mes favoris</Link>
                </DropdownMenuItem>
                {isHost && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=listings" className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Mes logements</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2"><User className="w-4 h-4" /> Profil</Link>
                </DropdownMenuItem>
                {!isHost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/become-host" className="flex items-center gap-2 text-primary font-medium">
                        <Home className="w-4 h-4" /> Devenir hôte
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground text-sm">Connexion</Button>
            </Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.path ? "text-primary bg-muted" : "text-muted-foreground"
                  }`}
                >{link.label}</Link>
              ))}
              {user && (
                <>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground">
                    Mes favoris
                  </Link>
                  {isHost && (
                    <Link to="/dashboard?tab=listings" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground">
                      Mes logements
                    </Link>
                  )}
                </>
              )}
              <div className="pt-3 flex flex-col gap-2">
                <Link to={isHost ? "/create-listing" : "/become-host"} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="rounded-full w-full">Publier un logement</Button>
                </Link>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="rounded-full bg-primary text-primary-foreground w-full">Mon espace</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => { signOut(); setMobileOpen(false); }}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="rounded-full bg-primary text-primary-foreground w-full">Connexion</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
