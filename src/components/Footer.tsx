import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <span className="font-display font-bold text-accent-foreground text-xs">VS</span>
              </div>
              <span className="font-display text-lg font-bold">VotreSéjour</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Trouvez votre chez-vous, partout au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Navigation</h4>
            <div className="space-y-2">
              {[
                { label: "Accueil", path: "/" },
                { label: "Explorer", path: "/explore" },
                { label: "Carte", path: "/map" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Entreprise</h4>
            <div className="space-y-2">
              {[
                { label: "À propos", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Hôtes</h4>
            <div className="space-y-2">
              <Link to="/publish" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Publier un logement
              </Link>
              <Link to="/certification" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Certification
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50">
            © 2026 Séjour. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
