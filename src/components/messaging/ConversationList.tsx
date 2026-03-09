import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/useConversations";

interface Props {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  userId: string;
  profiles: Record<string, { first_name: string | null; last_name: string | null }> | undefined;
  listingsMap: Record<string, string> | undefined;
  bookingStatusMap: Record<string, boolean>;
}

function getOtherName(
  conv: Conversation,
  userId: string,
  profiles: Props["profiles"]
) {
  const otherId = conv.guest_id === userId ? conv.host_id : conv.guest_id;
  const p = profiles?.[otherId];
  return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Utilisateur" : "Utilisateur";
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";
}

export default function ConversationList({
  conversations, isLoading, selectedId, onSelect, userId, profiles, listingsMap, bookingStatusMap,
}: Props) {
  return (
    <Card className="border-none shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground text-sm">Conversations</h2>
      </div>
      <div className="overflow-y-auto h-full">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv) => {
            const otherName = getOtherName(conv, userId, profiles);
            const hasBooking = bookingStatusMap[conv.id] ?? false;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-border hover:bg-muted transition-colors flex items-center gap-3",
                  selectedId === conv.id && "bg-primary/5"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(otherName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground text-sm truncate">{otherName}</p>
                    {hasBooking ? (
                      <Unlock className="w-3 h-3 text-green-600 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
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
  );
}
