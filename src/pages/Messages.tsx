import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, useSendMessage } from "@/hooks/useConversations";
import { useConversationBookingStatus } from "@/hooks/useConversationBookingStatus";
import { useCreateNotification } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ConversationList from "@/components/messaging/ConversationList";
import ChatArea from "@/components/messaging/ChatArea";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get("conv");
  const [selectedConv, setSelectedConv] = useState<string | null>(initialConvId);

  const { data: conversations, isLoading: convsLoading } = useConversations();
  const { data: messages, isLoading: msgsLoading } = useMessages(selectedConv || undefined);
  const sendMessage = useSendMessage();
  const createNotification = useCreateNotification();

  const selectedConversation = conversations?.find((c) => c.id === selectedConv);

  // Booking status for selected conversation
  const { data: hasConfirmedBooking = false, isLoading: bookingStatusLoading } =
    useConversationBookingStatus(selectedConversation?.listing_id, selectedConversation?.guest_id);

  // Build booking status map for all conversations (for lock icons)
  const convKeys = conversations?.map((c) => `${c.listing_id}|${c.guest_id}`) || [];
  const { data: allBookingStatuses } = useQuery({
    queryKey: ["all-conv-booking-statuses", convKeys.join(",")],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return {};
      const map: Record<string, boolean> = {};
      // Batch: get all confirmed bookings for all listing+guest pairs
      const listingIds = [...new Set(conversations.map((c) => c.listing_id))];
      const { data } = await supabase
        .from("bookings")
        .select("listing_id, guest_id")
        .in("listing_id", listingIds)
        .eq("status", "confirmed");
      const confirmedSet = new Set((data || []).map((b) => `${b.listing_id}|${b.guest_id}`));
      for (const conv of conversations) {
        map[conv.id] = confirmedSet.has(`${conv.listing_id}|${conv.guest_id}`);
      }
      return map;
    },
    enabled: (conversations?.length ?? 0) > 0,
  });

  // Fetch last message for each conversation
  const convIds = conversations?.map((c) => c.id) || [];
  const { data: lastMessagesMap } = useQuery({
    queryKey: ["last-messages", convIds.join(",")],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return {};
      const map: Record<string, { content: string; sender_id: string }> = {};
      // Fetch last message per conversation
      for (const conv of conversations) {
        const { data } = await supabase
          .from("messages")
          .select("content, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          map[conv.id] = { content: data[0].content, sender_id: data[0].sender_id };
        }
      }
      return map;
    },
    enabled: (conversations?.length ?? 0) > 0,
  });

  // Profiles
  const participantIds = conversations
    ?.flatMap((c) => [c.guest_id, c.host_id])
    .filter((id, i, arr) => arr.indexOf(id) === i) || [];

  const { data: profiles } = useQuery({
    queryKey: ["profiles", participantIds],
    queryFn: async () => {
      if (participantIds.length === 0) return {};
      const { data } = await supabase
        .from("safe_profiles" as any)
        .select("id, first_name, last_name")
        .in("id", participantIds);
      const map: Record<string, { first_name: string | null; last_name: string | null }> = {};
      data?.forEach((p: any) => { map[p.id] = p; });
      return map;
    },
    enabled: participantIds.length > 0,
  });

  // Listing titles
  const listingIds = conversations?.map((c) => c.listing_id).filter((id, i, arr) => arr.indexOf(id) === i) || [];
  const { data: listingsMap } = useQuery({
    queryKey: ["listing-titles", listingIds],
    queryFn: async () => {
      if (listingIds.length === 0) return {};
      const { data } = await supabase.from("listings").select("id, title").in("id", listingIds);
      const map: Record<string, string> = {};
      data?.forEach((l) => { map[l.id] = l.title; });
      return map;
    },
    enabled: listingIds.length > 0,
  });

  const getOtherName = (conv: typeof selectedConversation) => {
    if (!conv || !user) return "Utilisateur";
    const otherId = conv.guest_id === user.id ? conv.host_id : conv.guest_id;
    const p = profiles?.[otherId];
    return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Utilisateur" : "Utilisateur";
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
            <ConversationList
              conversations={conversations}
              isLoading={convsLoading}
              selectedId={selectedConv}
              onSelect={setSelectedConv}
              userId={user.id}
              profiles={profiles}
              listingsMap={listingsMap}
              bookingStatusMap={allBookingStatuses || {}}
              lastMessagesMap={lastMessagesMap || {}}
              currentUserId={user.id}
            />
            <ChatArea
              conversation={selectedConversation}
              messages={messages}
              isLoadingMessages={msgsLoading}
              hasConfirmedBooking={hasConfirmedBooking}
              bookingStatusLoading={bookingStatusLoading}
              userId={user.id}
              otherName={getOtherName(selectedConversation)}
              listingTitle={listingsMap?.[selectedConversation?.listing_id || ""] || "Logement"}
              listingId={selectedConversation?.listing_id || ""}
              onSend={async (content) => {
                await sendMessage.mutateAsync({
                  conversationId: selectedConv!,
                  senderId: user.id,
                  content,
                });
                // Send notification to the other participant
                if (selectedConversation) {
                  const recipientId = selectedConversation.guest_id === user.id
                    ? selectedConversation.host_id
                    : selectedConversation.guest_id;
                  const senderName = getOtherName({
                    ...selectedConversation,
                    guest_id: recipientId,
                    host_id: user.id,
                  } as any);
                  await createNotification.mutateAsync({
                    user_id: recipientId,
                    type: "new_message",
                    title: "Nouveau message",
                    message: content.length > 80 ? content.slice(0, 80) + "…" : content,
                    data: { conversation_id: selectedConv },
                  }).catch(() => {}); // Don't block on notification failure
                }
              }}
              isSending={sendMessage.isPending}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
