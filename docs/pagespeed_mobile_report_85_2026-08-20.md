# Référence PageSpeed mobile — 20 août 2026

Le rapport fourni par l’utilisateur provient de Google PageSpeed Insights pour `https://akademy.neodev.click/`, avec le profil mobile. Le score de performance communiqué est de **85**.

Les diagnostics Lighthouse embarqués dans le rapport confirment les priorités suivantes : **1 100 ms** de gain estimé sur les requêtes bloquant le rendu (CSS de l’application et feuille Google Fonts), **83 KiB** de JavaScript inutilisé sur le bundle initial, **170 KiB** de gain de cache possible pour les assets `api/assets`, **31 KiB** de gain de livraison d’images et une tâche longue du bundle initial. Des logos étaient aussi signalés sans dimensions explicites.

Les cibles identifiées sont le bundle `/assets/index-DkZa1Unf.js`, la feuille `/assets/index-s1MgR_FB.css`, la feuille Google Fonts, les logos Neopolis et Anthropic, ainsi que les illustrations de l’accueil. Les corrections s’orientent donc vers le cache immuable des assets versionnés, le chargement non bloquant des polices non critiques et des dimensions fixes sur les logos, sans supprimer de contenu.

Source : fichier local `/home/ubuntu/upload/PageSpeedInsights.html`, sauvegarde du rapport Google PageSpeed Insights indiquant l’URL `https://pagespeed.web.dev/analysis/https-akademy-neodev-click/r7zvjdkcln?form_factor=mobile`.
