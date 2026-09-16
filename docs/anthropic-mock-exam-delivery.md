# Livraison — banques d’examens blancs Anthropic

## Résultat livré

Les quatre banques de questions des examens blancs Anthropic ont été **remplacées** par 1 275 questions bilingues de type scénario professionnel. Elles sont stockées côté serveur dans `server/data/mockExamQuestions.json` et ne sont pas présentes dans les fichiers statiques du navigateur. Le moteur conserve la sélection aléatoire, le brassage des choix, le minuteur, la session scellée, le score et la revue post-soumission.

| Certification | Code | Questions par session | Durée | Seuil | Banque livrée |
| --- | --- | ---: | ---: | ---: | ---: |
| Claude Certified Architect – Foundations | CCAR-F | 60 | 120 min | 720/1000 | 330 |
| Claude Certified Associate – Foundations | CCAO-F | 60 | 90 min | 720/1000 | 330 |
| Claude Certified Developer – Foundations | CCDV-F | 53 | 105 min | 720/1000 | 300 |
| Claude Certified Architect – Professional | CCAR-P | 63 | 150 min | 720/1000 | 315 |

Le CSV privé fourni contient 51 exemples. Les 43 exemples qui respectent le format quatre options / une seule meilleure réponse ont été conservés avec la provenance `user-provided-mock-sample`. Les huit autres lignes ont été utilisées uniquement comme référence interne de style, car elles ne respectent pas le format standard retenu. Les 1 232 questions complémentaires sont des créations originales, tracées `claude-sonnet-4-6` et `neopolis-original-2026-09-16`.

> Les questions restent des **questions d’entraînement Neopolis**. Elles ne sont pas annoncées comme des questions officielles, réelles ou divulguées d’Anthropic.

## Couverture et sécurité

Chaque question comporte un domaine, sous-domaine, objectif, difficulté, énoncé et options EN/FR, quatre choix distincts, une clé unique, une explication bilingue et une rationale bilingue spécifique par option. Pour CCAR-F, six familles de scénarios comptent six questions chacune ; le moteur continue de sélectionner quatre familles avec trois questions par famille. La prévisualisation apprenant CCAR-F confirme les valeurs publiées 60 questions, 120 minutes, seuil 720/1000 et pondérations 27/18/20/20/15.

Les procédures administratives conservent désormais les rationales et leur provenance lors de la modification d’une question. La mise à jour de configuration conserve également la sélection de scénarios existante lorsque le formulaire administratif ne la modifie pas explicitement.

## Contrôles réalisés

| Contrôle | Résultat |
| --- | --- |
| Audit de la banque et de la source de données | Réussi : la table `certification_exams` ne contient aucune substitution Anthropic ; la banque JSON est donc réellement active. |
| Structure, bilinguisme, quatre choix, clé unique et rationales | Réussi sur les 1 275 questions. |
| Traçabilité Claude Sonnet et étiquetage des exemples fournis | Réussi : 1 232 questions originales Claude Sonnet et 43 exemples utilisateur enrichis avec Claude Sonnet. |
| Contrats ciblés | Réussi : 7 fichiers de tests, 20 tests. |
| Vérification TypeScript | Réussie. |
| Prévisualisation apprenant CCAR-F | Réussie sans lancement de session ; les corrections ne sont pas affichées avant soumission. |
| Définition tRPC publique CCAR-F après publication | Réussie : `CCAR-F`, 60 questions, 120 min, 720/1000, pondérations 27/18/20/20/15, 6 familles disponibles et 4 familles × 3 questions sélectionnées. |
| Suite globale et QA de publication | 257 fichiers / 852 tests réussis ; un seul test antérieur échoue sur un `exerciseId` de checkpoint Architect du cours, hors données de mock exam et non modifié dans ce lot. |

La structure de génération, les paramètres par certification, l’audit réexécutable et l’applicateur atomique restent versionnés dans `scripts/`. Ils verrouillent `claude-sonnet-4-6`, une sortie JSON Schema stricte, la reprise par lots, la déduplication et les contrôles de couverture.

## Références

[1] [Anthropic Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications)

[2] [Claude Certified Architect – Foundations Certification](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
