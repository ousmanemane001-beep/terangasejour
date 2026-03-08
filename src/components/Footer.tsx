import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="font-display text-lg font-bold mb-4 block">TerangaSéjour</span>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Trouvez votre logement idéal au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Navigation</h4>
            <div className="space-y-2">
              {[{ label: "Accueil", path: "/" }, { label: "Explorer", path: "/explore" }, { label: "Carte", path: "/map" }].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Entreprise</h4>
            <div className="space-y-2">
              {[{ label: "À propos", path: "/about" }, { label: "Contact", path: "/contact" }].map((link) => (
                <Link key={link.path} to={link.path} className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Hôtes</h4>
            <div className="space-y-2">
              <Link to="/create-listing" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Publier un logement</Link>
              <Link to="/certification" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Certification</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">© 2026 TerangaSéjour. Tous droits réservés.</p>
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-primary-foreground/50 flex-wrap justify-center">
            <span>Paiement sécurisé</span>
            <span>·</span>
            <span>Wave · Orange Money · Carte bancaire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
