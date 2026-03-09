import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { X, Send, Compass, Loader2, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import ousmaneAvatar from "@/assets/ousmane-avatar.png";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ousmane-chat`;

const CATEGORY_IMAGES: Record<string, string> = {
  plage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop",
  ville: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=400&h=200&fit=crop",
  parc_naturel: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=200&fit=crop",
  site_historique: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=400&h=200&fit=crop",
  lac: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=200&fit=crop",
  ile: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=200&fit=crop",
  aeroport: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=200&fit=crop",
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
};

// Real photos for specific destinations (especially historic sites)
const DESTINATION_PHOTOS: Record<string, string[]> = {
  "île de gorée": [
    "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=200&fit=crop",
  ],
  "gorée": [
    "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=200&fit=crop",
  ],
  "saint-louis": [
    "https://images.unsplash.com/photo-1591019479261-1a103585c559?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1562016600-ece13b8c8b60?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1573818439498-e53050cf0da4?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=400&h=200&fit=crop",
  ],
  "maison des esclaves": [
    "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=200&fit=crop",
  ],
  "pont faidherbe": [
    "https://images.unsplash.com/photo-1591019479261-1a103585c559?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1562016600-ece13b8c8b60?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=400&h=200&fit=crop",
  ],
  "lac rose": [
    "https://images.unsplash.com/photo-1568625502763-2a5ec6a94240?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1597149212519-41513a8c7bf0?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=200&fit=crop",
  ],
  "dakar": [
    "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1590767950092-42b8362368da?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=400&h=200&fit=crop",
  ],
  "saly": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=200&fit=crop",
  ],
};

const CATEGORY_EMOJI: Record<string, string> = {
  plage: "🏖️", ville: "🏙️", parc_naturel: "🌳", site_historique: "🏛️",
  lac: "💧", ile: "🏝️", aeroport: "✈️", restaurant: "🍽️", hotel: "🏨",
};

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Bienvenue ! 👋 Je suis **Ousmane**, votre guide local.\n\nJe connais le Sénégal comme ma poche ! Que cherchez-vous ?",
};

const QUICK_ACTIONS = [
  { label: "⚡ Voyageur pressé", message: "Je suis pressé, trouve-moi un logement rapidement" },
  { label: "🗺️ Carte de voyage", message: "Je veux créer ma carte de voyage personnalisée" },
  { label: "🏖️ Plages", message: "Quelles plages me recommandes-tu ?" },
  { label: "🏠 Logements", message: "Montre-moi des logements" },
  { label: "🌍 Destinations", message: "Quelles sont les meilleures destinations ?" },
  { label: "🏛️ Histoire", message: "Des sites historiques à visiter ?" },
];

type ParsedPart =
  | { type: "text"; value: string }
  | { type: "dest_card"; name: string; category: string; region: string; lat: string; lng: string }
  | { type: "listing_card"; id: string; title: string; price: string; city: string; photo: string }
  | { type: "travel_map"; coords: Array<{ lat: number; lng: number }> };

function parseMessageContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  
  // Combined regex for all card types
  const regex = /\[DEST_CARD:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]|\[LISTING_CARD:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]*)\]|\[TRAVEL_MAP:([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    
    if (match[1]) {
      // DEST_CARD
      parts.push({
        type: "dest_card",
        name: match[1].trim(), category: match[2].trim(), region: match[3].trim(),
        lat: match[4].trim(), lng: match[5].trim(),
      });
    } else if (match[6]) {
      // LISTING_CARD
      parts.push({
        type: "listing_card",
        id: match[6].trim(), title: match[7].trim(), price: match[8].trim(),
        city: match[9].trim(), photo: match[10]?.trim() || "",
      });
    } else if (match[11]) {
      // TRAVEL_MAP
      const coordPairs = match[11].split("|").map(pair => {
        const [lat, lng] = pair.split(",").map(Number);
        return { lat, lng };
      }).filter(c => !isNaN(c.lat) && !isNaN(c.lng));
      parts.push({ type: "travel_map", coords: coordPairs });
    }
    
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
}

function DestinationCard({ name, category, region, lat, lng }: { name: string; category: string; region: string; lat: string; lng: string }) {
  const nameLower = name.toLowerCase();
  const photos = DESTINATION_PHOTOS[nameLower];
  const fallbackImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.ville;
  const emoji = CATEGORY_EMOJI[category] || "📍";
  const hasGallery = photos && photos.length > 1;

  return (
    <Link
      to={`/explore?destination=${encodeURIComponent(name)}&lat=${lat}&lng=${lng}`}
      className="block rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow my-2"
    >
      {hasGallery ? (
        <div className="grid grid-cols-2 gap-0.5">
          <img src={photos[0]} alt={name} className="w-full h-20 object-cover col-span-2" loading="lazy" />
          {photos.slice(1, 4).map((src, i) => (
            <img key={i} src={src} alt={`${name} ${i + 2}`} className="w-full h-16 object-cover" loading="lazy" />
          ))}
        </div>
      ) : (
        <img src={photos?.[0] || fallbackImage} alt={name} className="w-full h-24 object-cover" loading="lazy" />
      )}
      <div className="p-2.5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{emoji} {name}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" /> {region}
          </p>
        </div>
        <div className="shrink-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-0.5">
          Logements <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

function ListingCard({ id, title, price, city, photo }: { id: string; title: string; price: string; city: string; photo: string }) {
  const imgSrc = photo && photo.length > 5 ? photo : "/placeholder.svg";
  const priceNum = parseInt(price.replace(/\D/g, ""), 10);
  const formattedPrice = priceNum ? priceNum.toLocaleString("fr-FR") : price;

  return (
    <Link
      to={`/property/${id}`}
      className="block rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow my-2"
    >
      <img src={imgSrc} alt={title} className="w-full h-28 object-cover" loading="lazy" />
      <div className="p-2.5">
        <p className="text-xs font-bold text-foreground truncate mb-0.5">{title}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mb-1.5">
          <MapPin className="w-2.5 h-2.5" /> {city}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary">{formattedPrice} F/nuit</span>
          <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-0.5">
            Voir <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TravelMapPreview({ coords }: { coords: Array<{ lat: number; lng: number }> }) {
  if (coords.length === 0) return null;
  // Build a static link to the explore-senegal map page with markers
  const center = coords[0];
  return (
    <Link
      to={`/explore-senegal`}
      className="block rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow my-2"
    >
      <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-4 flex items-center justify-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="text-xs font-bold text-foreground">🗺️ Voir l'itinéraire sur la carte</span>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{coords.length} étape{coords.length > 1 ? "s" : ""}</span>
        <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
          Ouvrir <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = parseMessageContent(content);

  return (
    <>
      {parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return (
              <div key={i} className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-0.5 [&>ul]:my-0.5 [&>ol]:my-0.5 [&>p]:text-[13px] [&>ul]:text-[13px]">
                <ReactMarkdown>{part.value}</ReactMarkdown>
              </div>
            );
          case "dest_card":
            return <DestinationCard key={i} {...part} />;
          case "listing_card":
            return <ListingCard key={i} {...part} />;
          case "travel_map":
            return <TravelMapPreview key={i} coords={part.coords} />;
          default:
            return null;
        }
      })}
    </>
  );
}

export default function OusmaneChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextSent, setContextSent] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Detect page context and auto-send contextual message when chat opens
  const getPageContext = useCallback((): string | null => {
    const path = location.pathname;
    const dest = searchParams.get("destination");

    // Explore page with destination
    if (path === "/explore" && dest) {
      return `L'utilisateur consulte les logements près de "${dest}". Recommande-lui 3 logements populaires de cette zone avec [LISTING_CARD]. Sois bref et naturel.`;
    }
    // Discover page
    if (path === "/discover") {
      return `L'utilisateur est sur la page Découvrir le Sénégal. Suggère-lui 3 destinations incontournables avec [DEST_CARD]. Sois bref.`;
    }
    // Map page
    if (path === "/explore-senegal" || path === "/map") {
      return `L'utilisateur explore la carte du Sénégal. Propose-lui des destinations intéressantes avec [DEST_CARD]. Sois bref.`;
    }
    // Property detail page
    if (path.startsWith("/property/")) {
      return `L'utilisateur consulte un logement. Propose-lui des activités et destinations à proximité avec [DEST_CARD]. Sois bref.`;
    }
    return null;
  }, [location.pathname, searchParams]);

  // Auto-send context when opening chat on a relevant page
  useEffect(() => {
    if (!open) return;
    const ctx = getPageContext();
    if (!ctx || ctx === contextSent) return;

    setContextSent(ctx);
    // Send as a system-level context (hidden from UI, sent to AI)
    const contextMsg: Message = { role: "user", content: ctx };
    const history = [contextMsg];

    setIsLoading(true);
    let assistantSoFar = "";

    fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: history }),
    })
      .then(async (resp) => {
        if (!resp.ok || !resp.body) return;
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantSoFar += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && last !== WELCOME_MESSAGE) {
                    return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                  }
                  return [...prev, { role: "assistant", content: assistantSoFar }];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [open, getPageContext, contextSent]);

  // Reset context when navigating to a new page
  useEffect(() => {
    setContextSent(null);
  }, [location.pathname, searchParams.get("destination")]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const history = [...messages.filter(m => m !== WELCOME_MESSAGE), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de connexion");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last !== WELCOME_MESSAGE) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "Une erreur est survenue. Réessayez."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Ouvrir le guide touristique"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden border-2 border-white">
              <img src={ousmaneAvatar} alt="Ousmane" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-md text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            💬 Demandez à Ousmane !
          </div>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg font-bold">
                🧑🏾
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Ousmane</p>
              <p className="text-xs opacity-80">Guide touristique • En ligne</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] mr-1.5 mt-1 shrink-0">
                    🧑🏾
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <MessageContent content={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] mr-1.5 mt-1 shrink-0">
                  🧑🏾
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => sendMessage(a.message)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors border border-border"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez ici..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" variant="ghost" disabled={!input.trim() || isLoading} className="shrink-0 h-8 w-8">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
