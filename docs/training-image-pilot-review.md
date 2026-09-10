# Revue visuelle — pilote image de formation

## Formation pilote

**Claude Certified Associate – Fondations**.

## Visuels générés avec le logo officiel

| Fichier | Format réel | Contrôle visuel |
| --- | --- | --- |
| `claude-certified-associate-foundations-social-official.png` | 2560 × 1440, 16:9 | Logo officiel reconnaissable et centré ; titre, positionnement de préparation, badges Débutant, FR/EN, 8 cours, 69 activités et 46 exercices lisibles ; illustration pédagogique cohérente. |
| `claude-certified-associate-foundations-card-official.png` | 2176 × 1632, 4:3 | Logo officiel reconnaissable et centré ; titre, positionnement de préparation, badges Débutant, FR/EN et 69 activités lisibles ; illustration adaptée à une carte de catalogue. |

Les deux images ne montrent aucun logo partenaire et ne prétendent pas que Neopolis Akademy délivre la certification. Elles restent en attente de validation utilisateur avant toute intégration au catalogue ou aux métadonnées sociales.

## Contrôle d’intégration locale

Le premier rendu de la fiche publique a révélé que l’URL relative de bibliothèque média ne se chargeait pas sur le serveur de développement. La carte affichée utilise donc le proxy applicatif `/api/assets/`, qui sert le même fichier avec un type MIME et un cache explicites ; l’image sociale conserve son URL de bibliothèque pour les crawlers sociaux. L’intégration ne sera pas publiée tant que l’asset ne sera pas visible dans la carte et l’en-tête.
