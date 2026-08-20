# Validation Agentic Browsing — Google PageSpeed

Après publication de la version `08ff3ce4`, les deux domaines `neopacademy-6qa7lvjq.manus.space` et `akademy.neodev.click` servent `/llms.txt` en `text/plain; charset=UTF-8`. Le fichier contient le titre Markdown `# Neopolis Akademy` ainsi que plusieurs liens HTTPS canoniques, ce qui corrige les deux règles signalées par l’audit Google Agentic Browsing.

La page PageSpeed a été relancée en profil mobile. La récupération du rendu par le navigateur connecté a ensuite expiré côté extension ; la conformité du fichier réellement distribué a cependant été confirmée directement par requête HTTP sur les deux domaines.

Un nouveau rapport PageSpeed ordinateur a été déclenché le 20 août 2026 à 23:01:46. L’interface Google a retourné « Saisissez une URL valide » malgré l’URL HTTPS préremplie ; elle n’a donc pas fourni le détail Agentic Browsing exploitable dans cette session. Cette anomalie d’interface Google ne remet pas en cause les deux critères techniques désormais satisfaits par le fichier publié : H1 Markdown et liens HTTPS.
