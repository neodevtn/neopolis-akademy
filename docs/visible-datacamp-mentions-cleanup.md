# Contrôle du retrait des mentions visibles de DataCamp

Le 29 août 2026, l’état précédent a été extrait de la révision `HEAD` puis analysé de manière reproductible. Il contenait 220 mentions dans les métadonnées visibles du catalogue et 911 mentions dans les contenus de 48 cours. Les identifiants, chemins, champs de provenance et autres métadonnées techniques restent volontairement exclus de ce contrôle, car ils ne sont pas rendus à l’apprenant.

Après nettoyage, l’audit de l’arbre de travail relève zéro mention visible dans le catalogue et zéro dans les cours. L’index de recherche a été régénéré à partir de ces données. La QA de publication, incluant validation structurale, tests unitaires, audit d’interactions et matrices desktop/mobile, a réussi en six étapes.

Le contrôle authentifié sur `https://akademy.neodev.click` confirme l’absence de la marque dans les parcours finance, ventes, n8n et Claude. Les quatre fil d’Ariane sont rendus et les ressources ou transcriptions disponibles sont confirmées sur les trois premiers parcours ; le premier écran Claude contrôlé ne déclare pas de média.

Le contrôle manuel qui affichait encore le libellé fournisseur a eu lieu avant la propagation complète des fichiers de cours. Les captures authentifiées de production `visible-datacamp-mentions-screenshots/finance.png` et `visible-datacamp-mentions-screenshots/ventes.png`, créées après propagation, montrent les parcours nettoyés sans marque fournisseur. Les quinze occurrences techniques restant dans le JSON finance sont confinées aux métadonnées d’import `datacampImport` et ne sont pas rendues dans le lecteur ; la sonde parcourt le texte intégral du document pour les quatre parcours contrôlés et n’en détecte aucune occurrence visible.
