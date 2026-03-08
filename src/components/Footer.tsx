import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xs">TS</span>
              </div>
              <span className="font-display text-lg font-bold">TerangaSéjour</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Trouvez votre logement idéal au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Navigation</h4>
            <div className="space-y-2">
              {[{ label: "Accueil", path: "/" }, { label: "Explorer", path: "/explore" }, { label: "Carte", path: "/map" }].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-background/70 hover:text-background transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Entreprise</h4>
            <div className="space-y-2">
              {[{ label: "À propos", path: "/about" }, { label: "Contact", path: "/contact" }].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-background/70 hover:text-background transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Hôtes</h4>
            <div className="space-y-2">
              <Link to="/create-listing" className="block text-sm text-background/70 hover:text-background transition-colors">Publier un logement</Link>
              <Link to="/certification" className="block text-sm text-background/70 hover:text-background transition-colors">Certification</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/50">© 2026 TerangaSéjour. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-xs text-background/50">
            <span>Paiement sécurisé</span>
            <span>•</span>
            <span>Wave · Orange Money · Carte bancaire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
