# Validation — attribution rétroactive des acquis

## Périmètre vérifié

La reprise a analysé les enregistrements historiques de progression et de réussite d’examen des comptes apprenants actifs. Elle a examiné **61 couples apprenant–cours** et **6 tentatives d’examen réussies**. Les conditions de complétion ont été recalculées côté serveur depuis les leçons réelles de chaque fichier de cours ; aucune réussite n’a été déduite d’un compteur transmis par le navigateur.

## Résultats d’attribution

| Type d’acquis | Attributions créées | E-mails avec PDF envoyés |
|---|---:|---:|
| Badges de compétences | 52 | 52 |
| Certifications | 5 | 5 |
| **Total** | **57** | **57** |

Neuf couples de progression ne satisfaisaient pas encore le nombre requis de leçons et n’ont donc reçu aucun badge. Plusieurs tentatives réussies d’un même apprenant et d’une même certification ne produisent qu’un seul diplôme.

## Contrôles d’intégrité

La reprise a été relancée après attribution : elle a produit **0 nouveau badge** et **0 nouveau diplôme**, ce qui confirme son idempotence et l’absence de nouvel e-mail lors d’une répétition. Un contrôle de base ne trouve aucun groupe dupliqué sur la clé `(apprenant, type, acquis)`. La compilation TypeScript est valide, et la suite locale compte **124 tests** réussis.
