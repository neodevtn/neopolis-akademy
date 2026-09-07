# Conception — contrôle d’intégrité pédagogique unique

**Date :** 7 septembre 2026  
**Objet :** prévention proportionnée de l’automatisation abusive des parcours, checkpoints et examens.

## Décision de conception

Le dispositif proposé est un **Learning Integrity Gate** unique, exécuté côté serveur avant toute opération à enjeu : validation d’activité, attribution de points de compétences, complétion de leçon, évaluation libre et démarrage ou soumission d’examen. Le lecteur reste consultable pendant une revue ; seuls les effets évaluatifs et la progression sont temporairement suspendus lorsqu’un risque important est établi.

Les signaux existants sont conservés : série de validations très rapprochées, incompatibilité entre temps d’apprentissage et validations, soumissions identiques répétées et progression sans trace vidéo. Ils demeurent des indicateurs de comportement, jamais une preuve d’utilisation d’IA.

| Décision du gate | Seuil | Effet | Garantie de proportionnalité |
|---|---:|---|---|
| Autoriser | inférieur à 35 | L’action pédagogique est enregistrée normalement. | Aucun obstacle pour une activité ordinaire. |
| Vérification requise | 35 à 59 | Une vérification de présence est requise avant une action évaluative ou un examen. | La progression déjà acquise reste intacte et le contrôle est court. |
| Suspension temporaire | 60 ou plus, ou décision administrative active | Les validations et examens sont suspendus ; la lecture reste possible. | Pas de désactivation de compte automatique ; une revue humaine peut lever ou confirmer la mesure. |

## Vérification de présence recommandée

La vérification adaptative s’appuie sur **Cloudflare Turnstile Managed**, déclenchée uniquement par le gate. Le jeton est validé côté serveur avec les contrôles d’hôte et d’action. Il expire rapidement, est à usage unique et ne contient ni réponses, ni contenu de cours. La documentation Cloudflare recommande précisément la validation serveur, l’action attendue, l’hôte attendu, la limitation de débit et des messages sans détails internes.[1]

Cette vérification réduit les automatisations de navigateur sans afficher inutilement un CAPTCHA à l’ensemble des apprenants. Elle ne constitue pas, à elle seule, une preuve absolue d’humanité : elle s’ajoute aux signaux serveur et à la revue humaine. Ce modèle est cohérent avec la gestion du risque plutôt qu’avec une inférence opaque ou une sanction immédiate.[2]

## Éléments explicitement exclus

Neopolis Akademy n’ajoutera ni instructions cachées, ni faux énoncés, ni contenu trompeur. Ces pratiques sont incompatibles avec une expérience accessible et pourraient pénaliser les utilisateurs légitimes. La prévention repose sur des contrôles visibles, documentés, server-side et réversibles.

## Traçabilité et confidentialité

Chaque décision du gate doit être inscrite dans le journal pédagogique avec le type de décision et les identifiants de signaux, sans stocker de texte de réponse, de contenu d’examen, d’empreinte invasive ou de secret de vérification. L’administrateur peut consulter le score, les signaux et la décision, puis lever ou confirmer une suspension. Le blocage définitif du compte reste une décision humaine distincte.

## Références

[1]: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ "Cloudflare Turnstile — Server-side validation"
[2]: https://owasp.org/www-project-automated-threats-to-web-applications/ "OWASP Automated Threats to Web Applications"
