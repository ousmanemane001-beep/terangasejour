import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageCircle, Lock, Shield } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { containsBlockedContent } from "@/lib/contentFilter";
import PredefinedMessages, { GUEST_PREDEFINED, HOST_PREDEFINED } from "./PredefinedMessages";
import AvailabilityAutoCheck from "./AvailabilityAutoCheck";
import type { Conversation, Message } from "@/hooks/useConversations";

interface Props {
  conversation: Conversation | undefined;
  messages: Message[] | undefined;
  isLoadingMessages: boolean;
  hasConfirmedBooking: boolean;
  bookingStatusLoading: boolean;
  userId: string;
  otherName: string;
  listingTitle: string;
  listingId: string;
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";
}

export default function ChatArea({
  conversation, messages, isLoadingMessages, hasConfirmedBooking, bookingStatusLoading,
  userId, otherName, listingTitle, listingId, onSend, isSending,
}: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [filterError, setFilterError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = conversation ? conversation.host_id === userId : false;
  const isGuest = conversation ? conversation.guest_id === userId : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content?: string) => {
    const text = (content || newMessage).trim();
    if (!text) return;

    // Content filter applies even for free chat
    const check = containsBlockedContent(text);
    if (check.blocked) {
      setFilterError(check.reason);
      toast.error(check.reason);
      return;
    }
    setFilterError("");

    await onSend(text);
    if (!content) setNewMessage("");
    toast.success("Message envoyé ✓");
  };

  if (!conversation) {
    return (
      <Card className="border-none shadow-[var(--shadow-card)] md:col-span-2 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Sélectionnez une conversation</p>
          </div>
        </div>
      </Card>
    );
  }

  // Detect if last message is an availability question to show auto-check
  const lastMsg = messages?.[messages.length - 1];
  const showAvailabilityCheck = lastMsg?.content?.includes("disponible") && isHost;

  return (
    <Card className="border-none shadow-[var(--shadow-card)] md:col-span-2 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(otherName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">{otherName}</p>
            <p className="text-xs text-muted-foreground truncate">{listingTitle}</p>
          </div>
          {hasConfirmedBooking ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" /> Chat libre
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Avant réservation
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoadingMessages ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[75%] p-3 rounded-2xl text-sm",
                msg.sender_id === userId
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              <p>{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-1",
                msg.sender_id === userId ? "text-primary-foreground/60" : "text-muted-foreground"
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

      {/* Availability auto-check */}
      {showAvailabilityCheck && (
        <div className="px-4 pb-2">
          <AvailabilityAutoCheck listingId={listingId} />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border">
        {bookingStatusLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : hasConfirmedBooking ? (
          /* Free chat after confirmed booking */
          <div className="p-4">
            {filterError && (
              <p className="text-xs text-destructive mb-2">{filterError}</p>
            )}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); setFilterError(""); }}
                placeholder="Écrire un message…"
                className="rounded-full"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!newMessage.trim() || isSending}
                className="rounded-full bg-primary text-primary-foreground shrink-0"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Predefined messages before booking */
          <PredefinedMessages
            messages={isHost ? HOST_PREDEFINED : GUEST_PREDEFINED}
            onSelect={(text) => handleSend(text)}
            disabled={isSending}
            label={
              isHost
                ? "Répondez avec un message prédéfini :"
                : "Choisissez un message à envoyer :"
            }
          />
        )}
      </div>
    </Card>
  );
}
