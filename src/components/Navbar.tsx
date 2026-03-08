import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Heart, Home, CalendarDays, MessageCircle, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isHost, isAdmin, profile, signOut } = useAuth();
  const unreadCount = useUnreadCount();

  const initials = profile
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : user?.user_metadata
    ? `${(user.user_metadata.first_name || "")[0] || ""}${(user.user_metadata.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : "U";

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Explorer", path: "/explore" },
    { label: "Carte", path: "/map" },
    { label: "À propos", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const roleLabel = isAdmin ? "Super Admin" : isHost ? "Hôte" : "Voyageur";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-[var(--shadow-nav)]">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold text-primary-foreground">TerangaSéjour</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-primary-foreground bg-white/15"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
              }`}
            >{link.label}</Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          {!isAdmin && (
            <Link to={isHost ? "/create-listing" : "/become-host"}>
              <Button variant="outline" size="sm" className="rounded text-sm border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-white/10 hover:text-primary-foreground">
                Ajouter mon logement
              </Button>
            </Link>
          )}
          {user ? (
            <>
              {unreadCount > 0 && (
                <Link to={dashboardPath} className="relative">
                  <Button variant="ghost" size="icon" className="rounded text-primary-foreground hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full">{unreadCount}</Badge>
                  </Button>
                </Link>
              )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded text-primary-foreground hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${isAdmin ? "bg-destructive" : "bg-white/20"} text-primary-foreground text-xs font-bold`}>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-foreground">
                    {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isAdmin ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 text-primary font-medium">
                        <Shield className="w-4 h-4" /> Panel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2"><User className="w-4 h-4" /> Profil</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2"><Home className="w-4 h-4" /> Mon espace</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center gap-2"><Heart className="w-4 h-4" /> Mes favoris</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Messages</Link>
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
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signup">
                <Button variant="outline" size="sm" className="rounded text-sm border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-white/10 hover:text-primary-foreground">
                  S'inscrire
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm" className="rounded text-sm border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-white/10 hover:text-primary-foreground">
                  Se connecter
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-primary border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded text-sm font-medium ${
                    location.pathname === link.path ? "text-primary-foreground bg-white/15" : "text-primary-foreground/80"
                  }`}
                >{link.label}</Link>
              ))}
              {user && !isAdmin && (
                <>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded text-sm font-medium text-primary-foreground/80">
                    Mes favoris
                  </Link>
                  {isHost && (
                    <Link to="/dashboard?tab=listings" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded text-sm font-medium text-primary-foreground/80">
                      Mes logements
                    </Link>
                  )}
                </>
              )}
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded text-sm font-medium text-primary-foreground">
                  <Shield className="w-4 h-4 inline mr-1" /> Panel Admin
                </Link>
              )}
              <div className="pt-3 flex flex-col gap-2">
                {!isAdmin && (
                  <Link to={isHost ? "/create-listing" : "/become-host"} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="rounded w-full border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-white/10">
                      Ajouter mon logement
                    </Button>
                  </Link>
                )}
                {user ? (
                  <>
                    <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="rounded bg-accent text-accent-foreground w-full hover:bg-accent/90">
                        {isAdmin ? "Panel Admin" : "Mon espace"}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="rounded text-primary-foreground/80" onClick={() => { signOut(); setMobileOpen(false); }}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="rounded w-full border-primary-foreground/30 text-primary-foreground bg-transparent">
                        S'inscrire
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="rounded w-full border-primary-foreground/30 text-primary-foreground bg-transparent">
                        Se connecter
                      </Button>
                    </Link>
                  </div>
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
