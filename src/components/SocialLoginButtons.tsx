import { useState } from "react";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

interface SocialLoginButtonsProps {
  variant?: "full" | "icon-only" | "google-only";
}

const SocialLoginButtons = ({ variant = "full" }: SocialLoginButtonsProps) => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleOAuth = async (provider: "google" | "apple") => {
    const setLoading = provider === "google" ? setLoadingGoogle : setLoadingApple;
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(`Erreur de connexion avec ${provider === "google" ? "Google" : "Apple"}`);
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loadingGoogle || loadingApple;

  // Google-only pill button
  if (variant === "google-only") {
    return (
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={isDisabled}
        className="inline-flex items-center justify-center gap-3 h-12 px-6 rounded-full border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
      >
        {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continuer avec Google
      </button>
    );
  }

  // Icon-only squares
  if (variant === "icon-only") {
    return (
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isDisabled}
          className="w-[72px] h-[72px] rounded-[10px] border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          title="Google"
        >
          {loadingGoogle ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <GoogleIcon />}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={isDisabled}
          className="w-[72px] h-[72px] rounded-[10px] border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          title="Apple"
        >
          {loadingApple ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <AppleIcon />}
        </button>
      </div>
    );
  }

  // Full variant (Signup page)
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={isDisabled}
        className="w-full rounded-full h-12 bg-card border border-border text-foreground font-medium hover:bg-muted flex items-center justify-center gap-3 text-sm transition-colors disabled:opacity-50"
      >
        {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continuer avec Google
      </button>
      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={isDisabled}
        className="w-full rounded-full h-12 bg-foreground text-background font-medium hover:opacity-90 flex items-center justify-center gap-3 text-sm transition-colors disabled:opacity-50"
      >
        {loadingApple ? <Loader2 className="w-4 h-4 animate-spin" /> : <AppleIcon />}
        Continuer avec Apple
      </button>
    </div>
  );
};

export default SocialLoginButtons;
