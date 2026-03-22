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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t("auth.fillAllFields")); return; }
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? t("auth.invalidCredentials")
          : error.message === "Email not confirmed" ? t("auth.confirmEmail")
          : error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        toast.success(t("auth.loginSuccess"));
        setTimeout(() => { navigate("/", { replace: true }); }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex justify-center py-10 md:py-20 px-5 w-full">
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
              {t("auth.loginTitle")}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-8 mx-auto max-w-[500px] w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder={t("auth.email")}
                className="h-12 rounded-lg border-border bg-background text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.password")}
                  className="h-12 rounded-lg border-border bg-background text-sm pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm border-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.loginBtn")}
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {t("auth.orContinueWith")}
              </p>
            </div>

            <SocialLoginButtons variant="icon-only" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">{t("nav.signupCreate")}</Link>
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

export default Login;
