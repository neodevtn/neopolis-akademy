# Contrôle E2E — Communication importante et consentement

**Date :** 29 août 2026  
**Environnement :** lecteur local Neopolis, session apprenant QA  
**Portée :** coexistence d’un communiqué important à accusé obligatoire et d’une absence de consentement aux cookies.

Le contrôle a temporairement remis en attente l’accusé du seul compte QA puis a restauré son horodatage d’origine après le test. Aucun compte apprenant réel, communiqué, destinataire ou contenu n’a été modifié.

| Vue contrôlée | Dialogue | Bannière cookies | Accusé visible | CTA visible | Actions dans le viewport | CTA au premier plan |
|---|---|---|---|---|---|---|
| Desktop 1280 × 720 | Oui | Oui | Oui | Oui | Oui | Oui |
| Mobile 390 × 844 | Oui | Oui | Oui | Oui | Oui | Oui |

La bannière de consentement utilise désormais une pile `z-40`, sous la boîte de dialogue standard à `z-50`. La boîte réserve une zone défilante au corps du communiqué et conserve l’accusé ainsi que le bouton de confirmation dans des zones non rétractables. Les contrôles statiques et TypeScript sont réussis ; le scénario E2E est consigné dans `important_communication_overlay_qa_2026-08-29.json`.

La priorité d’usage est volontaire : lorsque le dialogue de communication importante est ouvert, les deux boutons cookies restent rendus mais sont sous sa couche modale et ne peuvent pas être sélectionnés. L’apprenant accuse d’abord réception du communiqué ; une fois ce dialogue fermé, la bannière de consentement retrouve son interaction normale. L’E2E confirme cette priorité sur desktop et mobile, sans soumettre ni modifier l’accusé final du compte QA.

La sonde E2E a ensuite déclenché l’initialisation différée de Sentry et détecté son déclencheur de signalement dans les deux viewports. Elle mesure son rectangle par rapport à la case d’accusé et au bouton « Confirmer la réception » : aucune intersection n’a été trouvée sur desktop ni sur mobile. Les captures `important-communication-overlay-desktop.png` et `important-communication-overlay-mobile.png`, générées avec le dialogue important ouvert, accompagnent le rapport JSON actualisé. Aucune correction du widget tiers n’est nécessaire.
