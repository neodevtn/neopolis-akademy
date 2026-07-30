# Audit Log - Neopolis Akademy

## Landing Page EN - Erreurs de traduction

| Section | Problème | Texte actuel (EN) | Texte attendu |
|---------|----------|-------------------|---------------|
| Widget "Reprendre la lecture" | Non traduit | "Reprendre la lecture" + "Chapitre 3/9" | "Resume reading" + "Chapter 3/9" |
| Statistiques section | Non traduit | "d'emplois exposés à l'automatisation" | "jobs exposed to automation" |
| Statistiques section | Non traduit | "d'emplois déplacés d'ici 2030" | "jobs displaced by 2030" |
| Statistiques section | Non traduit | "des heures de travail automatisées" | "of work hours automated" |
| Statistiques section | Non traduit | "de SaaS menacés par les agents IA" | "of SaaS threatened by AI agents" |
| Statistiques section | Non traduit | "0 Milliards $" | "0 Billion $" |
| CTA rouge | Non traduit | "Ne subissez pas la disruption..." | "Don't suffer the disruption..." |
| Sources | Non traduit | "Sources : WEF Future of Jobs..." | Reste en FR |
| Étapes labels | Non traduit | "ÉTAPE 01/02/03" | "STEP 01/02/03" |
| Phase 2 titre | Non traduit | "Étude & Évaluation" | "Study & Evaluation" |
| Phase 2 contenu | Non traduit | Tout le bloc classification | Should be in EN |
| Cookie banner | Non traduit | "Nous respectons votre vie privée" | "We respect your privacy" |
| Cookie banner | Non traduit | "Refuser" / "Accepter" | "Decline" / "Accept" |
| Footer links | Non traduit | "À propos de Neopolis Dev" | "About Neopolis Dev" |
| Footer | Non traduit | "En savoir plus" | "Learn more" |
| Certification badge | Non traduit | "Certification internationale" | "International Certification" |
| Graphique titre | Non traduit | "Emplois exposés à l'automatisation IA (en millions)" | "Jobs exposed to AI automation (in millions)" |
| Bouton "Postuler maintenant" | Non traduit | "Postuler maintenant" | "Apply now" |
| Déconnexion button | Non traduit | "Déconnexion" | "Logout" |

## Landing Page AR - À tester
## Admin Page
- L'utilisateur connecté dans le navigateur est "Apprenant Démo" (role: user) → accès admin refusé
- L'admin réel est "Achraf Khelil" (role: admin, email: info@neopolis-dev.com)
- Pour tester l'admin, il faut se connecter avec le compte admin

## Résumé des bugs à corriger

### BUG 1: Traductions landing page incomplètes (EN/AR)
Sections non traduites:
- Statistiques: labels, légendes graphique, "Milliards $"
- CTA rouge: "Ne subissez pas la disruption..."
- Widget "Reprendre la lecture" + "Chapitre X/Y"
- Phase 2 Process Commercial: tout le bloc classification
- Cookie banner: titre, description, boutons
- Bouton "Déconnexion"
- Labels "ÉTAPE 01/02/03"
- Footer: "À propos de Neopolis Dev", "En savoir plus"
- "Certification internationale"
- "Postuler maintenant" (CTA bas de page)
- Graphique titre et légendes

### BUG 2: Email d'invitation
- Le code backend est correct (token retourné, lien construit)
- VITE_APP_URL n'est pas défini dans env → utilise fallback "https://akademy.neodev.click"
- Le lien devrait fonctionner si le token est bien passé
- Vérifier que (invitation as any).token ne retourne pas undefined

### BUG 3: Gestion du contenu admin
- Le fichier AdminContentManager.tsx existe et a un router dédié
- Nécessite connexion admin pour tester
- Le router lit des fichiers JSON depuis le filesystem

### BUG 4: Invitation en masse
- Le code backend bulkCreateInvitations existe
- L'onglet Invitations a été ajouté dans AdminDashboard
- Le dialog d'invitation en masse a été ajouté
- Nécessite connexion admin pour vérifier l'affichage
