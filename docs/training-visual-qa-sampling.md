# Contrôle par échantillonnage des visuels de formation

## Échantillons contrôlés le 10 septembre 2026

| Fichier | Domaine | Constat |
| --- | --- | --- |
| `ai-for-finance-card.png` | Finance | Logo officiel Neopolis Akademy visible ; illustration de reporting financier cohérente ; attributs de niveau, langues, cours, activités et exercices cohérents ; aucune provenance partenaire apparente. |
| `introduction-workflow-automation-card.png` | Automatisation | Logo officiel Neopolis Akademy visible ; illustration de workflow spécifique ; attributs pédagogiques visibles ; aucune mention DataCamp, n8n ou autre provenance partenaire apparente. |
| `scalable-agentic-systems-card.png` | Systèmes agentiques | Logo officiel Neopolis Akademy visible ; représentation multi-agents, cloud et exploitation cohérente avec le sujet ; aucun partenaire apparent. |
| `scalable-agentic-systems-social.png` | Systèmes agentiques, source locale | Composition sociale dédiée sans partenaire apparent. Le fichier source local observé est en 2560×1440 ; la conformité de l’asset social réellement référencé en production doit être vérifiée contre le registre généré, qui déclare 1200×630. |

Les deux cartes observées sont au format 4:3 et ne présentent pas de promesse de certification externe.

## Contrôle navigateur local

| Surface | Constat |
| --- | --- |
| `/formations-ia` | La page publique est stable et conserve la charte Neopolis. |
| `/formations-ia/catalogue/claude-certified-associate-fondations` | L’en-tête rend la carte dédiée Claude en 4:3, avec le logo Neopolis officiel et les attributs de préparation cohérents. |
| `/admin/content?mode=catalog` | L’éditeur catalogue charge la liste complète de certifications ; les champs de visuels sont ajoutés dans les attributs de chaque certification, avec accès à la bibliothèque média et réinitialisation vers le comportement par défaut. |

## Vérification de l’asset Open Graph publié

L’URL du registre `datacamp_building_scalable_agentic_systems-social_566b1145.png` répond en HTTP 200 après la redirection de stockage et le fichier téléchargé est un PNG de **1200 × 630**. Les métadonnées du registre et le binaire publié respectent donc le contrat Open Graph, indépendamment du fichier de conception local en 2560 × 1440.
