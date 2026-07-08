# Design Reference - Stripe-inspired for Neopolis Akademy

## Adaptation: Stripe Design System → Neopolis Akademy

### Couleurs adaptées (Neopolis brand: navy + rouge)
- Primary (CTA): #e94560 (rouge Neopolis) → remplace indigo Stripe
- Ink (texte): #0a1628 (navy profond Neopolis) → remplace ink Stripe
- Ink Secondary: #1a2d4a
- Ink Mute: #64748d (identique Stripe)
- Canvas: #ffffff
- Canvas Soft: #f6f9fc
- Hairline: #e3e8ee
- Gradient mesh: cream/rose/bleu-navy (adaptation Neopolis)

### Typography (Inter comme substitut open-source de Sohne)
- Display XXL: Inter 56px, weight 300, line-height 1.03, letter-spacing -1.4px
- Display XL: Inter 48px, weight 300, line-height 1.15, letter-spacing -0.96px
- Display LG: Inter 32px, weight 300, line-height 1.1, letter-spacing -0.64px
- Display MD: Inter 26px, weight 300, line-height 1.12, letter-spacing -0.26px
- Body LG: Inter 16px, weight 300, line-height 1.4
- Body MD: Inter 15px, weight 300, line-height 1.4
- Button: Inter 16px, weight 400

### Composants clés
- Boutons: pill-shaped (border-radius: 9999px), padding 8px 16px
- Cards: border-radius 12px, padding 32px, bg white, border hairline
- Inputs: border-radius 6px, padding 8px 12px
- Tags: pill, bg subdued, text primary-deep

### Layout
- Spacing: 2/4/8/12/16/24/32/64px
- Gradient mesh hero: bande supérieure 1/3 de la page
- Sections alternent white / canvas-soft / canvas-cream
- Max-width conteneur: ~1200px

### Principes clés
- Poids fin (300) pour les titres = signature éditoriale
- Tracking négatif sur les display = signature typographique
- Un seul CTA rempli par section
- Gradient mesh en backdrop du hero
- Cards sur fond blanc avec ombres subtiles
- Pas de bordures lourdes, hairlines uniquement
