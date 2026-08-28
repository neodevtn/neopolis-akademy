# Contrôle de production — AI for Marketing

Après propagation du checkpoint `c86d8258`, la sonde de métriques sur `https://akademy.neodev.click` confirme **27 activités**, **17 exercices interactifs**, **10 vidéos** et **3 téléchargements** sur la carte catalogue et la fiche de formation.

Les activités 2.8 et 2.13 restent absentes conformément au manifeste : elles nécessitaient Copilot et des jeux de données externes non déclarés. Le contrôle de métriques a été corrigé pour compter également le bloc standard `multi_choice_exercise`.

Le tri 1.6 a également été rejoué avec une session apprenant sur le domaine publié. Le placement par clic, le verrou avant soumission, l’activation du bouton, le feedback, le déverrouillage de la suite et l’accessibilité sont confirmés.

Un TP rubricé est aussi confirmé sur le domaine publié : 12 blocs d’évaluation IA sont détectés, le feedback est visible après tentative en Markdown, la réponse complète est rendue, les commandes d’administration restent masquées et la contribution de compétence est affichée.

Un contrôle de rendu public du premier Projector a également confirmé le bloc vidéo, la commande de lecture, le deck de **12 diapositives**, la transcription locale et le flux vidéo servi via `/api/assets/`. La sonde apprenant dédiée a d’abord expiré avec un délai de 10 secondes pendant le démarrage public ; son attente de rendu a été portée à 30 secondes avant rejeu, sans modification du lecteur.

Après préparation séquentielle des unités 1 et 2 du compte QA apprenant, la matrice Projector a ensuite contrôlé les **10 leçons Projector sur le domaine public**. Chacune rend le bloc vidéo, le flux local, les commandes du deck de slides et l’action de lecture ; aucune référence DataCamp ou Copilot n’est visible dans ces blocs. Les unités suivantes sont restées verrouillées avant la préparation, conformément au parcours séquentiel.
