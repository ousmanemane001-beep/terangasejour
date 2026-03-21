import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  variant?: "inline" | "banner";
}

export default function CountdownTimer({ expiresAt, onExpire, variant = "inline" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }
      setTimeLeft({
        minutes: Math.floor(diff / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-destructive",
        variant === "banner" && "bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"
      )}>
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">Réservation expirée</span>
      </div>
    );
  }

  const urgent = timeLeft.minutes < 5;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "banner") {
    return (
      <div className={cn(
        "flex items-center justify-between rounded-xl px-4 py-3 border",
        urgent
          ? "bg-destructive/5 border-destructive/20 animate-pulse"
          : "bg-amber-500/5 border-amber-500/20"
      )}>
        <div className="flex items-center gap-2">
          <Clock className={cn("w-4 h-4", urgent ? "text-destructive" : "text-amber-600")} />
          <span className={cn("text-sm font-medium", urgent ? "text-destructive" : "text-amber-700")}>
            Prix garanti pendant
          </span>
        </div>
        <div className={cn(
          "font-mono text-lg font-bold tabular-nums",
          urgent ? "text-destructive" : "text-amber-700"
        )}>
          {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
      urgent
        ? "bg-destructive/10 text-destructive"
        : "bg-amber-500/10 text-amber-600"
    )}>
      <Clock className="w-3 h-3" />
      <span className="font-mono tabular-nums">{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </div>
  );
}
