# Validation — badges de compétences et diplômes

## Attributions fondées sur des réussites réelles

Un **badge de compétence** est émis lorsque toutes les leçons réelles d’un cours sont enregistrées comme terminées. Le nombre de leçons est relu depuis le JSON canonique du cours côté serveur, et non fourni par le navigateur. Une **certification** est émise uniquement après l’enregistrement d’une tentative d’examen réussie. Chaque attribution est idempotente grâce à une clé unique par apprenant, type et acquis : la répétition d’une requête ne crée ni badge, ni e-mail, ni diplôme supplémentaire.

## Parcours apprenant

Lorsqu’un nouvel acquis est créé, un écran global de félicitations s’ouvre avec l’intitulé, la référence vérifiable et le lien de téléchargement. La page de certification conserve la galerie des badges et diplômes concernés. Le PDF officiel est protégé : seul son détenteur authentifié peut le télécharger via son identifiant d’acquis.

## E-mail et diplôme

L’e-mail de réussite reprend les couleurs Neopolis, joint le PDF et marque l’acquis comme notifié uniquement après envoi réussi. Le diplôme est généré en A4 paysage, utilise le logo Neopolis Development disponible à l’URL publique de l’actif, intègre la date, le nom de l’apprenant et une référence vérifiable. Le test visuel du PDF confirme l’intégration du logo et la lisibilité de la mise en page.

## Contrôles

La table `learner_achievements` est appliquée et vide de données de démonstration. La compilation TypeScript est valide, **124 tests** locaux réussissent et le validateur de cours retourne 0 erreur. Les 223 avertissements de QCM proches préexistants restent non bloquants.
