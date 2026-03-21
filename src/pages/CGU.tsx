import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CGU = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Conditions Générales d'Utilisation</h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme TerangaSéjour, accessible à l'adresse terangasejour.lovable.app. En accédant à la plateforme, vous acceptez les présentes CGU sans réserve.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Services proposés</h2>
          <p>TerangaSéjour est une plateforme de mise en relation entre des hôtes proposant des logements au Sénégal et des voyageurs souhaitant réserver ces logements. La plateforme facilite la recherche, la réservation et le paiement de séjours.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Inscription</h2>
          <p>L'inscription est gratuite et nécessite une adresse email valide. L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. Chaque utilisateur ne peut disposer que d'un seul compte.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Réservations</h2>
          <p>Les réservations sont soumises à la disponibilité des logements et à l'approbation de l'hôte (selon le mode de réservation choisi). Une réservation n'est confirmée qu'après paiement intégral. Des frais de service de 15% sont appliqués sur chaque réservation.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Annulations</h2>
          <p>Les conditions d'annulation sont définies par chaque hôte et peuvent être flexibles, modérées ou strictes. Les détails sont affichés sur chaque annonce avant la réservation.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Flexible :</strong> Annulation gratuite jusqu'à 24h avant l'arrivée.</li>
            <li><strong>Modérée :</strong> Annulation gratuite jusqu'à 5 jours avant l'arrivée. 50% remboursé après.</li>
            <li><strong>Stricte :</strong> Annulation gratuite dans les 48h suivant la réservation. Aucun remboursement après.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Responsabilités</h2>
          <p>TerangaSéjour agit en qualité d'intermédiaire. La plateforme n'est pas responsable de la qualité des logements, des prestations des hôtes, ni des dommages survenant pendant le séjour. Chaque hôte est responsable de la conformité et de la sécurité de son logement.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Paiements</h2>
          <p>Les paiements sont sécurisés et effectués via Wave, Orange Money, Free Money, PayDunya ou carte bancaire. Les fonds sont transférés à l'hôte après le check-in du voyageur.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">8. Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de la plateforme (textes, images, logos, design) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">9. Contact</h2>
          <p>Pour toute question relative aux présentes CGU, contactez-nous via la page Contact de la plateforme.</p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">Dernière mise à jour : Mars 2026</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default CGU;
