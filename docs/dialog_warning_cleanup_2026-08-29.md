# Contrôle console frais — dialogue important et parallaxe de l’accueil

**Date :** 29 août 2026  
**Repère de contrôle :** `2026-08-29T02:00:18.000Z`  
**Environnement :** aperçu local Neopolis.

Le dialogue de communication importante a été rendu avec sa description accessible, puis la page d’accueil a été rendue après conversion du parallaxe Framer Motion vers le défilement global. Les entrées de console postérieures au repère ont été recherchées pour les deux avertissements antérieurement constatés.

| Avertissement vérifié | Résultat après rendu frais |
|---|---|
| `Missing Description` du `DialogContent` | Aucune occurrence |
| `container has a non-static position` de Framer Motion | Aucune occurrence |

Le test ciblé du dialogue, le test de pile cookie/dialogue, la régression du parallaxe et la vérification TypeScript ont réussi avant ce contrôle. Les avertissements antérieurs, datés entre 01:26 et 01:38 UTC, restent des entrées historiques précédant les correctifs et ne sont pas présentés comme des erreurs actives.

Un rejeu authentifié de production à **02:09 UTC** apporte la preuve complète : le dialogue inspecté est « Communication importante », son attribut `aria-describedby` vaut `radix-_r_9_`, sa description est présente, et aucune occurrence des deux avertissements n’est remontée par les consoles desktop ou mobile. Le scénario fait également défiler l’accueil avant l’évaluation ; il confirme que la modification du parallaxe Framer Motion ne produit plus l’avertissement de conteneur statique. Le délai Drizzle local observé à 02:01 UTC correspondait à la fermeture du watcher de développement, puis le service a été redémarré ; l’E2E de production qui suit a réussi.
