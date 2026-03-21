import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Politique de Confidentialité</h1>

      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Données collectées</h2>
          <p>Nous collectons les données suivantes lors de votre utilisation de TerangaSéjour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Informations d'inscription : nom, prénom, email, téléphone</li>
            <li>Données de réservation : dates, nombre de voyageurs, montant</li>
            <li>Données de paiement : méthode de paiement (aucune donnée bancaire n'est stockée)</li>
            <li>Données de navigation : pages visitées, durée de session</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gérer votre compte et vos réservations</li>
            <li>Faciliter la communication entre hôtes et voyageurs</li>
            <li>Améliorer nos services et l'expérience utilisateur</li>
            <li>Assurer la sécurité de la plateforme</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Partage des données</h2>
          <p>Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Les hôtes (informations nécessaires à la réservation)</li>
            <li>Les prestataires de paiement (Wave, Orange Money, etc.)</li>
            <li>Les autorités compétentes en cas d'obligation légale</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Durée de conservation</h2>
          <p>Les données sont conservées pendant la durée de votre compte actif, plus 3 ans après la dernière activité, conformément aux obligations légales.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Vos droits</h2>
          <p>Vous disposez des droits suivants :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit de suppression de votre compte et vos données</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous via la page Contact.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Cookies</h2>
          <p>TerangaSéjour utilise des cookies fonctionnels essentiels au bon fonctionnement de la plateforme (authentification, préférences). Aucun cookie publicitaire n'est utilisé.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.</p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">Dernière mise à jour : Mars 2026</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default PrivacyPolicy;
