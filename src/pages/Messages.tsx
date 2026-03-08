import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, useSendMessage } from "@/hooks/useConversations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get("conv");
  const [selectedConv, setSelectedConv] = useState<string | null>(initialConvId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useConversations();
  const { data: messages, isLoading: msgsLoading } = useMessages(selectedConv || undefined);
  const sendMessage = useSendMessage();

  // Get profiles for conversation participants
  const participantIds = conversations
    ?.flatMap((c) => [c.guest_id, c.host_id])
    .filter((id, i, arr) => arr.indexOf(id) === i) || [];
  
  const { data: profiles } = useQuery({
    queryKey: ["profiles", participantIds],
    queryFn: async () => {
      if (participantIds.length === 0) return {};
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", participantIds);
      const map: Record<string, { first_name: string | null; last_name: string | null }> = {};
      data?.forEach((p) => { map[p.id] = p; });
      return map;
    },
    enabled: participantIds.length > 0,
  });

  // Get listing titles
  const listingIds = conversations?.map((c) => c.listing_id).filter((id, i, arr) => arr.indexOf(id) === i) || [];
  const { data: listingsMap } = useQuery({
    queryKey: ["listing-titles", listingIds],
    queryFn: async () => {
      if (listingIds.length === 0) return {};
      const { data } = await supabase
        .from("listings")
        .select("id, title")
        .in("id", listingIds);
      const map: Record<string, string> = {};
      data?.forEach((l) => { map[l.id] = l.title; });
      return map;
    },
    enabled: listingIds.length > 0,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    await sendMessage.mutateAsync({
      conversationId: selectedConv,
      senderId: user.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const getOtherName = (conv: typeof conversations extends (infer T)[] | undefined ? T : never) => {
    if (!conv || !user) return "Utilisateur";
    const otherId = conv.guest_id === user.id ? conv.host_id : conv.guest_id;
    const p = profiles?.[otherId];
    return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Utilisateur" : "Utilisateur";
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-secondary">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">Connectez-vous</h1>
            <p className="text-muted-foreground mb-6">Accédez à vos messages.</p>
            <Link to="/login"><Button className="rounded-full bg-primary text-primary-foreground">Se connecter</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Messages</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)] min-h-[500px]">
            {/* Conversation list */}
            <Card className="border-none shadow-[var(--shadow-card)] overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-display font-semibold text-foreground text-sm">Conversations</h2>
              </div>
              <div className="overflow-y-auto h-full">
                {convsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const otherName = getOtherName(conv);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv.id)}
                        className={cn(
                          "w-full text-left p-4 border-b border-border hover:bg-muted transition-colors flex items-center gap-3",
                          selectedConv === conv.id && "bg-primary/5"
                        )}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(otherName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{otherName}</p>
                          <p className="text-xs text-muted-foreground truncate">{listingsMap?.[conv.listing_id] || "Logement"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(conv.updated_at), "d MMM", { locale: fr })}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Aucune conversation</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Messages area */}
            <Card className="border-none shadow-[var(--shadow-card)] md:col-span-2 flex flex-col overflow-hidden">
              {selectedConv ? (
                <>
                  <div className="p-4 border-b border-border">
                    {(() => {
                      const conv = conversations?.find((c) => c.id === selectedConv);
                      return conv ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(getOtherName(conv))}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">{getOtherName(conv)}</p>
                            <p className="text-xs text-muted-foreground">{listingsMap?.[conv.listing_id] || ""}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {msgsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "max-w-[75%] p-3 rounded-2xl text-sm",
                            msg.sender_id === user.id
                              ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          <p>{msg.content}</p>
                          <p className={cn(
                            "text-[10px] mt-1",
                            msg.sender_id === user.id ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-8">Commencez la conversation !</p>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrire un message..."
                      className="rounded-full"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sendMessage.isPending}
                      className="rounded-full bg-primary text-primary-foreground shrink-0"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
