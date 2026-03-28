import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkAsRead, Notification } from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const typeIcons: Record<string, string> = {
  booking: "🏨",
  new_booking: "🏨",
  booking_confirmed: "✅",
  booking_declined: "❌",
  message: "💬",
  new_message: "💬",
  listing: "🏠",
  listing_approve: "✅",
  listing_reject: "❌",
  listing_suspend: "⚠️",
  listing_modification_requested: "✏️",
  new_listing: "🏠",
  listing_resubmitted: "🔄",
  review: "⭐",
  admin: "🛡️",
  dispute: "🚩",
  default: "🔔",
};

function NotificationItem({ notification, onMarkRead }: { notification: Notification; onMarkRead: (id: string) => void }) {
  const icon = typeIcons[notification.type] || typeIcons.default;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr });

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
        notification.read ? "bg-background opacity-70" : "bg-accent/30"
      }`}
    >
      <span className="text-lg mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.read ? "text-muted-foreground" : "text-foreground font-semibold"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-primary hover:text-primary/80"
          onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
          title="Marquer comme lu"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function NotificationDropdown() {
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useMarkAsRead();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif?.type === "message") {
      await supabase.from("notifications").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } else {
      markAsRead.mutate(id);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const messageIds = unread.filter((n) => n.type === "message").map((n) => n.id);
    const otherIds = unread.filter((n) => n.type !== "message").map((n) => n.id);
    if (messageIds.length > 0) {
      await supabase.from("notifications").delete().in("id", messageIds);
    }
    if (otherIds.length > 0) {
      await supabase.from("notifications").update({ read: true } as any).in("id", otherIds);
    }
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded text-foreground hover:bg-muted">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={handleMarkAllRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
