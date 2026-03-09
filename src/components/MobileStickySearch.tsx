import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const MobileStickySearch = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Search state
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [activeField, setActiveField] = useState<"dest" | "checkin" | "checkout" | "guests" | null>(null);

  // Show sticky bar after scrolling past 400px
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    if (guestCount > 1) params.set("guests", String(guestCount));
    setModalOpen(false);
    navigate(`/explore?${params.toString()}`);
  };

  const summaryText = [
    destination || "Destination",
    checkIn ? format(checkIn, "dd MMM", { locale: fr }) : "Dates",
    `${guestCount} voyageur${guestCount > 1 ? "s" : ""}`,
  ].join(" · ");

  return (
    <>
      {/* Sticky compact bar */}
      <AnimatePresence>
        {visible && !modalOpen && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden"
          >
            <div className="mx-3 mt-2">
              <button
                onClick={() => { setModalOpen(true); setActiveField(null); }}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2.5 shadow-[var(--shadow-card)]"
              >
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate flex-1 text-left">
                  {summaryText}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen search modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h2 className="font-display font-bold text-foreground text-base">Rechercher</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Destination */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Destination</span>
                </label>
                <Input
                  placeholder="Ville, plage, site…"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Date d'arrivée</span>
                </label>
                <button
                  onClick={() => setActiveField(activeField === "checkin" ? null : "checkin")}
                  className={cn(
                    "w-full h-11 rounded-lg border px-4 text-left text-sm flex items-center",
                    activeField === "checkin" ? "border-primary bg-primary/5" : "border-input bg-background",
                    checkIn ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {checkIn ? format(checkIn, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </button>
                {activeField === "checkin" && (
                  <div className="mt-2 flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={checkIn}
                      onSelect={(d) => { setCheckIn(d); setActiveField("checkout"); if (checkOut && d && d >= checkOut) setCheckOut(undefined); }}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </div>
                )}
              </div>

              {/* Check-out */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Date de départ</span>
                </label>
                <button
                  onClick={() => setActiveField(activeField === "checkout" ? null : "checkout")}
                  className={cn(
                    "w-full h-11 rounded-lg border px-4 text-left text-sm flex items-center",
                    activeField === "checkout" ? "border-primary bg-primary/5" : "border-input bg-background",
                    checkOut ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {checkOut ? format(checkOut, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </button>
                {activeField === "checkout" && (
                  <div className="mt-2 flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={checkOut}
                      onSelect={(d) => { setCheckOut(d); setActiveField(null); }}
                      disabled={(date) => date < (checkIn || new Date())}
                      className="pointer-events-auto"
                    />
                  </div>
                )}
              </div>

              {/* Guests */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Voyageurs</span>
                </label>
                <div className="flex items-center justify-between h-11 rounded-lg border border-input bg-background px-4">
                  <button
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  >-</button>
                  <span className="font-semibold text-foreground text-lg">{guestCount}</span>
                  <button
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                    onClick={() => setGuestCount(Math.min(12, guestCount + 1))}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="shrink-0 px-4 py-3 border-t border-border" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
              <Button
                onClick={handleSearch}
                className="w-full h-12 rounded-full font-semibold text-base gap-2"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileStickySearch;
