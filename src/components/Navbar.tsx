import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Heart, Home, CalendarDays, MessageCircle, Shield, MapPin, PlusCircle, LogIn, ClipboardList, Search, Map as MapIcon, Info, Headphones, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import NotificationDropdown from "@/components/NotificationDropdown";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isHost, isAdmin, profile, signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const initials = profile
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : user?.user_metadata
    ? `${(user.user_metadata.first_name || "")[0] || ""}${(user.user_metadata.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : "U";

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Explorer", path: "/explore" },
    { label: "Découvrir", path: "/discover" },
    { label: "Carte", path: "/explore-senegal" },
    { label: "À propos", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const roleLabel = isAdmin ? "Super Admin" : isHost ? "Hôte" : "Voyageur";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  const close = () => setMobileOpen(false);

  // Mobile menu items with icons — Booking.com style
  const mobileMenuItems = [
    { label: "Accueil", path: "/", icon: Home },
    { label: "Explorer", path: "/explore", icon: Search },
    { label: "Carte", path: "/explore-senegal", icon: MapIcon },
    { label: "À propos", path: "/about", icon: Info },
    { label: "Contact", path: "/contact", icon: Headphones },
    ...(user ? [{ label: "Publier un logement", path: isHost ? "/create-listing" : "/become-host", icon: PlusCircle }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">

          {/* Mobile: Hamburger + Logo left */}
          <div className="md:hidden flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link to="/" className="flex items-center shrink-0">
              <span className="font-display text-lg font-bold text-primary">TerangaSéjour</span>
            </Link>
          </div>

          {/* Desktop: Logo left */}
          <Link to="/" className="hidden md:flex items-center gap-2 shrink-0">
            <span className="font-display text-lg font-bold text-primary">TerangaSéjour</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >{link.label}</Link>
            ))}
          </div>

          {/* Mobile: right icons (notification, heart, user) */}
          <div className="md:hidden flex items-center gap-1">
            <Link to="/discover">
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-foreground" />
              </button>
            </Link>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors" title="Langue">
              <Globe className="w-5 h-5 text-foreground" />
            </button>
            {user ? (
              <Link to="/profile">
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                  <Avatar className="h-7 w-7">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </Link>
            )}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            {user && !isAdmin && (
              <Link to={isHost ? "/create-listing" : "/become-host"}>
                <Button variant="outline" size="sm" className="rounded text-sm border-primary text-primary bg-transparent hover:bg-primary/10">
                  Ajouter mon logement
                </Button>
              </Link>
            )}
            {user ? (
              <>
                <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded text-foreground hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                      <AvatarFallback className={`${isAdmin ? "bg-destructive text-white" : "bg-primary text-primary-foreground"} text-xs font-bold`}>{initials}</AvatarFallback>
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
                  <Button variant="outline" size="sm" className="rounded text-sm border-primary text-primary bg-transparent hover:bg-primary/10">
                    S'inscrire
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="rounded text-sm border-primary text-primary bg-transparent hover:bg-primary/10">
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile slide-in panel — Booking.com style */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-background z-[70] md:hidden flex flex-col shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-display text-lg font-bold text-foreground">TerangaSéjour</span>
                <button onClick={close} className="p-1 rounded-full hover:bg-muted transition-colors" aria-label="Fermer">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* User info if logged in */}
              {user && (
                <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>
                </div>
              )}

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto py-2">
                {mobileMenuItems.map((item) => (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    onClick={close}
                    className={`flex items-center gap-4 px-5 py-[14px] text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="my-2 mx-5 border-t border-border" />

                {user ? (
                  <>
                    <Link to="/favorites" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <Heart className="w-5 h-5 shrink-0" /> Mes favoris
                    </Link>
                    <Link to="/messages" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <MessageCircle className="w-5 h-5 shrink-0" /> Messages
                    </Link>
                    <Link to="/dashboard/my-bookings" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <CalendarDays className="w-5 h-5 shrink-0" /> Mes voyages
                    </Link>
                    {isHost && (
                      <Link to="/dashboard/bookings" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                        <ClipboardList className="w-5 h-5 shrink-0" /> Réservations
                      </Link>
                    )}
                    <Link to="/profile" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <User className="w-5 h-5 shrink-0" /> Mon profil
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-primary hover:bg-muted">
                        <Shield className="w-5 h-5 shrink-0" /> Panel Admin
                      </Link>
                    )}

                    <div className="my-2 mx-5 border-t border-border" />

                    <button
                      onClick={() => { signOut(); close(); }}
                      className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-destructive hover:bg-muted w-full text-left"
                    >
                      <LogOut className="w-5 h-5 shrink-0" /> Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <LogIn className="w-5 h-5 shrink-0" /> Connexion
                    </Link>
                    <Link to="/signup" onClick={close} className="flex items-center gap-4 px-5 py-[14px] text-sm font-medium text-foreground hover:bg-muted">
                      <User className="w-5 h-5 shrink-0" /> Créer un compte
                    </Link>
                  </>
                )}
              </div>

              {/* CTA bottom */}
              {user && !isAdmin && (
                <div className="px-5 py-4 border-t border-border">
                  <Link to={isHost ? "/create-listing" : "/become-host"} onClick={close}>
                    <Button className="w-full rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Publier mon logement
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
