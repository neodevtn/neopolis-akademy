/** Generated from the supplied Claude Science V2 package. Correct answers and TP corrections remain server-only. */
export const CLAUDE_SCIENCE_V2_CERTIFICATION_ID = "claude_science_recherche_medicale" as const;
export const CLAUDE_SCIENCE_V2_COURSE_ORDER = ["claude_science_01_initiation","claude_science_02_pratique","claude_science_03_travaux_pratiques"] as const;
export const CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS = {
  "claude_science_01_initiation_01_ia_recherche_00_01_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La valeur scientifique vient de la methode et des preuves, non de la fluidite du texte genere.",
      "en": "La valeur scientifique vient de la methode et des preuves, non de la fluidite du texte genere."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_01_initiation_01_ia_recherche_00_02_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Pre-specifier les decisions limite les ajustements opportunistes apres observation des resultats.",
      "en": "Pre-specifier les decisions limite les ajustements opportunistes apres observation des resultats."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_01_initiation_02_claude_science_00_03_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La separation plan-execution cree une porte de revue avant toute modification ou calcul.",
      "en": "La separation plan-execution cree une porte de revue avant toute modification ou calcul."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_01_initiation_02_claude_science_01_01_checkpoint_6": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le workbench produit des elements inspectables, sans transformer Claude en autorite clinique.",
      "en": "Le workbench produit des elements inspectables, sans transformer Claude en autorite clinique."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_01_initiation_03_conformite_04_01_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le stockage reste local, mais les contenus utilises dans une reponse peuvent transiter vers le service de modele.",
      "en": "Le stockage reste local, mais les contenus utilises dans une reponse peuvent transiter vers le service de modele."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_01_initiation_03_conformite_01_03_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le moindre privilege limite l'acces au dossier exact et au mode lecture seule lorsque l'ecriture n'est pas necessaire.",
      "en": "Le moindre privilege limite l'acces au dossier exact et au mode lecture seule lorsque l'ecriture n'est pas necessaire."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_01_installer_01_02_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Les dependances du sandbox Linux sont un prerequis officiel, alors qu'aucune cle API n'est requise pour la connexion standard.",
      "en": "Les dependances du sandbox Linux sont un prerequis officiel, alors qu'aucune cle API n'est requise pour la connexion standard."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_02_utiliser_02_01_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le plan est une proposition methodologique. Il doit etre compris et corrige avant l'execution.",
      "en": "Le plan est une proposition methodologique. Il doit etre compris et corrige avant l'execution."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_02_utiliser_02_02_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La provenance relie la sortie aux operations effectivement executees.",
      "en": "La provenance relie la sortie aux operations effectivement executees."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_02_utiliser_02_03_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le reviewer controle la coherence avec les traces disponibles ; il ne remplace pas une validation externe.",
      "en": "Le reviewer controle la coherence avec les traces disponibles ; il ne remplace pas une validation externe."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_03_outils_03_01_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Un noyau persistant peut cacher un etat non documente ; une reconstruction propre teste la reproductibilite.",
      "en": "Un noyau persistant peut cacher un etat non documente ; une reconstruction propre teste la reproductibilite."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_03_outils_03_02_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La provenance bibliographique doit permettre de retrouver exactement la source et le passage utilises.",
      "en": "La provenance bibliographique doit permettre de retrouver exactement la source et le passage utilises."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_04_qualite_04_02_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Une analyse exploratoire rapporte ce qui est observe et les validations encore necessaires.",
      "en": "Une analyse exploratoire rapporte ce qui est observe et les validations encore necessaires."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_04_qualite_03_03_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La chaine d'audit relie la question, la methode, l'execution et les fichiers produits.",
      "en": "La chaine d'audit relie la question, la methode, l'execution et les fichiers produits."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  },
  "claude_science_02_pratique_04_qualite_03_04_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Un essai reduit detecte les erreurs de logique avant de consommer des ressources importantes.",
      "en": "Un essai reduit detecte les erreurs de logique avant de consommer des ressources importantes."
    },
    "incorrectExplanation": {
      "fr": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil.",
      "en": "Relisez la procedure et identifiez ce qui constitue une preuve verifiable, une autorisation explicite ou une limite de l'outil."
    }
  }
} as const;
export const CLAUDE_SCIENCE_V2_FINAL_QUIZZES = {
  "claude_science_01_initiation": {
    "id": "claude_science_01_initiation_final_quiz",
    "title": "Evaluation finale du cours",
    "passingScore": 75,
    "maxAttempts": 3,
    "questions": [
      {
        "id": "q1_1",
        "prompt": "Quel role convient a Claude Science dans une etude en sante ?",
        "options": [
          {
            "id": "a",
            "text": "Choisir le traitement d'un patient"
          },
          {
            "id": "b",
            "text": "Assister des taches tracables sous validation humaine"
          },
          {
            "id": "c",
            "text": "Certifier la validite statistique"
          },
          {
            "id": "d",
            "text": "Remplacer l'investigateur principal"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Il assiste des taches tracables tandis que les decisions scientifiques et cliniques restent humaines.",
        "sourceRefs": [
          {
            "id": "anthropic_overview",
            "title": "Claude Science - Overview",
            "url": "https://claude.com/docs/claude-science/overview"
          },
          {
            "id": "anthropic_product",
            "title": "Claude Science (beta) - page produit officielle",
            "url": "https://claude.com/product/claude-science"
          }
        ]
      },
      {
        "id": "q1_2",
        "prompt": "Qu'est-ce qui constitue la preuve d'un resultat produit avec une IA ?",
        "options": [
          {
            "id": "a",
            "text": "Le ton convaincant de la reponse"
          },
          {
            "id": "b",
            "text": "Le protocole, l'execution, les controles et la validation humaine"
          },
          {
            "id": "c",
            "text": "La longueur de la conversation"
          },
          {
            "id": "d",
            "text": "L'absence d'alerte du reviewer"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Le protocole, les donnees autorisees, l'execution, les controles et la validation humaine constituent la preuve.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          },
          {
            "id": "anthropic_artifacts",
            "title": "Artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          }
        ]
      },
      {
        "id": "q1_3",
        "prompt": "Comment reduire le risque d'une consigne trop vague avant une analyse ?",
        "options": [
          {
            "id": "a",
            "text": "Demander directement la conclusion"
          },
          {
            "id": "b",
            "text": "Autoriser tous les dossiers"
          },
          {
            "id": "c",
            "text": "Expliciter la demande et exiger un plan avant execution"
          },
          {
            "id": "d",
            "text": "Laisser Claude choisir les criteres apres les resultats"
          }
        ],
        "correctAnswer": "c",
        "explanation": "Il faut expliciter question, entrees, contraintes, sorties et demander un plan avant execution.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          }
        ]
      },
      {
        "id": "q1_4",
        "prompt": "Quelle permission respecte le moindre privilege pour consulter un jeu de reference ?",
        "options": [
          {
            "id": "a",
            "text": "Lecture seule temporaire sur le dossier exact"
          },
          {
            "id": "b",
            "text": "Lecture-ecriture permanente sur le disque"
          },
          {
            "id": "c",
            "text": "Acces global a tous les projets"
          },
          {
            "id": "d",
            "text": "Copie dans une conversation publique"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Un acces temporaire en lecture seule au dossier exact est suffisant.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          }
        ]
      },
      {
        "id": "q1_5",
        "prompt": "Pourquoi un fichier stocke localement doit-il quand meme etre classe avant usage ?",
        "options": [
          {
            "id": "a",
            "text": "Parce qu'il devient automatiquement public"
          },
          {
            "id": "b",
            "text": "Parce que son contenu lu peut etre transmis au service de modele"
          },
          {
            "id": "c",
            "text": "Parce que le sandbox desactive le chiffrement"
          },
          {
            "id": "d",
            "text": "Parce que toute donnee locale est une donnee clinique"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Son contenu peut etre transmis au service de modele lorsqu'il est lu pour produire une reponse.",
        "sourceRefs": [
          {
            "id": "anthropic_data",
            "title": "How Claude Science works with your data",
            "url": "https://claude.com/docs/claude-science/how-claude-science-works-with-your-data"
          }
        ]
      },
      {
        "id": "q1_6",
        "prompt": "Quel partage est acceptable a la fin d'un exercice du cours ?",
        "options": [
          {
            "id": "a",
            "text": "Une capture isolee sans methode"
          },
          {
            "id": "b",
            "text": "Un export patient pseudonymise"
          },
          {
            "id": "c",
            "text": "Un paquet synthetique documente et valide humainement"
          },
          {
            "id": "d",
            "text": "Le contenu complet du dossier personnel"
          }
        ],
        "correctAnswer": "c",
        "explanation": "Un paquet sans secret, sur donnees synthetiques, avec methode, provenance, limites et validation humaine.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          },
          {
            "id": "anthropic_data",
            "title": "How Claude Science works with your data",
            "url": "https://claude.com/docs/claude-science/how-claude-science-works-with-your-data"
          }
        ]
      }
    ]
  },
  "claude_science_02_pratique": {
    "id": "claude_science_02_pratique_final_quiz",
    "title": "Evaluation finale du cours",
    "passingScore": 75,
    "maxAttempts": 3,
    "questions": [
      {
        "id": "q2_1",
        "prompt": "Que faut-il verifier avant d'approuver un plan ?",
        "options": [
          {
            "id": "a",
            "text": "Uniquement la longueur du texte"
          },
          {
            "id": "b",
            "text": "Question, donnees, transformations, controles et sorties"
          },
          {
            "id": "c",
            "text": "Le style graphique final"
          },
          {
            "id": "d",
            "text": "Le nombre de tokens"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Question, donnees, transformations, controles et sorties doivent etre explicites.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          }
        ]
      },
      {
        "id": "q2_2",
        "prompt": "Pourquoi conserver l'environnement d'un artefact ?",
        "options": [
          {
            "id": "a",
            "text": "Pour cacher le code"
          },
          {
            "id": "b",
            "text": "Pour reconstruire les conditions d'execution"
          },
          {
            "id": "c",
            "text": "Pour supprimer les versions precedentes"
          },
          {
            "id": "d",
            "text": "Pour valider un diagnostic"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Il permet de reconstruire les conditions d'execution.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          }
        ]
      },
      {
        "id": "q2_3",
        "prompt": "Que fait le reviewer ?",
        "options": [
          {
            "id": "a",
            "text": "Il reproduit toute l'etude sur un autre cluster"
          },
          {
            "id": "b",
            "text": "Il compare les affirmations aux traces disponibles"
          },
          {
            "id": "c",
            "text": "Il certifie les conclusions cliniques"
          },
          {
            "id": "d",
            "text": "Il remplace la revue de code"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Il compare les affirmations aux plans, artefacts et traces disponibles.",
        "sourceRefs": [
          {
            "id": "anthropic_reviewer",
            "title": "The reviewer",
            "url": "https://claude.com/docs/claude-science/the-reviewer"
          }
        ]
      },
      {
        "id": "q2_4",
        "prompt": "Quel commentaire est le plus actionnable ?",
        "options": [
          {
            "id": "a",
            "text": "Ameliore tout"
          },
          {
            "id": "b",
            "text": "Rends cela scientifique"
          },
          {
            "id": "c",
            "text": "Sur l'axe Y, afficher l'unite et verifier la plage 0-100"
          },
          {
            "id": "d",
            "text": "Recommence"
          }
        ],
        "correctAnswer": "c",
        "explanation": "Celui qui designe une zone, demande un changement et donne un critere d'acceptation.",
        "sourceRefs": [
          {
            "id": "anthropic_comments",
            "title": "Comments",
            "url": "https://claude.com/docs/claude-science/comments"
          }
        ]
      },
      {
        "id": "q3_1",
        "prompt": "Quel risque introduit un noyau persistant ?",
        "options": [
          {
            "id": "a",
            "text": "Il interdit Python"
          },
          {
            "id": "b",
            "text": "Une variable ancienne peut influencer le resultat"
          },
          {
            "id": "c",
            "text": "Il chiffre automatiquement les secrets"
          },
          {
            "id": "d",
            "text": "Il supprime les paquets"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Une variable ancienne peut influencer une execution sans apparaitre dans le script courant.",
        "sourceRefs": [
          {
            "id": "anthropic_tools",
            "title": "Tools and environments",
            "url": "https://claude.com/docs/claude-science/tools-and-environments"
          }
        ]
      },
      {
        "id": "q3_2",
        "prompt": "Que faut-il tracer pour une source bibliographique ?",
        "options": [
          {
            "id": "a",
            "text": "Uniquement le titre"
          },
          {
            "id": "b",
            "text": "Identifiant, version, date et passage"
          },
          {
            "id": "c",
            "text": "Le nom du navigateur"
          },
          {
            "id": "d",
            "text": "Le nombre de pages du rapport"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Identifiant, version, date d'acces et passage utilise.",
        "sourceRefs": [
          {
            "id": "anthropic_literature",
            "title": "Literature access",
            "url": "https://claude.com/docs/claude-science/literature-access"
          }
        ]
      },
      {
        "id": "q3_3",
        "prompt": "Ou placer une cle d'acces cloud ?",
        "options": [
          {
            "id": "a",
            "text": "Dans le prompt"
          },
          {
            "id": "b",
            "text": "Dans la legende d'une figure"
          },
          {
            "id": "c",
            "text": "Dans le mecanisme de credentials"
          },
          {
            "id": "d",
            "text": "Dans un CSV partage"
          }
        ],
        "correctAnswer": "c",
        "explanation": "Dans le mecanisme de credentials prevu, jamais dans le prompt ou le notebook.",
        "sourceRefs": [
          {
            "id": "anthropic_storage",
            "title": "Cloud storage",
            "url": "https://claude.com/docs/claude-science/cloud-storage"
          }
        ]
      },
      {
        "id": "q3_4",
        "prompt": "Avant un calcul distant sur une infrastructure institutionnelle, que doit valider le chercheur ?",
        "options": [
          {
            "id": "a",
            "text": "Seulement le nom du calcul"
          },
          {
            "id": "b",
            "text": "Le besoin scientifique, les donnees autorisees, les responsables, les controles et les sorties"
          },
          {
            "id": "c",
            "text": "Uniquement la duree"
          },
          {
            "id": "d",
            "text": "Le theme de couleur"
          }
        ],
        "correctAnswer": "b",
        "explanation": "Le besoin scientifique, les donnees autorisees, les responsables, les controles et les sorties attendues.",
        "sourceRefs": [
          {
            "id": "anthropic_remote",
            "title": "Remote compute clusters",
            "url": "https://claude.com/docs/claude-science/remote-compute-clusters"
          },
          {
            "id": "anthropic_storage",
            "title": "Cloud storage",
            "url": "https://claude.com/docs/claude-science/cloud-storage"
          }
        ]
      }
    ]
  }
} as const;
export const CLAUDE_SCIENCE_V2_LABS = {
  "lab_01": {
    "id": "lab_01",
    "courseId": "claude_science_03_travaux_pratiques",
    "title": "Recette d'installation et matrice de permissions",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "cadrage",
        "label": "Cadrage",
        "description": "La question, le périmètre et les données autorisées sont explicitement définis.",
        "weight": 20
      },
      {
        "id": "methode",
        "label": "Méthode",
        "description": "Les étapes suivent une méthode lisible et vérifiable.",
        "weight": 25
      },
      {
        "id": "reproductibilite",
        "label": "Reproductibilité",
        "description": "Les fichiers, versions, paramètres et contrôles nécessaires sont documentés.",
        "weight": 25
      },
      {
        "id": "validation",
        "label": "Validation",
        "description": "Les contrôles indépendants et la validation humaine sont décrits.",
        "weight": 20
      },
      {
        "id": "limites",
        "label": "Limites",
        "description": "Les limites, incertitudes et l'absence de portée clinique sont explicites.",
        "weight": 10
      }
    ],
    "correction": "# Correction expliquee - TP 01\n\n## Resultat attendu\n\nLa fiche mentionne le systeme, l'architecture, l'espace disponible et l'etat de Python et R. Le projet d'essai ne contient aucune donnee medicale. La matrice accorde uniquement la lecture au dossier du TP, pour une portee courte, avec une justification et une date de revue.\n\n## Raisonnement\n\nUne installation reussie ne se limite pas a l'ouverture de l'application. Il faut prouver que les environnements sont prets, que la carte de permission est comprise et que l'autorisation peut etre revoquee. Un acces lecture-ecriture ou un dossier parent trop large doit etre refuse et corrige.\n\n## Erreurs typiques\n\n- tester avec un fichier patient ;\n- accorder tout le disque ;\n- confondre succes de connexion et succes des environnements ;\n- oublier la preuve de revocation.\n\n## Grille de controle\n\n- Toutes les donnees sont synthetiques.\n- Les permissions sont justifiees.\n- Le code et l'environnement sont conserves.\n- Les controles independants sont documentes.\n- Les limites et la validation humaine sont explicites.\n",
    "correctionSha256": "bb96ba4b446d64282437da1a1ebca8d731258f3aff8a93c0237e9e9731bd7c3c"
  },
  "lab_02": {
    "id": "lab_02",
    "courseId": "claude_science_03_travaux_pratiques",
    "title": "Analyse descriptive reproductible",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "cadrage",
        "label": "Cadrage",
        "description": "La question, le périmètre et les données autorisées sont explicitement définis.",
        "weight": 20
      },
      {
        "id": "methode",
        "label": "Méthode",
        "description": "Les étapes suivent une méthode lisible et vérifiable.",
        "weight": 25
      },
      {
        "id": "reproductibilite",
        "label": "Reproductibilité",
        "description": "Les fichiers, versions, paramètres et contrôles nécessaires sont documentés.",
        "weight": 25
      },
      {
        "id": "validation",
        "label": "Validation",
        "description": "Les contrôles indépendants et la validation humaine sont décrits.",
        "weight": 20
      },
      {
        "id": "limites",
        "label": "Limites",
        "description": "Les limites, incertitudes et l'absence de portée clinique sont explicites.",
        "weight": 10
      }
    ],
    "correction": "# Correction expliquee - TP 02\n\n## Valeurs de controle\n\n- 240 lignes, 0 identifiant duplique et 8 suivis manquants ;\n- 120 participants par bras ;\n- moyenne initiale : 59,5325 controle et 60,4617 intervention ;\n- moyenne de suivi sur cas complets : 60,7612 controle et 64,7328 intervention ;\n- variation moyenne sur cas complets : 1,2345 controle et 4,2922 intervention ;\n- taux descriptif d'evenement indesirable : 0,1083 controle et 0,1000 intervention.\n\n## Interpretation correcte\n\nCes nombres decrivent un jeu synthetique. La difference de variation ne demontre ni efficacite, ni causalite. Il faut documenter la gestion des huit valeurs manquantes et eviter de comparer des moyennes sans rappeler que le protocole est fictif.\n\n## Controle\n\nLe script de reference calcule `followup_score - baseline_score`, groupe par bras et arrondit seulement les sorties. Une divergence exige de verifier types, valeurs manquantes, filtre et sens de la soustraction.\n\n## Grille de controle\n\n- Toutes les donnees sont synthetiques.\n- Les permissions sont justifiees.\n- Le code et l'environnement sont conserves.\n- Les controles independants sont documentes.\n- Les limites et la validation humaine sont explicites.\n",
    "correctionSha256": "2eaa67fb577b2d90c3a7de4f43c1781db2b7c89ce0f8304d4a1f7a44f665da47"
  },
  "lab_03": {
    "id": "lab_03",
    "courseId": "claude_science_03_travaux_pratiques",
    "title": "Recherche bibliographique exploratoire et piste de preuve",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "cadrage",
        "label": "Cadrage",
        "description": "La question, le périmètre et les données autorisées sont explicitement définis.",
        "weight": 20
      },
      {
        "id": "methode",
        "label": "Méthode",
        "description": "Les étapes suivent une méthode lisible et vérifiable.",
        "weight": 25
      },
      {
        "id": "reproductibilite",
        "label": "Reproductibilité",
        "description": "Les fichiers, versions, paramètres et contrôles nécessaires sont documentés.",
        "weight": 25
      },
      {
        "id": "validation",
        "label": "Validation",
        "description": "Les contrôles indépendants et la validation humaine sont décrits.",
        "weight": 20
      },
      {
        "id": "limites",
        "label": "Limites",
        "description": "Les limites, incertitudes et l'absence de portée clinique sont explicites.",
        "weight": 10
      }
    ],
    "correction": "# Correction expliquee - TP 03\n\n## Tri bibliographique attendu\n\nLe CSV comporte 36 references fictives : 12 `include`, 12 `exclude`, 12 `uncertain`; 9 enregistrements par type de source; 24 en acces ouvert et 12 sans acces ouvert. Ces etiquettes servent uniquement a verifier la manipulation du fichier, pas a simuler une vraie revue systematique.\n\n## Methode attendue\n\nLa question, les termes, la periode et les criteres sont ecrits avant le tri. Les 12 cas `uncertain` restent dans une file de verification et ne sont jamais forces dans la categorie `include` ou `exclude` par Claude. Le statut d'acces ouvert ne doit pas etre confondu avec la qualite metodologique. Comme les titres et etiquettes sont fictifs, aucune conclusion scientifique ne peut etre tiree du jeu.\n\n## Piste de preuve attendue\n\nElle contient la requete complete, la date, les bases visees, les criteres, les decisions de tri, les cas incertains, l'identifiant de chaque reference et le passage qui resterait a verifier. La note finale indique explicitement l'absence de double screening, de verification des textes integraux et de diagramme PRISMA.\n\n## Erreurs typiques\n\n- modifier les criteres apres avoir vu les resultats ;\n- assimiler une etiquette synthetique a une decision scientifique ;\n- citer un article sans avoir verifie le passage ;\n- presenter la recherche exploratoire comme une revue systematique.\n\n## Grille de controle\n\n- Toutes les donnees sont synthetiques.\n- Les permissions sont justifiees.\n- Le code et l'environnement sont conserves.\n- Les controles independants sont documentes.\n- Les limites et la validation humaine sont explicites.\n",
    "correctionSha256": "3da9f4087244813f347e8264f65ef040a3a28de7c171b48cca3dfa4e1adbc5fb"
  },
  "lab_04": {
    "id": "lab_04",
    "courseId": "claude_science_03_travaux_pratiques",
    "title": "Capstone : dossier d'expression genique reproductible",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "cadrage",
        "label": "Cadrage",
        "description": "La question, le périmètre et les données autorisées sont explicitement définis.",
        "weight": 20
      },
      {
        "id": "methode",
        "label": "Méthode",
        "description": "Les étapes suivent une méthode lisible et vérifiable.",
        "weight": 25
      },
      {
        "id": "reproductibilite",
        "label": "Reproductibilité",
        "description": "Les fichiers, versions, paramètres et contrôles nécessaires sont documentés.",
        "weight": 25
      },
      {
        "id": "validation",
        "label": "Validation",
        "description": "Les contrôles indépendants et la validation humaine sont décrits.",
        "weight": 20
      },
      {
        "id": "limites",
        "label": "Limites",
        "description": "Les limites, incertitudes et l'absence de portée clinique sont explicites.",
        "weight": 10
      }
    ],
    "correction": "# Correction expliquee - TP 04\n\n## Valeurs de controle\n\nLe jeu comporte 120 genes et 6 echantillons. Le calcul descriptif est `log2((moyenne_traitement + 1) / (moyenne_controle + 1))`. Les cinq amplitudes les plus fortes commencent par :\n\n1. GENE_0015 : -1,080783 ;\n2. GENE_0023 : -1,068344 ;\n3. GENE_0010 : 1,040252 ;\n4. GENE_0014 : -1,007475 ;\n5. GENE_0012 : 0,981415.\n\n## Interpretation correcte\n\nCe classement est purement descriptif. Il n'inclut ni modele de dispersion, ni test statistique, ni correction de multiplicite, ni validation biologique. Le rapport doit donc parler de differences descriptives dans un jeu synthetique et proposer les validations suivantes, jamais une cible therapeutique ou un biomarqueur clinique.\n\n## Paquet final\n\nIl comprend les donnees hachees, le script, l'environnement, le tableau complet, la figure, les controles, la matrice affirmation-preuve, les alertes du reviewer et la preuve de reexecution dans une session propre.\n\n## Grille de controle\n\n- Toutes les donnees sont synthetiques.\n- Les permissions sont justifiees.\n- Le code et l'environnement sont conserves.\n- Les controles independants sont documentes.\n- Les limites et la validation humaine sont explicites.\n",
    "correctionSha256": "6c61e8b955278629dafeee1e19d5d2d35b78192f2fa7a809d22e0a46df8962a7"
  }
} as const;
