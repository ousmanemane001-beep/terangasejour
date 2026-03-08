import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const VerifiedBadge = ({ className, size = "sm" }: VerifiedBadgeProps) => {
  return (
    <Badge className={`bg-primary/10 text-primary gap-1 border-none ${size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5"} ${className}`}>
      <ShieldCheck className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
      Vérifié
    </Badge>
  );
};

export default VerifiedBadge;
