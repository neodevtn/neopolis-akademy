/** Generated only from the supplied Claude Science V3 package. Correct answers and corrections remain server-only. */
export const CLAUDE_SCIENCE_V2_CERTIFICATION_ID = "claude_science_recherche_sante_v3" as const;
export const CLAUDE_SCIENCE_V2_COURSE_ORDER = ["claude_science_01_fondamentaux","claude_science_02_pratique","claude_science_03_tp"] as const;
export const CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS = {
  "claude_science_01_fondamentaux_c1_m1_c1_l1_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le produit accelere des taches auditables, sans remplacer la methode ni la validation scientifique."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_01_fondamentaux_c1_m1_c1_l2_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La documentation des artefacts designe le journal d'execution comme trace autoritative."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_01_fondamentaux_c1_m2_c1_l3_checkpoint_6": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Une visualisation n'acquiert de valeur scientifique qu'avec sa provenance, ses controles et une interpretation proportionnee."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_01_fondamentaux_c1_m2_c1_l4_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le stockage local et le transit vers le modele sont deux questions distinctes."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_02_pratique_c2_m1_c2_l1_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La recette doit d'abord verifier l'environnement avec un contenu neutre et reversible."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_02_pratique_c2_m1_c2_l2_checkpoint_5": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le moindre privilege limite le dossier, le mode et la duree de l'autorisation."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_02_pratique_c2_m2_c2_l3_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le plan sans execution permet une revue avant toute action sur les donnees."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_02_pratique_c2_m2_c2_l4_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "La reproduction exige le code, les donnees autorisees, l'environnement et la trace d'execution."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  },
  "claude_science_02_pratique_c2_m3_c2_l5_checkpoint_4": {
    "correctAnswer": "a",
    "explanation": {
      "fr": "Le job distant est hors sandbox et agit avec les droits du compte utilisateur."
    },
    "incorrectExplanation": {
      "fr": "Relisez la source associee, puis repondez a nouveau. La correction ne doit pas etre affichee avant soumission."
    }
  }
} as const;
export const CLAUDE_SCIENCE_V2_FINAL_QUIZZES = {
  "claude_science_01_fondamentaux": {
    "id": "claude_science_01_fondamentaux_final_quiz",
    "title": "Quiz - Fondamentaux et gouvernance",
    "passingScore": 80,
    "maxAttempts": null,
    "questions": [
      {
        "id": "quiz_course_01_q01",
        "prompt": "Quel role convient a Claude Science dans une etude en sante ?",
        "options": [
          {
            "id": "a",
            "text": "Assistant de recherche sous controle humain"
          },
          {
            "id": "b",
            "text": "Dispositif de diagnostic"
          },
          {
            "id": "c",
            "text": "Comite d'ethique automatise"
          },
          {
            "id": "d",
            "text": "Source de preuve autonome"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Claude Science assiste des taches de recherche mais ne remplace ni validation ni decision clinique.",
        "sourceRefs": [
          {
            "id": "anthropic_overview",
            "title": "Claude Science - overview",
            "url": "https://claude.com/docs/claude-science/overview"
          }
        ]
      },
      {
        "id": "quiz_course_01_q02",
        "prompt": "Quelle trace prime si le code affiche et ce qui a tourne divergent ?",
        "options": [
          {
            "id": "a",
            "text": "Le journal d'execution"
          },
          {
            "id": "b",
            "text": "Le dernier message"
          },
          {
            "id": "c",
            "text": "Le titre de l'artefact"
          },
          {
            "id": "d",
            "text": "La capture d'ecran"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le journal d'execution documente ce qui a effectivement ete lance.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Claude Science - artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          }
        ]
      },
      {
        "id": "quiz_course_01_q03",
        "prompt": "Que fait le reviewer ?",
        "options": [
          {
            "id": "a",
            "text": "Il compare des affirmations a la trace sans reexecuter l'analyse"
          },
          {
            "id": "b",
            "text": "Il choisit automatiquement la meilleure methode"
          },
          {
            "id": "c",
            "text": "Il approuve une utilisation clinique"
          },
          {
            "id": "d",
            "text": "Il remplace la revue par les pairs"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le reviewer controle la coherence, pas la pertinence scientifique complete.",
        "sourceRefs": [
          {
            "id": "anthropic_reviewer",
            "title": "Claude Science - the reviewer",
            "url": "https://claude.com/docs/claude-science/the-reviewer"
          }
        ]
      },
      {
        "id": "quiz_course_01_q04",
        "prompt": "Pourquoi un fichier local doit-il etre classe ?",
        "options": [
          {
            "id": "a",
            "text": "Son contenu lu peut etre envoye au modele"
          },
          {
            "id": "b",
            "text": "Tous les fichiers sont publics"
          },
          {
            "id": "c",
            "text": "Le sandbox le publie"
          },
          {
            "id": "d",
            "text": "Le reviewer le copie"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Local et non transmis ne sont pas synonymes.",
        "sourceRefs": [
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
    "title": "Quiz - Installation et pratique reproductible",
    "passingScore": 80,
    "maxAttempts": null,
    "questions": [
      {
        "id": "quiz_course_02_q01",
        "prompt": "Quel test doit preceder l'usage de donnees reelles ?",
        "options": [
          {
            "id": "a",
            "text": "Projet vide, Python/R et artefact neutre"
          },
          {
            "id": "b",
            "text": "Import d'un dossier patient"
          },
          {
            "id": "c",
            "text": "Acces global en ecriture"
          },
          {
            "id": "d",
            "text": "Job distant non relu"
          }
        ],
        "correctAnswer": "a",
        "explanation": "La recette initiale doit etre neutre, reversible et documentee.",
        "sourceRefs": [
          {
            "id": "anthropic_get_started",
            "title": "Get started with Claude Science",
            "url": "https://claude.com/docs/claude-science/get-started"
          }
        ]
      },
      {
        "id": "quiz_course_02_q02",
        "prompt": "Quelle permission respecte le moindre privilege ?",
        "options": [
          {
            "id": "a",
            "text": "Lecture seule sur le dossier necessaire"
          },
          {
            "id": "b",
            "text": "Lecture-ecriture sur tout le disque"
          },
          {
            "id": "c",
            "text": "Acces global permanent"
          },
          {
            "id": "d",
            "text": "Aucune carte d'autorisation"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Limiter dossier, mode et portee reduit l'exposition.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science - core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          }
        ]
      },
      {
        "id": "quiz_course_02_q03",
        "prompt": "Que faut-il faire avant une analyse multi-etapes ?",
        "options": [
          {
            "id": "a",
            "text": "Faire proposer un plan sans execution et le relire"
          },
          {
            "id": "b",
            "text": "Demander une conclusion"
          },
          {
            "id": "c",
            "text": "Ignorer les exclusions"
          },
          {
            "id": "d",
            "text": "Installer tous les paquets"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le plan cree une porte de validation avant le code.",
        "sourceRefs": [
          {
            "id": "anthropic_core",
            "title": "Claude Science - core concepts",
            "url": "https://claude.com/docs/claude-science/core-concepts"
          }
        ]
      },
      {
        "id": "quiz_course_02_q04",
        "prompt": "Quel ensemble rend un artefact reproductible ?",
        "options": [
          {
            "id": "a",
            "text": "Code, environnement, journal d'execution et donnees autorisees"
          },
          {
            "id": "b",
            "text": "Figure seule"
          },
          {
            "id": "c",
            "text": "Texte seul"
          },
          {
            "id": "d",
            "text": "Nom du modele seul"
          }
        ],
        "correctAnswer": "a",
        "explanation": "La reproduction depend de la trace complete.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Claude Science - artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          },
          {
            "id": "anthropic_tools",
            "title": "Claude Science - tools and environments",
            "url": "https://claude.com/docs/claude-science/tools-and-environments"
          }
        ]
      }
    ]
  },
  "claude_science_03_tp": {
    "id": "claude_science_03_tp_final_quiz",
    "title": "Quiz - Validation des travaux pratiques",
    "passingScore": 80,
    "maxAttempts": null,
    "questions": [
      {
        "id": "quiz_course_03_q01",
        "prompt": "Quelle donnee est autorisee dans les TP ?",
        "options": [
          {
            "id": "a",
            "text": "Uniquement les jeux synthetiques fournis"
          },
          {
            "id": "b",
            "text": "Dossier patient pseudonymise"
          },
          {
            "id": "c",
            "text": "Export hospitalier"
          },
          {
            "id": "d",
            "text": "DICOM reel"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le paquet impose des donnees synthetiques uniquement.",
        "sourceRefs": [
          {
            "id": "anthropic_data",
            "title": "How Claude Science works with your data",
            "url": "https://claude.com/docs/claude-science/how-claude-science-works-with-your-data"
          }
        ]
      },
      {
        "id": "quiz_course_03_q02",
        "prompt": "Comment qualifier les fold-changes du TP d'expression genique ?",
        "options": [
          {
            "id": "a",
            "text": "Descriptifs et non cliniques"
          },
          {
            "id": "b",
            "text": "Preuves d'efficacite"
          },
          {
            "id": "c",
            "text": "Diagnostics"
          },
          {
            "id": "d",
            "text": "Resultats confirmatoires"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le faible jeu synthetique sert a apprendre la trace, pas a conclure biologiquement.",
        "sourceRefs": [
          {
            "id": "anthropic_overview",
            "title": "Claude Science - overview",
            "url": "https://claude.com/docs/claude-science/overview"
          }
        ]
      },
      {
        "id": "quiz_course_03_q03",
        "prompt": "Quand consulter la correction d'un TP ?",
        "options": [
          {
            "id": "a",
            "text": "Apres soumission des livrables"
          },
          {
            "id": "b",
            "text": "Avant de commencer"
          },
          {
            "id": "c",
            "text": "Pendant le quiz"
          },
          {
            "id": "d",
            "text": "Jamais"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Les corrections sont masquees jusqu'a la soumission.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Claude Science - artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          }
        ]
      },
      {
        "id": "quiz_course_03_q04",
        "prompt": "Que doit contenir le rapport final ?",
        "options": [
          {
            "id": "a",
            "text": "Question, methode, resultats, provenance, limites et validation"
          },
          {
            "id": "b",
            "text": "Seulement la figure"
          },
          {
            "id": "c",
            "text": "Seulement le prompt"
          },
          {
            "id": "d",
            "text": "Une conclusion clinique"
          }
        ],
        "correctAnswer": "a",
        "explanation": "Le rapport doit relier chaque affirmation a une source ou une execution.",
        "sourceRefs": [
          {
            "id": "anthropic_artifacts",
            "title": "Claude Science - artifacts",
            "url": "https://claude.com/docs/claude-science/artifacts"
          },
          {
            "id": "anthropic_reviewer",
            "title": "Claude Science - the reviewer",
            "url": "https://claude.com/docs/claude-science/the-reviewer"
          }
        ]
      }
    ]
  }
} as const;
export const CLAUDE_SCIENCE_V2_LABS = {
  "lab_01": {
    "id": "lab_01",
    "courseId": "claude_science_03_tp",
    "title": "Cadrer une recherche bibliographique exploratoire",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "question",
        "label": "question",
        "weight": 20
      },
      {
        "id": "criteres",
        "label": "criteres",
        "weight": 25
      },
      {
        "id": "tracabilite",
        "label": "tracabilite",
        "weight": 25
      },
      {
        "id": "incertitude",
        "label": "incertitude",
        "weight": 15
      },
      {
        "id": "limites",
        "label": "limites",
        "weight": 15
      }
    ],
    "correction": "# Correction expliquee - TP 1\n\nCette correction n'est visible qu'apres la soumission.\n\n## Resultat attendu\n\n- Question PICO ou PECO explicite.\n- Criteres pre-specifies avant le tri.\n- Chaque notice classee `include`, `exclude` ou `uncertain` avec justification.\n- Les cas incertains restent visibles et sont soumis a une seconde lecture.\n- Chaque affirmation du compte rendu pointe vers un identifiant de notice ; aucune reference n'est inventee.\n- Le rapport indique clairement qu'il s'agit d'un corpus synthetique et d'un exercice exploratoire, pas d'une revue systematique PRISMA.\n\n## Erreurs frequentes\n\n- Modifier les criteres apres avoir vu les resultats.\n- Transformer `uncertain` en inclusion sans seconde lecture.\n- Presenter un titre fictif comme une publication reelle.\n",
    "correctionSha256": "e54a7718cae5756bb56ca2cd524b7f8577ce77a4c4d1b063daad87851f2298d4",
    "correctionResources": []
  },
  "lab_02": {
    "id": "lab_02",
    "courseId": "claude_science_03_tp",
    "title": "Analyser un jeu clinique synthetique avec Python ou R",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "controle_qualite",
        "label": "controle_qualite",
        "weight": 25
      },
      {
        "id": "calculs",
        "label": "calculs",
        "weight": 25
      },
      {
        "id": "figure",
        "label": "figure",
        "weight": 15
      },
      {
        "id": "provenance",
        "label": "provenance",
        "weight": 20
      },
      {
        "id": "limites",
        "label": "limites",
        "weight": 15
      }
    ],
    "correction": "# Correction expliquee - TP 2\n\nCette correction n'est visible qu'apres la soumission.\n\nExecutez `downloads/scripts/solution_descriptive_analysis.py` depuis l'environnement Python du projet. Une version R equivalente est fournie.\n\n## Controles obligatoires\n\n- 240 lignes et identifiants uniques.\n- Scores dans l'intervalle 0-100 hors valeurs manquantes.\n- Valeurs manquantes comptees avant les moyennes.\n- Statistiques descriptives par bras, sans test causal ni conclusion d'efficacite.\n- Figure marquee comme donnees synthetiques.\n\nComparez le JSON obtenu a `downloads/expected/clinical_descriptive_expected.json`. Tout ecart doit etre explique avant validation.\n",
    "correctionSha256": "5482c01f21ad6c508186407b658a8d083da1f708cc75c92bf78253f8c8492a6b",
    "correctionResources": [
      {
        "title": "solution_descriptive_analysis.py",
        "filename": "solution_descriptive_analysis.py",
        "url": "/api/assets/claude-science-v3/courses/03_travaux_pratiques/downloads/scripts/solution_descriptive_analysis_d804392f.py",
        "sha256": "cdb87336d7578ffab605287409762c3d7c5b7885180fba2c7ce6943bde0d1fce",
        "size": 1556
      },
      {
        "title": "clinical_descriptive_expected.json",
        "filename": "clinical_descriptive_expected.json",
        "url": "/api/assets/claude-science-v3/courses/03_travaux_pratiques/downloads/expected/clinical_descriptive_expected_7062f6fe.json",
        "sha256": "0fd820bf1c821ae1e863f425759230f6bff2b3811b634e675851dcbabf2ba7c5",
        "size": 495
      }
    ]
  },
  "lab_03": {
    "id": "lab_03",
    "courseId": "claude_science_03_tp",
    "title": "Capstone expression genique : figure et rapport reproductible",
    "maxScore": 100,
    "passingScore": 75,
    "rubric": [
      {
        "id": "controle_qualite",
        "label": "controle_qualite",
        "weight": 20
      },
      {
        "id": "calculs",
        "label": "calculs",
        "weight": 25
      },
      {
        "id": "figure",
        "label": "figure",
        "weight": 15
      },
      {
        "id": "reproductibilite",
        "label": "reproductibilite",
        "weight": 25
      },
      {
        "id": "limites",
        "label": "limites",
        "weight": 15
      }
    ],
    "correction": "# Correction expliquee - TP 3\n\nCette correction n'est visible qu'apres la soumission.\n\nExecutez `downloads/scripts/solution_gene_expression.py` depuis l'environnement Python du projet. Une version R equivalente est fournie.\n\n## Controles obligatoires\n\n- 120 genes fictifs, six echantillons synthetiques et aucune valeur manquante.\n- Moyennes controle et traitement calculees par ligne.\n- `log2((moyenne_traitement + 1) / (moyenne_controle + 1))` utilise uniquement comme indicateur descriptif.\n- Top 20 classe par valeur absolue du fold-change descriptif.\n- Figure, script, environnement et journal d'execution conserves.\n- Rapport indiquant qu'aucun test statistique, resultat biologique ou conclusion clinique n'est produit.\n\nComparez le JSON obtenu a `downloads/expected/gene_expression_expected.json` et la table au CSV attendu.\n",
    "correctionSha256": "0ed54353c276f6c10a6c4a26ad90c59a1aa0bc98baf96df907a4f47f15414cf8",
    "correctionResources": [
      {
        "title": "solution_gene_expression.py",
        "filename": "solution_gene_expression.py",
        "url": "/api/assets/claude-science-v3/courses/03_travaux_pratiques/downloads/scripts/solution_gene_expression_0cada8fe.py",
        "sha256": "82277d2c73b606ed0b61e745f891537479182c88cf24ab1ae543e57fd6b98eb0",
        "size": 1627
      },
      {
        "title": "gene_expression_expected.json",
        "filename": "gene_expression_expected.json",
        "url": "/api/assets/claude-science-v3/courses/03_travaux_pratiques/downloads/expected/gene_expression_expected_b5210521.json",
        "sha256": "fba34312fe98e877296bdc209413d74e18af1afc59e4a0c997fc400b549bacb0",
        "size": 3306
      }
    ]
  }
} as const;
