import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen" style={{ background: "var(--wise-canvas)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(250, 248, 243, 0.92)", borderBottom: "1px solid var(--wise-rule)" }}>
        <div className="container flex items-center gap-4 py-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--wise-ink)" }}>
              <ArrowLeft size={16} />
              Retour à l'accueil
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 md:py-16 max-w-[800px]">
        <h1 className="wise-display-md mb-8">Mentions Légales</h1>

        {/* Éditeur */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">1. Informations légales</h2>
          <div className="wise-card-sage p-6 space-y-3">
            <p className="wise-body-md"><strong>Éditeur du site :</strong> Neopolis Development</p>
            <p className="wise-body-md"><strong>Site officiel :</strong> <a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--wise-positive-deep)" }}>www.neopolis-dev.com</a></p>
            <p className="wise-body-md"><strong>Email :</strong> <a href="mailto:info@neopolis-dev.com" className="underline" style={{ color: "var(--wise-positive-deep)" }}>info@neopolis-dev.com</a></p>
            <p className="wise-body-md"><strong>Statut :</strong> Registered Partner du Claude Partner Network (Anthropic)</p>
            <p className="wise-body-md"><strong>Directeur de la publication :</strong> Achraf Khelil</p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">2. Hébergement</h2>
          <div className="wise-card-sage p-6 space-y-3">
            <p className="wise-body-md">Le site akademy.neodev.click est hébergé par Manus (manus.im).</p>
            <p className="wise-body-md">L'infrastructure technique est gérée par Neopolis Development.</p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">3. Propriété intellectuelle</h2>
          <p className="wise-body-md mb-3">
            L'ensemble du contenu du site (textes, images, graphismes, logo, icônes, etc.) est la propriété exclusive de Neopolis Development ou de ses partenaires, et est protégé par les lois relatives à la propriété intellectuelle.
          </p>
          <p className="wise-body-md mb-3">
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Neopolis Development.
          </p>
          <p className="wise-body-md">
            Les marques "Claude", "Anthropic" et "Claude Certified Architect" sont la propriété d'Anthropic, PBC. Leur utilisation sur ce site est faite dans le cadre du programme Claude Partner Network.
          </p>
        </section>

        {/* CGU */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">4. Conditions Générales d'Utilisation</h2>
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>4.1 Objet</h3>
          <p className="wise-body-md mb-4">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site akademy.neodev.click, plateforme de recrutement et de formation pour le programme "AI Solutions Partner" opéré par Neopolis Development.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>4.2 Accès au site</h3>
          <p className="wise-body-md mb-4">
            L'accès au site est gratuit. Les frais d'accès à internet et d'équipement nécessaires à la connexion restent à la charge de l'utilisateur. Neopolis Development se réserve le droit de modifier, suspendre ou interrompre l'accès au site à tout moment, sans préavis.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>4.3 Programme de formation</h3>
          <p className="wise-body-md mb-4">
            Le programme de formation certifiante est gratuit pour les candidats sélectionnés. La sélection est effectuée sur la base d'un scoring automatisé prenant en compte les compétences techniques, l'expertise métier et les capacités de communication du candidat. Neopolis Development se réserve le droit de modifier les critères de sélection à tout moment.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>4.4 Statut d'Ambassadeur</h3>
          <p className="wise-body-md mb-4">
            Le statut "AI Solutions Partner - Ambassadeur Certifié" est un titre interne à Neopolis Development. Il ne constitue pas un titre officiel du Claude Partner Network d'Anthropic. Les ambassadeurs exercent en tant qu'entrepreneurs indépendants et ne sont pas salariés de Neopolis Development.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>4.5 Rémunération</h3>
          <p className="wise-body-md">
            La rémunération des ambassadeurs (20% à 60% des frais de setup et 10% des tokens consommés) est indicative et peut varier selon les projets, le niveau d'implication et les accords spécifiques conclus entre les parties. Les conditions exactes sont définies dans un contrat individuel signé entre l'ambassadeur et Neopolis Development.
          </p>
        </section>

        {/* Politique de confidentialité */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">5. Politique de Confidentialité</h2>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>5.1 Données collectées</h3>
          <p className="wise-body-md mb-3">
            Dans le cadre du processus de candidature, nous collectons les données suivantes :
          </p>
          <ul className="list-disc list-inside wise-body-md mb-4 space-y-1" style={{ color: "var(--wise-ink-soft)" }}>
            <li>Nom, prénom, email</li>
            <li>Numéro de téléphone</li>
            <li>Parcours professionnel et compétences</li>
            <li>Secteur d'activité et expérience</li>
            <li>Motivations et objectifs</li>
          </ul>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>5.2 Finalité du traitement</h3>
          <p className="wise-body-md mb-4">
            Les données collectées sont utilisées exclusivement pour : évaluer les candidatures, communiquer avec les candidats, gérer le programme de formation, et assurer le suivi des ambassadeurs certifiés. Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>5.3 Durée de conservation</h3>
          <p className="wise-body-md mb-4">
            Les données des candidats non retenus sont conservées pendant 12 mois maximum après la clôture du programme. Les données des ambassadeurs actifs sont conservées pendant toute la durée de leur collaboration avec Neopolis Development, puis 3 ans après la fin de celle-ci.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>5.4 Droits des utilisateurs</h3>
          <p className="wise-body-md mb-4">
            Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez des droits suivants : droit d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité et d'opposition. Pour exercer ces droits, contactez-nous à : <a href="mailto:info@neopolis-dev.com" className="underline" style={{ color: "var(--wise-positive-deep)" }}>info@neopolis-dev.com</a>.
          </p>

          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--wise-ink)" }}>5.5 Cookies</h3>
          <p className="wise-body-md">
            Le site utilise des cookies techniques nécessaires au fonctionnement de l'application (authentification, session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé. Des cookies d'analyse anonymisés peuvent être utilisés pour améliorer l'expérience utilisateur.
          </p>
        </section>

        {/* Limitation de responsabilité */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">6. Limitation de responsabilité</h2>
          <p className="wise-body-md mb-3">
            Neopolis Development s'efforce de fournir des informations aussi précises que possible sur le site. Toutefois, elle ne pourra être tenue responsable des omissions, inexactitudes ou carences dans la mise à jour de ces informations.
          </p>
          <p className="wise-body-md">
            Les projections de revenus présentées dans le simulateur et les exemples de projets sont fournis à titre indicatif uniquement et ne constituent en aucun cas une garantie de revenus. Les résultats réels dépendent de nombreux facteurs incluant l'implication de l'ambassadeur, les conditions du marché et la nature des projets.
          </p>
        </section>

        {/* Droit applicable */}
        <section className="mb-10">
          <h2 className="wise-display-xs mb-4">7. Droit applicable</h2>
          <p className="wise-body-md">
            Les présentes mentions légales sont soumises au droit applicable dans le pays d'établissement de Neopolis Development. Tout litige relatif à l'utilisation du site sera soumis à la juridiction compétente.
          </p>
        </section>

        {/* Date de mise à jour */}
        <div className="pt-6" style={{ borderTop: "1px solid var(--wise-rule)" }}>
          <p className="wise-body-sm" style={{ color: "var(--wise-mute)" }}>
            Dernière mise à jour : 19 juillet 2026
          </p>
        </div>
      </main>
    </div>
  );
}
