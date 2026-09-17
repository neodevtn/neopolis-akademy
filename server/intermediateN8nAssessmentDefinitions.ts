/**
 * Regenerated from source-verified, Claude Sonnet-reformulated n8n guides.
 * This server-only registry intentionally contains assessment terms and post-submission corrections only.
 */
export const VERIFIED_N8N_PRACTICAL_ASSESSMENTS = {
  "dc_1_act_04_tp": {
    "id": "dc_1_act_04_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Le payload final contient des champs de premier niveau compréhensibles. ; Respond to Webhook renvoie le payload nettoyé..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Le payload final contient des champs de premier niveau compréhensibles.",
        "terms": [
          "Edit Fields",
          "notation par points"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Respond to Webhook renvoie le payload nettoyé.",
        "terms": [
          "notation par points",
          "Respond to Webhook"
        ]
      }
    ]
  },
  "dc_1_act_06_tp": {
    "id": "dc_1_act_06_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Workflow B est activé. ; HTTP Request envoie un POST contenant une commande à Workflow B..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Workflow B est activé.",
        "terms": [
          "Workflow B",
          "HTTP Request"
        ]
      },
      {
        "id": "criterion_2",
        "label": "HTTP Request envoie un POST contenant une commande à Workflow B.",
        "terms": [
          "HTTP Request",
          "POST"
        ]
      }
    ]
  },
  "dc_1_act_07_tp": {
    "id": "dc_1_act_07_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : If sépare les réponses réussies et en erreur. ; Chaque branche produit un résumé explicite avec Edit Fields..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "If sépare les réponses réussies et en erreur.",
        "terms": [
          "If",
          "Edit Fields"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Chaque branche produit un résumé explicite avec Edit Fields.",
        "terms": [
          "Edit Fields",
          "statut de réponse"
        ]
      }
    ]
  },
  "dc_1_act_09_tp": {
    "id": "dc_1_act_09_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Schedule Trigger est réglé sur une cadence de 30 minutes. ; If laisse passer uniquement les exécutions pendant les heures ouvrées..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Schedule Trigger est réglé sur une cadence de 30 minutes.",
        "terms": [
          "Schedule Trigger",
          "30 minutes"
        ]
      },
      {
        "id": "criterion_2",
        "label": "If laisse passer uniquement les exécutions pendant les heures ouvrées.",
        "terms": [
          "30 minutes",
          "If"
        ]
      }
    ]
  },
  "dc_1_act_10_tp": {
    "id": "dc_1_act_10_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Edit Fields construit un payload de commande. ; HTTP Request réalise un POST vers Workflow B après le déclenchement planifié..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Edit Fields construit un payload de commande.",
        "terms": [
          "Edit Fields",
          "HTTP Request"
        ]
      },
      {
        "id": "criterion_2",
        "label": "HTTP Request réalise un POST vers Workflow B après le déclenchement planifié.",
        "terms": [
          "HTTP Request",
          "POST"
        ]
      }
    ]
  },
  "dc_2_act_02_tp": {
    "id": "dc_2_act_02_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : HTTP Request récupère les données météo de Stockholm. ; Edit Fields expose plusieurs champs JSON au premier niveau..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "HTTP Request récupère les données météo de Stockholm.",
        "terms": [
          "Manual Trigger",
          "HTTP Request"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Edit Fields expose plusieurs champs JSON au premier niveau.",
        "terms": [
          "HTTP Request",
          "Stockholm"
        ]
      }
    ]
  },
  "dc_2_act_03_tp": {
    "id": "dc_2_act_03_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : HTTP Request cible Berlin avec format et lang dans Query Parameters. ; Edit Fields contient une description localisée en plus des champs aplatis..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "HTTP Request cible Berlin avec format et lang dans Query Parameters.",
        "terms": [
          "HTTP Request",
          "Berlin"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Edit Fields contient une description localisée en plus des champs aplatis.",
        "terms": [
          "Berlin",
          "Query Parameters"
        ]
      }
    ]
  },
  "dc_2_act_05_tp": {
    "id": "dc_2_act_05_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : La sortie du nœud Code est consultée après exécution. ; Le lien entre les données Stockholm épinglées et les champs plats est expliqué..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "La sortie du nœud Code est consultée après exécution.",
        "terms": [
          "Code",
          "Stockholm"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Le lien entre les données Stockholm épinglées et les champs plats est expliqué.",
        "terms": [
          "Stockholm",
          "données épinglées"
        ]
      }
    ]
  },
  "dc_2_act_06_tp": {
    "id": "dc_2_act_06_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Python Code ajoute un marquage aux lignes. ; Is Valid? envoie les bonnes lignes vers True et les lignes défectueuses vers False..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Python Code ajoute un marquage aux lignes.",
        "terms": [
          "Python Code",
          "Is Valid?"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Is Valid? envoie les bonnes lignes vers True et les lignes défectueuses vers False.",
        "terms": [
          "Is Valid?",
          "True"
        ]
      }
    ]
  },
  "dc_2_act_07_tp": {
    "id": "dc_2_act_07_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Python Code teste que l’humidité est numérique. ; Is Valid? montre les lignes qui échouent avec la règle renforcée..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Python Code teste que l’humidité est numérique.",
        "terms": [
          "Python Code",
          "humidité"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Is Valid? montre les lignes qui échouent avec la règle renforcée.",
        "terms": [
          "humidité",
          "numérique"
        ]
      }
    ]
  },
  "dc_2_act_09_tp": {
    "id": "dc_2_act_09_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Une Data Table reçoit des lignes par insert. ; Get row(s) relit les lignes et If agit sur ce résultat..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Une Data Table reçoit des lignes par insert.",
        "terms": [
          "Data Table",
          "insert"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Get row(s) relit les lignes et If agit sur ce résultat.",
        "terms": [
          "insert",
          "Get row(s)"
        ]
      }
    ]
  },
  "dc_2_act_10_tp": {
    "id": "dc_2_act_10_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Data Table Get row(s) est placé avant insert. ; Code ne transmet à l’écriture que les paires ville-date nouvelles..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Data Table Get row(s) est placé avant insert.",
        "terms": [
          "Data Table Get row(s)",
          "insert"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Code ne transmet à l’écriture que les paires ville-date nouvelles.",
        "terms": [
          "insert",
          "Code"
        ]
      }
    ]
  },
  "dc_3_act_02_tp": {
    "id": "dc_3_act_02_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Chaque ligne possède un indicateur processed et un batch_label. ; La boucle traite tous les lots sans s’arrêter au premier..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Chaque ligne possède un indicateur processed et un batch_label.",
        "terms": [
          "Loop Over Items",
          "batches"
        ]
      },
      {
        "id": "criterion_2",
        "label": "La boucle traite tous les lots sans s’arrêter au premier.",
        "terms": [
          "batches",
          "Edit Fields"
        ]
      }
    ]
  },
  "dc_3_act_03_tp": {
    "id": "dc_3_act_03_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Wait se trouve sur le chemin loop-back. ; Une pause intervient avant le lancement du lot suivant..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Wait se trouve sur le chemin loop-back.",
        "terms": [
          "Wait",
          "Loop Over Items"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Une pause intervient avant le lancement du lot suivant.",
        "terms": [
          "Loop Over Items",
          "batch"
        ]
      }
    ]
  },
  "dc_3_act_05_tp": {
    "id": "dc_3_act_05_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Split Out génère une ligne par élément de items. ; Les lignes conservent les informations de leur commande parente..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Split Out génère une ligne par élément de items.",
        "terms": [
          "Split Out",
          "items"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Les lignes conservent les informations de leur commande parente.",
        "terms": [
          "items",
          "commandes"
        ]
      }
    ]
  },
  "dc_3_act_06_tp": {
    "id": "dc_3_act_06_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Summarize regroupe les lignes par catégorie. ; La sortie présente un prix moyen et une quantité totale par groupe..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Summarize regroupe les lignes par catégorie.",
        "terms": [
          "Summarize",
          "prix moyen"
        ]
      },
      {
        "id": "criterion_2",
        "label": "La sortie présente un prix moyen et une quantité totale par groupe.",
        "terms": [
          "prix moyen",
          "quantité totale"
        ]
      }
    ]
  },
  "dc_3_act_07_tp": {
    "id": "dc_3_act_07_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Chaque article aplati possède line_total. ; Aggregate rassemble les articles enrichis..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Chaque article aplati possède line_total.",
        "terms": [
          "Split Out",
          "Edit Fields"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Aggregate rassemble les articles enrichis.",
        "terms": [
          "Edit Fields",
          "line_total"
        ]
      }
    ]
  },
  "dc_3_act_09_tp": {
    "id": "dc_3_act_09_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Les deux branches de If appellent Execute Sub-workflow. ; Un seul sous-workflow partagé remplace la duplication de traitement..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Les deux branches de If appellent Execute Sub-workflow.",
        "terms": [
          "Execute Sub-workflow",
          "If"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Un seul sous-workflow partagé remplace la duplication de traitement.",
        "terms": [
          "If",
          "sub-workflow"
        ]
      }
    ]
  },
  "dc_3_act_10_tp": {
    "id": "dc_3_act_10_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : If répartit les commandes entre deux chemins. ; Chaque chemin utilise Execute Sub-workflow vers le calculateur adapté..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "If répartit les commandes entre deux chemins.",
        "terms": [
          "Manual Trigger",
          "If"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Chaque chemin utilise Execute Sub-workflow vers le calculateur adapté.",
        "terms": [
          "If",
          "Execute Sub-workflow"
        ]
      }
    ]
  },
  "dc_4_act_02_tp": {
    "id": "dc_4_act_02_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Les lignes sans order_id sont arrêtées. ; Les lignes dont amount vaut zéro n’atteignent pas Process Order..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Les lignes sans order_id sont arrêtées.",
        "terms": [
          "If",
          "order_id"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Les lignes dont amount vaut zéro n’atteignent pas Process Order.",
        "terms": [
          "order_id",
          "amount"
        ]
      }
    ]
  },
  "dc_4_act_03_tp": {
    "id": "dc_4_act_03_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Error Trigger alimente un enregistrement dans error_log. ; Une erreur du workflow fragile crée une ligne dans la Data Table..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Error Trigger alimente un enregistrement dans error_log.",
        "terms": [
          "Error Trigger",
          "Edit Fields"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Une erreur du workflow fragile crée une ligne dans la Data Table.",
        "terms": [
          "Edit Fields",
          "Data Table"
        ]
      }
    ]
  },
  "dc_4_act_04_tp": {
    "id": "dc_4_act_04_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : HTTP Request poursuit l’exécution malgré la réponse 500. ; Edit Fields produit une information d’échec sur le chemin d’erreur..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "HTTP Request poursuit l’exécution malgré la réponse 500.",
        "terms": [
          "HTTP Request",
          "Continue Using Error Output"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Edit Fields produit une information d’échec sur le chemin d’erreur.",
        "terms": [
          "Continue Using Error Output",
          "Edit Fields"
        ]
      }
    ]
  },
  "dc_4_act_06_tp": {
    "id": "dc_4_act_06_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : execution_log contient trois lignes de contrôle. ; Get row(s) permet de consulter les trois checkpoints..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "execution_log contient trois lignes de contrôle.",
        "terms": [
          "Data Table",
          "execution_log"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Get row(s) permet de consulter les trois checkpoints.",
        "terms": [
          "execution_log",
          "HTTP Request"
        ]
      }
    ]
  },
  "dc_4_act_07_tp": {
    "id": "dc_4_act_07_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Evaluate Output calcule des totaux et des problèmes. ; If sépare pass des résultats non conformes avec un résumé sur chaque branche..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Evaluate Output calcule des totaux et des problèmes.",
        "terms": [
          "Code",
          "Evaluate Output"
        ]
      },
      {
        "id": "criterion_2",
        "label": "If sépare pass des résultats non conformes avec un résumé sur chaque branche.",
        "terms": [
          "Evaluate Output",
          "If"
        ]
      }
    ]
  },
  "dc_4_act_09_tp": {
    "id": "dc_4_act_09_tp",
    "correction": "Ce TP est validé lorsqu’une preuve décrit concrètement : Le workflow est déclenché toutes les heures et interroge la météo de Londres. ; Les données passent par Code, Loop Over Items et une décision If de réussite ou d’échec..",
    "criteria": [
      {
        "id": "criterion_1",
        "label": "Le workflow est déclenché toutes les heures et interroge la météo de Londres.",
        "terms": [
          "Schedule Trigger",
          "HTTP Request"
        ]
      },
      {
        "id": "criterion_2",
        "label": "Les données passent par Code, Loop Over Items et une décision If de réussite ou d’échec.",
        "terms": [
          "HTTP Request",
          "Code"
        ]
      }
    ]
  }
} as const;
