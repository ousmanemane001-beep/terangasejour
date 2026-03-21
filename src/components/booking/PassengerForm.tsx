import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, FileText, Globe } from "lucide-react";

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport: string;
  nationality: string;
}

interface PassengerFormProps {
  data: PassengerInfo;
  onChange: (data: PassengerInfo) => void;
}

const NATIONALITIES = [
  "Sénégalaise", "Française", "Américaine", "Canadienne", "Britannique",
  "Allemande", "Espagnole", "Italienne", "Belge", "Suisse",
  "Marocaine", "Tunisienne", "Algérienne", "Ivoirienne", "Malienne",
  "Guinéenne", "Camerounaise", "Gabonaise", "Congolaise", "Autre",
];

export default function PassengerForm({ data, onChange }: PassengerFormProps) {
  const set = (key: keyof PassengerInfo, value: string) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-4 p-4 rounded-xl bg-secondary border border-border">
      <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Informations du voyageur
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Prénom</Label>
          <Input
            placeholder="Prénom"
            className="rounded-xl h-10"
            value={data.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input
            placeholder="Nom"
            className="rounded-xl h-10"
            value={data.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="w-3 h-3" /> Email
        </Label>
        <Input
          type="email"
          placeholder="email@exemple.com"
          className="rounded-xl h-10"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" /> Téléphone
        </Label>
        <Input
          type="tel"
          placeholder="+221 77 000 00 00"
          className="rounded-xl h-10"
          value={data.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" /> Passeport / CNI
          </Label>
          <Input
            placeholder="N° de document"
            className="rounded-xl h-10"
            value={data.passport}
            onChange={(e) => set("passport", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" /> Nationalité
          </Label>
          <Select value={data.nationality} onValueChange={(v) => set("nationality", v)}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITIES.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
