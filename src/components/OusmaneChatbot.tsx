import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Send, Compass, Loader2, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

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

// Parse destination cards from message content
function parseMessageContent(content: string) {
  const parts: Array<{ type: "text"; value: string } | { type: "dest_card"; name: string; category: string; region: string; lat: string; lng: string }> = [];
  
  const regex = /\[DEST_CARD:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "dest_card",
      name: match[1].trim(),
      category: match[2].trim(),
      region: match[3].trim(),
      lat: match[4].trim(),
      lng: match[5].trim(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
}

function DestinationCard({ name, category, region, lat, lng }: { name: string; category: string; region: string; lat: string; lng: string }) {
  const image = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.ville;
  const emoji = CATEGORY_EMOJI[category] || "📍";

  return (
    <Link
      to={`/explore?destination=${encodeURIComponent(name)}&lat=${lat}&lng=${lng}`}
      className="block rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow my-2"
    >
      <img src={image} alt={name} className="w-full h-24 object-cover" loading="lazy" />
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

function MessageContent({ content }: { content: string }) {
  const parts = parseMessageContent(content);

  return (
    <>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <div key={i} className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-0.5 [&>ul]:my-0.5 [&>ol]:my-0.5 [&>p]:text-[13px] [&>ul]:text-[13px]">
            <ReactMarkdown>{part.value}</ReactMarkdown>
          </div>
        ) : (
          <DestinationCard key={i} {...part} />
        )
      )}
    </>
  );
}

export default function OusmaneChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
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
