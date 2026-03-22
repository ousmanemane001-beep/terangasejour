import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { t } = useTranslation();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setTimeout(() => {
      toast.success(t("footer.subscribeSuccess"));
      setEmail("");
      setSubscribing(false);
    }, 800);
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 pb-8 border-b border-primary-foreground/10">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-display font-bold text-lg mb-2">{t("footer.stayInformed")}</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">{t("footer.newsletterDesc")}</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.yourEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-lg flex-1"
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg gap-1.5 shrink-0"
              >
                <Mail className="w-4 h-4" />
                {t("footer.subscribe")}
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="font-display text-lg font-bold mb-4 block">TerangaSéjour</span>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">{t("footer.navigation")}</h4>
            <div className="space-y-2">
              {[
                { label: t("nav.home"), path: "/" },
                { label: t("nav.explore"), path: "/explore" },
                { label: t("nav.map"), path: "/explore-senegal" },
                { label: t("nav.discover"), path: "/discover" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">{t("footer.company")}</h4>
            <div className="space-y-2">
              {[
                { label: t("nav.about"), path: "/about" },
                { label: t("nav.contact"), path: "/contact" },
                { label: t("footer.certification"), path: "/certification" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">{t("footer.hosts")}</h4>
            <div className="space-y-2">
              <Link to="/become-host" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t("footer.becomeHost")}</Link>
              <Link to="/create-listing" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t("footer.publishListing")}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">© 2026 TerangaSéjour. {t("footer.allRights")}</p>
          <div className="flex items-center gap-3 text-xs text-primary-foreground/50 flex-wrap justify-center">
            <Link to="/cgu" className="hover:text-primary-foreground transition-colors">{t("footer.cgu")}</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors">{t("footer.privacy")}</Link>
            <span>·</span>
            <Link to="/refund-policy" className="hover:text-primary-foreground transition-colors">{t("footer.refundPolicy")}</Link>
            <span>·</span>
            <span>Wave · Orange Money · Carte bancaire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
