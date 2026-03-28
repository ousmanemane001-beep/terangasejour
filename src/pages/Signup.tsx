import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(t("auth.enterEmail")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("auth.invalidEmail"));
      return;
    }
    setStep("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error(t("auth.enterPassword")); return; }
    if (password.length < 6) { toast.error(t("auth.passwordMin")); return; }
    if (password !== confirmPassword) { toast.error(t("auth.passwordMismatch")); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);

    if (error) { 
      toast.error(error.message); 
    } else { 
      toast.success("Un email de confirmation a été envoyé. Vérifiez votre boîte de réception pour activer votre compte.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex justify-center py-10 md:py-16 px-5 w-full">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[500px] w-full py-10"
      >
        <div className="flex flex-col gap-8">
          <div className="flex justify-center">
            <Link to="/">
              <span className="font-display text-3xl font-bold text-primary">TerangaSéjour</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t("auth.signupTitle")}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("auth.signupSubtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-8 mx-auto max-w-[500px] w-full">
            {step === "email" ? (
              <>
                <div className="flex justify-center md:justify-between gap-4 flex-wrap w-full items-center">
                  <SocialLoginButtons variant="google-only" />
                  <Link to="/login" className="text-sm font-medium text-foreground hover:underline">
                    {t("auth.loginBtn")}
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {t("auth.orContinueWith")}
                  </p>
                </div>

                <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    className="h-12 rounded-lg border-border bg-background text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm border-0"
                  >
                    {t("auth.continue")}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm text-primary hover:underline self-start flex items-center gap-1"
                >
                  ← {t("common.back")}
                </button>

                <div className="flex flex-col gap-2 text-center -mt-4">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {t("auth.password")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {email}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      className="h-12 rounded-lg border-border bg-background text-sm pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.confirmPassword")}
                    className="h-12 rounded-lg border-border bg-background text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm border-0"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.signupBtn")}
                  </Button>
                </form>
              </>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.hasAccount")}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">{t("auth.loginBtn")}</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
