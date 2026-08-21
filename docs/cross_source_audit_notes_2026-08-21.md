# Notes d’audit croisé — 21 août 2026

## 11. DataCamp — Introduction to Agent Skills

- **Sévérité** : Critical.
- **Source officielle** : DataCamp `introduction-to-agent-skills`.
- **Constat principal** : le rapport croisé signale un écart entre la source et Neopolis sur la navigation profonde et les compteurs affichés.
- **Compteurs relevés dans le rapport** : source `18 exercices, 6 vidéos`; carte catalogue Neopolis `3 chapitres, 0 activités`; page formation Neopolis `0 cours, 3 chapitres, 0 activités, 5 exercices, 6 vidéos`.
- **Écarts critiques listés** :
  - 0 activité navigable exposée alors que la source contient 18 exercices.
  - carte catalogue publiée avec 0 activité malgré la présence d’exercices dans le manifeste.
  - aucun lien d’écran ou chapitre profond détecté depuis la page Neopolis.
- **Fondamentaux rappelés par l’audit** :
  - reconstruire depuis `COURSE_MANIFEST.json` et non depuis les compteurs de carte si ceux-ci divergent ;
  - créer un écran Neopolis standard pour chaque activité source ;
  - conserver le verrouillage séquentiel pour les parcours certifiants ;
  - n’utiliser que les blocs standards et la bibliothèque média ;
  - vérifier indexation recherche, tags de compétences, XP et progression ;
  - ajouter un bloc de préparation d’environnement au début du cours.
- **Preuves visuelles du rapport PDF** :
  - page 2 : capture DataCamp de la fiche cours et du premier écran pédagogique ;
  - page 3 : capture Neopolis montrant la fiche cours avec `0 activité` et absence de capture du premier écran pédagogique ;
  - page 4 : contrôle technique indiquant `buttons=7` côté source sur le premier écran contre `buttons=0` côté Neopolis, et absence de balise vidéo visible sur le premier écran Neopolis.

### Contrôle de production après correctif — 21 août 2026

La route profonde `https://akademy.neodev.click/training/datacamp_introduction_to_agent_skills/introduction_to_agent_skills__01` charge désormais le cours. Le premier écran présente le chapitre « Creating Your First Skill », l’activité « Video: What are skills », le lecteur vidéo local, la commande manuelle de complétion, la transcription et la navigation séquentielle `Écran 1 sur 6`.

La fiche de certification restait temporairement servie par un bundle de production antérieur au correctif pendant le contrôle navigateur. La prévisualisation courante affiche bien les compteurs corrigés : **1 cours, 18 activités et 6 vidéos**. Une vérification de propagation supplémentaire reste requise avant de déclarer le cours conforme.
