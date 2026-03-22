import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
        POLITIQUE DE REMBOURSEMENT – TERANGASÉJOUR
      </h1>
      <p className="text-xs text-muted-foreground mb-8 text-center">Version : Mars 2026</p>

      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Introduction</h2>
          <p>La présente politique s'applique à toutes les réservations effectuées via la plateforme TerangaSéjour. Elle définit les conditions et procédures applicables aux demandes de remboursement des voyageurs.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Annulation par le voyageur</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Plus de 7 jours avant la date d'arrivée : remboursement de 100% (hors frais de service)</li>
            <li>Entre 7 et 3 jours avant la date d'arrivée : remboursement de 50% (hors frais de service)</li>
            <li>Moins de 3 jours avant ou non-présentation : aucun remboursement</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Annulation par l'hôte</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Remboursement intégral (100%) au voyageur</li>
            <li>Pénalités possibles pour l'hôte (suspension, perte de visibilité)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Réservation non conforme</h2>
          <p>Le voyageur peut demander un remboursement si :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Le logement est manifestement différent de l'annonce</li>
            <li>Le logement est inhabitable ou dangereux</li>
          </ul>
          <p className="mt-3">Le voyageur doit :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contacter immédiatement TerangaSéjour à contact@terangasejour.com</li>
            <li>Fournir des preuves sous 24h suivant l'arrivée</li>
          </ul>
          <p className="mt-3">TerangaSéjour statue sous 5 jours ouvrables.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Cas de force majeure</h2>
          <p>Aucun remboursement en cas de catastrophe naturelle, guerre, pandémie, décisions administratives, etc.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Modalités de remboursement</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Remboursement sur le moyen de paiement utilisé</li>
            <li>Délai : 5 à 14 jours ouvrés</li>
            <li>Les frais de service TerangaSéjour sont non remboursables sauf annulation imputable à l'hôte ou TerangaSéjour</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Réclamations</h2>
          <p>Contact : contact@terangasejour.com</p>
          <p>Objet : Demande de remboursement + numéro de réservation</p>
          <p>Réponse sous 48 heures.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">8. Acceptation de la politique</h2>
          <p>En réservant sur TerangaSéjour, le voyageur et l'hôte acceptent cette politique.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">9. Modification de la politique</h2>
          <p>TerangaSéjour peut modifier la politique à tout moment. Applicable aux nouvelles réservations.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">10. Loi applicable</h2>
          <p>Loi sénégalaise - tribunaux compétents : Dakar.</p>
        </section>

        <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <p>TerangaSéjour</p>
          <p>Service Réclamations & Remboursements</p>
          <p>Email : contact@terangasejour.com</p>
          <p className="pt-2">Dernière mise à jour : Mars 2026</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default RefundPolicy;
