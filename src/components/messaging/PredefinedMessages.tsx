import { Button } from "@/components/ui/button";
import { CalendarDays, Home, Clock, HelpCircle, MessageCircle, CheckCircle, XCircle } from "lucide-react";

export const GUEST_PREDEFINED = [
  { id: "availability", icon: CalendarDays, text: "Ce logement est-il disponible pour ces dates ?" },
  { id: "book", icon: Home, text: "Je souhaite réserver ce logement." },
  { id: "late_arrival", icon: Clock, text: "Est-ce que l'arrivée tardive est possible ?" },
  { id: "info", icon: HelpCircle, text: "J'ai une question sur le logement." },
  { id: "amenities", icon: Home, text: "Quels équipements sont disponibles ?" },
];

export const HOST_PREDEFINED = [
  { id: "available", icon: CheckCircle, text: "Oui, le logement est disponible pour ces dates." },
  { id: "unavailable", icon: XCircle, text: "Désolé, le logement n'est pas disponible pour ces dates." },
  { id: "late_ok", icon: Clock, text: "Oui, l'arrivée tardive est possible." },
  { id: "late_no", icon: Clock, text: "L'arrivée tardive n'est malheureusement pas possible." },
  { id: "book_invite", icon: Home, text: "Vous pouvez réserver directement via la plateforme." },
  { id: "more_info", icon: MessageCircle, text: "N'hésitez pas à consulter la fiche du logement pour plus de détails." },
];

interface PredefinedMessagesProps {
  messages: typeof GUEST_PREDEFINED;
  onSelect: (text: string) => void;
  disabled?: boolean;
  label: string;
}

export default function PredefinedMessages({ messages, onSelect, disabled, label }: PredefinedMessagesProps) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="grid gap-2">
        {messages.map((msg) => (
          <Button
            key={msg.id}
            variant="outline"
            className="justify-start gap-2.5 h-auto py-3 px-4 text-left text-sm whitespace-normal rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
            onClick={() => onSelect(msg.text)}
            disabled={disabled}
          >
            <msg.icon className="w-4 h-4 shrink-0 text-primary" />
            <span>{msg.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
