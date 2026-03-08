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
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-xs">TS</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground">TerangaSéjour</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-primary font-semibold"
                  : "text-foreground hover:text-primary"
              }`}
            >{link.label}</Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {!isAdmin && (
            <Link to={isHost ? "/create-listing" : "/become-host"}>
              <Button variant="outline" size="sm" className="rounded-full text-sm border-foreground/20 hover:bg-muted">Publier mon logement</Button>
            </Link>
          )}
          {user ? (
            <>
              {unreadCount > 0 && (
                <Link to={dashboardPath} className="relative">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full">{unreadCount}</Badge>
                  </Button>
                </Link>
              )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${isAdmin ? "bg-destructive" : "bg-foreground"} text-background text-xs font-bold`}>{initials}</AvatarFallback>
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
            <Link to="/login">
              <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm">Connexion</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
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
                    location.pathname === link.path ? "text-primary bg-muted" : "text-foreground"
                  }`}
                >{link.label}</Link>
              ))}
              {user && !isAdmin && (
                <>
                  <Link to="/favorites" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground">
                    Mes favoris
                  </Link>
                  {isHost && (
                    <Link to="/dashboard?tab=listings" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground">
                      Mes logements
                    </Link>
                  )}
                </>
              )}
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary">
                  <Shield className="w-4 h-4 inline mr-1" /> Panel Admin
                </Link>
              )}
              <div className="pt-3 flex flex-col gap-2">
                {!isAdmin && (
                  <Link to={isHost ? "/create-listing" : "/become-host"} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="rounded-full w-full">Publier mon logement</Button>
                  </Link>
                )}
                {user ? (
                  <>
                    <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="rounded-full bg-foreground text-background w-full">
                        {isAdmin ? "Panel Admin" : "Mon espace"}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => { signOut(); setMobileOpen(false); }}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="rounded-full bg-foreground text-background w-full">Connexion</Button>
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
