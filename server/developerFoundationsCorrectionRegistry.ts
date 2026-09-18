// Generated from the audited Developer Foundations course payloads.
// Never expose this registry through learner course data.
export const DEVELOPER_FOUNDATIONS_SECURE_CORRECTIONS = {
  "claude_certified_developer_foundations__01": {
    "ex_claude_certified_developer_foundations__01_checkpoint_001": {
      "correction": {
        "en": "Correct answer: b. Tokens are the units Claude processes, and both the input and the generated output consume the available context window. If the combined content is too large, some content must be removed, shortened, or otherwise managed before the request can fit. Option a is incorrect because a context window is measured in tokens, not characters. Option c is incorrect because decoding settings can influence variability, but they do not make an otherwise oversized request fit. Option d is incorrect because repeated requests can still differ due to sampling and system-level variability; identical wording does not guarantee identical output.",
        "fr": "Bonne réponse : b. Les tokens sont les unités traitées par Claude, et l’entrée comme la sortie générée consomment la fenêtre de contexte disponible. Si leur volume combiné est trop important, il faut retirer, raccourcir ou gérer une partie du contenu avant que la requête puisse tenir. L’option a est incorrecte, car une fenêtre de contexte se mesure en tokens et non en caractères. L’option c est incorrecte, car les paramètres de décodage peuvent influencer la variabilité, mais ne permettent pas à une requête trop volumineuse de tenir. L’option d est incorrecte, car des requêtes répétées peuvent encore produire des résultats différents à cause de l’échantillonnage et de la variabilité du système ; une formulation identique ne garantit pas une sortie identique."
      },
      "correctOptionIds": [
        "b"
      ]
    },
    "ex_claude_certified_developer_foundations__01_checkpoint_002": {
      "correction": {
        "en": "Correct answer: c. Adaptive reasoning and model selection should match the task’s stakes and constraints: use a capable model and sufficient reasoning for a high-impact, ambiguous analysis, while avoiding unnecessary cost and latency for simpler work. Option a is incorrect because the fastest or least expensive model is not automatically suitable for consequential reasoning. Option b is incorrect because using the most capable model for every task can waste budget and add latency. Option d is incorrect because model choice should be deliberate and task-dependent rather than random.",
        "fr": "Bonne réponse : c. Le raisonnement adaptatif et la sélection du modèle doivent correspondre aux enjeux et aux contraintes de la tâche : utilisez un modèle capable et un niveau de raisonnement suffisant pour une analyse ambiguë à fort impact, tout en évitant un coût et une latence inutiles pour les tâches simples. L’option a est incorrecte, car le modèle le plus rapide ou le moins cher n’est pas automatiquement adapté à un raisonnement conséquent. L’option b est incorrecte, car utiliser le modèle le plus capable pour chaque tâche peut gaspiller le budget et augmenter la latence. L’option d est incorrecte, car le choix du modèle doit être intentionnel et dépendre de la tâche, non aléatoire."
      },
      "correctOptionIds": [
        "c"
      ]
    },
    "ex_claude_certified_developer_foundations__01_checkpoint_003": {
      "correction": {
        "en": "Correct answer: a. Start zero-shot when the task can be stated clearly: give Claude an explicit instruction, the input, and the desired output format. Add one-shot or multi-shot examples only when they materially improve reliability, demonstrate a nuanced transformation, or clarify a pattern that instructions alone do not convey. Option b is incorrect because examples consume tokens and can add unnecessary complexity. Option c is incorrect because vague instructions make it harder to evaluate whether examples helped. Option d is incorrect because examples are not a substitute for stating the task and output requirements clearly.",
        "fr": "Bonne réponse : a. Commencez en zero-shot lorsque la tâche peut être formulée clairement : donnez à Claude une instruction explicite, l’entrée et le format de sortie attendu. Ajoutez des exemples one-shot ou multi-shot seulement s’ils améliorent réellement la fiabilité, démontrent une transformation nuancée ou clarifient un motif que les seules instructions ne transmettent pas. L’option b est incorrecte, car les exemples consomment des tokens et peuvent ajouter une complexité inutile. L’option c est incorrecte, car des instructions vagues rendent plus difficile l’évaluation de l’apport des exemples. L’option d est incorrecte, car les exemples ne remplacent pas l’énoncé clair de la tâche et des exigences de sortie."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__01_checkpoint_004": {
      "correction": {
        "en": "Correct answer: d. Use streaming when the user benefits from seeing a response as it is generated, such as in an interactive chat interface. Use Message Batches for large collections of independent requests that do not need immediate, per-request interaction. SDKs can simplify integration, while REST remains a direct HTTP interface; AsyncAnthropic is appropriate when an asynchronous Python workflow must handle concurrent I/O efficiently. Option a is incorrect because streaming is specifically useful for progressive delivery. Option b is incorrect because Message Batches are designed for batch-style asynchronous processing, not immediate interactive replies. Option c is incorrect because an SDK does not prevent use of asynchronous patterns.",
        "fr": "Bonne réponse : d. Utilisez le streaming lorsque l’utilisateur gagne à voir la réponse au fil de sa génération, par exemple dans une interface de chat interactive. Utilisez Message Batches pour de grands ensembles de requêtes indépendantes qui n’exigent pas une interaction immédiate requête par requête. Les SDK peuvent simplifier l’intégration, tandis que REST reste une interface HTTP directe ; AsyncAnthropic convient lorsqu’un flux Python asynchrone doit gérer efficacement des E/S concurrentes. L’option a est incorrecte, car le streaming est précisément utile pour une diffusion progressive. L’option b est incorrecte, car Message Batches est conçu pour un traitement asynchrone par lots, et non pour des réponses interactives immédiates. L’option c est incorrecte, car un SDK n’empêche pas l’emploi de modèles asynchrones."
      },
      "correctOptionIds": [
        "d"
      ]
    },
    "ex_claude_certified_developer_foundations__01_checkpoint_005": {
      "correction": {
        "en": "Correct answer: b. The most likely behavior is that Claude follows the clear classification instruction and few-shot pattern, returns results progressively because streaming is enabled, and may vary slightly in wording or borderline judgments across runs because generation is not fully deterministic. The long policy excerpt also consumes tokens and reduces the space available in the context window for the response. Option a is incorrect because streaming affects delivery timing, not whether the response is generated. Option c is incorrect because few-shot examples guide behavior but do not eliminate all variability. Option d is incorrect because input content, including the policy excerpt, still consumes tokens even when the requested output is short.",
        "fr": "Bonne réponse : b. Le comportement le plus probable est que Claude suive l’instruction claire de classification et le motif few-shot, renvoie les résultats progressivement car le streaming est activé, et puisse varier légèrement dans sa formulation ou dans les cas limites entre plusieurs exécutions, car la génération n’est pas totalement déterministe. Le long extrait de politique consomme aussi des tokens et réduit l’espace disponible dans la fenêtre de contexte pour la réponse. L’option a est incorrecte, car le streaming affecte le moment de livraison, et non le fait que la réponse soit générée. L’option c est incorrecte, car les exemples few-shot orientent le comportement mais n’éliminent pas toute variabilité. L’option d est incorrecte, car le contenu d’entrée, y compris l’extrait de politique, consomme des tokens même si la sortie demandée est courte."
      },
      "correctOptionIds": [
        "b"
      ]
    }
  },
  "claude_certified_developer_foundations__02": {
    "ex_claude_certified_developer_foundations__02_checkpoint_001": {
      "correction": {
        "en": "Correct — Correct. The classification content is right, but the output shape varies; a constraint fixes the form expected by the router.\n\nIncorrect — Incorrect. Rewording does not add the missing structural requirement: the permitted output form.\n\nIncorrect — Incorrect. A system prompt helps maintain behavior across turns, but it does not by itself constrain this specific output shape.\n\nIncorrect — Incorrect. Explanations make the response less compatible with a router that accepts only a fixed label.",
        "fr": "Correct — Correct. Le contenu de la classification est juste, mais la forme de sortie varie ; une contrainte fixe le format attendu par le routeur.\n\nIncorrect — Incorrect. Une reformulation n’ajoute pas l’exigence structurelle manquante : la forme de sortie autorisée.\n\nIncorrect — Incorrect. Un prompt système aide à maintenir le comportement sur plusieurs tours, mais ne contraint pas à lui seul cette forme de sortie précise.\n\nIncorrect — Incorrect. Les explications rendent la réponse moins compatible avec un routeur qui n’accepte qu’une étiquette fixe."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_002": {
      "correction": {
        "en": "Correct — Correct. Thinking blocks carry signatures and must be carried back unchanged when Extended Thinking is used with tools.\n\nIncorrect — Incorrect. Summarizing changes the signed block, so the following request can be rejected.\n\nIncorrect — Incorrect. Dropping the block violates the carry-back requirement.\n\nIncorrect — Incorrect. The chapter describes `budget_tokens` as deprecated; effort calibrates reasoning depth on current models.",
        "fr": "Correct — Correct. Les blocs de thinking portent des signatures et doivent être retransmis tels quels lorsque Extended Thinking est utilisé avec des outils.\n\nIncorrect — Incorrect. Résumer modifie le bloc signé ; la requête suivante peut donc être rejetée.\n\nIncorrect — Incorrect. Supprimer le bloc viole l’exigence de carry-back.\n\nIncorrect — Incorrect. Le chapitre indique que `budget_tokens` est déprécié ; sur les modèles actuels, c’est `effort` qui calibre la profondeur du raisonnement."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_003": {
      "correction": {
        "en": "Correct — Correct. Tool-use blocks require a matching result ID in the next user turn; otherwise the API validation fails.\n\nIncorrect — Incorrect. The result must be returned by the application as a user-turn `tool_result`, not as assistant prose.\n\nIncorrect — Incorrect. The `tool_result` must use the original tool-use ID so Claude can associate the result with its call.\n\nIncorrect — Incorrect. The pairing must occur in the immediately following user turn; inserting another turn breaks the required sequence.",
        "fr": "Correct — Correct. Les blocs tool_use exigent un ID de résultat correspondant dans le tour utilisateur suivant ; sinon la validation de l’API échoue.\n\nIncorrect — Incorrect. Le résultat doit être renvoyé par l’application sous forme de `tool_result` dans un tour utilisateur, et non comme prose de l’assistant.\n\nIncorrect — Incorrect. Le `tool_result` doit utiliser l’ID de l’appel d’outil initial afin que Claude puisse relier le résultat à cet appel.\n\nIncorrect — Incorrect. L’appariement doit avoir lieu dans le tour utilisateur immédiatement suivant ; insérer un autre tour casse la séquence requise."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_004": {
      "correction": {
        "en": "Correct — Correct. Without `message_stop`, the assembled turn is incomplete; saving it can corrupt the next request.\n\nIncorrect — Incorrect. Tool input may be invalid or incomplete until `content_block_stop` closes that block.\n\nIncorrect — Incorrect. A half-built tool-use block in history can violate structural pairing rules on the next request.\n\nIncorrect — Incorrect. Only `message_stop` establishes that the complete message has been assembled.",
        "fr": "Correct — Correct. Sans `message_stop`, le tour assemblé est incomplet ; le sauvegarder peut corrompre la requête suivante.\n\nIncorrect — Incorrect. L’entrée de l’outil peut être invalide ou incomplète jusqu’à ce que `content_block_stop` ferme ce bloc.\n\nIncorrect — Incorrect. Un bloc tool_use à moitié construit dans l’historique peut violer les règles structurelles d’appariement à la requête suivante.\n\nIncorrect — Incorrect. Seul `message_stop` établit que le message complet a été assemblé."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_005": {
      "correction": {
        "en": "Correct — Correct. The application must manage a long session by trimming or summarizing history before it exceeds the window.\n\nIncorrect — Incorrect. The chapter states that the API does not silently truncate old content.\n\nIncorrect — Incorrect. Every tool result remains in the context window and consumes budget for the session.\n\nIncorrect — Incorrect. Adding messages increases the context load; history must be managed before the next request.",
        "fr": "Correct — Correct. L’application doit gérer une longue session en taillant ou en résumant l’historique avant de dépasser la fenêtre.\n\nIncorrect — Incorrect. Le chapitre indique que l’API ne tronque pas silencieusement les anciens contenus.\n\nIncorrect — Incorrect. Chaque résultat d’outil reste dans la fenêtre de contexte et consomme du budget durant la session.\n\nIncorrect — Incorrect. Ajouter des messages augmente la charge de contexte ; l’historique doit être géré avant la requête suivante."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_006": {
      "correction": {
        "en": "Correct — Correct. An agent fits work that needs creative sequencing among constrained tools and has an unpredictable path.\n\nIncorrect — Incorrect. A workflow is appropriate only when the exact path can be enumerated in advance.\n\nIncorrect — Incorrect. Agents add coordination overhead, context costs, and additional failure modes.\n\nIncorrect — Incorrect. Claude selects tools, while the application or selected runtime handles execution; this does not determine workflow versus agent.",
        "fr": "Correct — Correct. Un agent convient à un travail qui exige un enchaînement créatif parmi des outils contraints et dont le chemin est imprévisible.\n\nIncorrect — Incorrect. Un workflow n’est approprié que lorsque le chemin exact peut être énuméré à l’avance.\n\nIncorrect — Incorrect. Les agents ajoutent une surcharge de coordination, des coûts de contexte et des modes de défaillance supplémentaires.\n\nIncorrect — Incorrect. Claude sélectionne les outils, tandis que l’application ou le runtime choisi gère l’exécution ; cela ne détermine pas le choix entre workflow et agent."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_007": {
      "correction": {
        "en": "Correct — Correct. State that must survive a session boundary needs persistent storage or a persisted summary.\n\nIncorrect — Incorrect. In-context memory disappears when the session ends, so the next session cannot retrieve it.\n\nIncorrect — Incorrect. A stateless agent retains nothing from prior sessions.\n\nIncorrect — Incorrect. Replaying full history inflates token cost and eventually risks exhausting the context window.",
        "fr": "Correct — Correct. L’état qui doit survivre à la fin d’une session nécessite un stockage persistant ou un résumé persisté.\n\nIncorrect — Incorrect. La mémoire in-context disparaît à la fin de la session ; la session suivante ne peut donc pas la récupérer.\n\nIncorrect — Incorrect. Un agent stateless ne conserve rien des sessions antérieures.\n\nIncorrect — Incorrect. Rejouer l’historique complet gonfle le coût en tokens et risque à terme d’épuiser la fenêtre de contexte."
      },
      "correctOptionIds": [
        "a"
      ]
    },
    "ex_claude_certified_developer_foundations__02_checkpoint_008": {
      "correction": {
        "en": "Correct — Correct. For a large asset reused across requests or turns, a file ID avoids repeatedly sending the full bytes.\n\nIncorrect — Incorrect. Repeated inline base64 sends the full payload every time and can dominate request size and latency.\n\nIncorrect — Incorrect. URL references require a stable, public, reachable URL when Claude fetches the asset.\n\nIncorrect — Incorrect. PDFs consume context budget, and the document block is the supported multimodal structure for sending them.",
        "fr": "Correct — Correct. Pour un actif volumineux réutilisé entre requêtes ou tours, un file ID évite de renvoyer les octets complets à répétition.\n\nIncorrect — Incorrect. Le base64 intégré renvoie la charge utile complète à chaque fois et peut dominer la taille et la latence des requêtes.\n\nIncorrect — Incorrect. Les références URL exigent une URL stable, publique et accessible au moment où Claude récupère l’actif.\n\nIncorrect — Incorrect. Les PDF consomment du budget de contexte, et le bloc document est la structure multimodale prévue pour les envoyer."
      },
      "correctOptionIds": [
        "a"
      ]
    }
  },
  "claude_certified_developer_foundations__03": {
    "ex_claude_certified_developer_foundations__03_001": {
      "correction": {
        "en": "Checklist and concrete rules a correct answer should include\n\n1. Decision rule (single question)\n- Ask: “What is the worst plausible outcome if this action runs without human approval?”  \n- If low cost and easily reversible → allow. If high cost, hard to undo, or touches sensitive assets → gate.\n\n2. Concrete categories and examples\n- Low-stakes (no gate): formatting, linting, working-directory-only edits, adding comments, test-only changes.\n- Gate required: writes outside the working directory, edits to protected/security files, DB schema changes, production deploys, destructive shell commands, creation or rotation of secrets, external-network actions (API calls that change production state), CI/CD pipeline changes.\n\n3. “Hard to undo” heuristics\n- Irreversibility (data deletion, irreversible migration)\n- High blast radius (affects many users/systems)\n- Regulatory or security impact (PII, credentials)\n- Manual or cross-team rollback required\n\n4. Example deny-rule pseudocode (deterministic)\n- deny if action.type == \"write\" and not path.startsWith(workspace/)\n- deny if action.type == \"shell\" and command.matches(/(^|;)\\s*(rm -rf|mkfs|dd\\s+if=)/)\n- deny if path in [\"config/credentials.yaml\",\"deploy/production.yml\",\"/etc/*\"]\n- deny if action.type == \"network\" and target.env == \"production\"\n\n5. Human-review workflow\n- Surface a concise plan + diff + risk rationale\n- Require named approver(s) and capture decision and audit log\n- Provide explicit rollback instructions and tests\n\nA strong student answer maps actions to these rules, gives examples, and shows at least one concrete, deterministic deny rule.",
        "fr": "Bonne réponse cible — actions concrètes et règles à appliquer :\n\nRègle unique : demandez-vous “quel est le pire résultat si cette action s’exécute sans vérification humaine ?”. Placez la barrière en fonction du coût de ce pire scénario.\n\nExemples concrets\n- Autoriser sans revue (acceptEdits) : corrections de formatage, edits confinés au working_directory, modifications de fichiers temporaires réversibles. Risque faible, facile à revert.\n- Bloquer ou exiger approbation humaine : écriture hors du working_directory, commandes shell destructrices (rm -rf, drop table), modifications de fichiers de sécurité/config prod, déploiements CI/CD, accès ou exfiltration de secrets, modifications de comptes/permissions. Risque élevé (données perdues, outages, fuite, compliance).\n\nDeny rules recommandées (phrases exploitables)\n- deny if write_target ∉ working_directory\n- deny if command matches destructive_shell_patterns\n- deny if touched_file ∈ {secrets, infra, deploy scripts, /etc, config/*.pem}\n\nMode opérationnel\n- use acceptEdits for low-risk automations\n- use default/plan mode to surface actions for human decision\n- enforce deny rules to deterministically block high-risk actions\n\nChecklist pour décider (utiliser avant chaque autorisation)\n1. Pire scénario concret ?\n2. Reversibilité (git revert, backups) ?\n3. Blast radius (utilisateurs/systèmes affectés) ?\n4. Données sensibles impliquées ?\n5. Nécessité de privilèges élevés ?\n6. Temps/coût pour corriger si erreur ?\n\nRépondez en appliquant ces règles et exemples aux actions de votre agent."
      },
      "rubric": "",
      "correctOptionIds": []
    }
  },
  "claude_certified_developer_foundations__05": {
    "ex_claude_certified_developer_foundations__05_002": {
      "correction": {
        "en": "Fix: make the customer-specific value a parameter and validate it. Example corrected agent_template.py:\n\n```python\n# agent_template.py : reusable code-review agent\ndef build_review_agent(customer_name, model=\"claude-2\", system_prompt=None):\n    \"\"\"\n    Build a reusable code-review agent for the given customer.\n    Params:\n      - customer_name (str): customer-specific value previously hardcoded\n      - model (str): optional model identifier\n      - system_prompt (str): optional custom system prompt template\n    Returns:\n      - agent(review_text) -> response payload (or call)\n    \"\"\"\n    if not isinstance(customer_name, str) or not customer_name.strip():\n        raise ValueError(\"customer_name must be a non-empty string\")\n\n    # Provide a default prompt that includes the customer parameter\n    system_prompt = system_prompt or (\n        f\"You are a code-review assistant for {customer_name}. \"\n        \"Give concise, prioritized, actionable review comments and examples.\"\n    )\n\n    def agent(review_text):\n        prompt = system_prompt + \"\\n\\nCode to review:\\n\" + review_text\n        # Example: call the model / API here; return constructed payload for reuse\n        return {\"model\": model, \"prompt\": prompt}\n\n    return agent\n```\n\nUsage:\nagent = build_review_agent(\"Acme Corp\")\nresp = agent(\"def foo(): pass\")\n# This ensures the template is reusable for any customer.",
        "fr": "Problème observé : une valeur spécifique au client était codée en dur dans le gabarit (ex. \"AcmeCorp\"), rendant l’accélérateur non réutilisable. Correction : extraire cette valeur en paramètre, valider, et l’injecter dans le prompt via un template.\n\nExemple corrigé (agent_template.py)\n\ndef build_review_agent(client_name, prompt_template=None, language=\"fr\"):\n    \"\"\"\n    Construit un agent de revue réutilisable.\n    - client_name (str) : valeur requise (ne pas hard-coder).\n    - prompt_template (str) : template avec '{client}' pour substitution.\n    \"\"\"\n    if not client_name or not isinstance(client_name, str):\n        raise ValueError(\"client_name must be a non-empty string\")\n\n    if prompt_template is None:\n        prompt_template = (\n            \"Vous êtes un relecteur de code pour le client '{client}'. \"\n            \"Fournissez un résumé, issues et suggestions.\"\n        )\n\n    class ReviewAgent:\n        def __init__(self, client, prompt, lang):\n            self.client = client\n            self.prompt = prompt\n            self.lang = lang\n\n        def build_prompt(self, code_snippet):\n            return self.prompt.format(client=self.client) + \"\\n\\nCode:\\n\" + code_snippet\n\n        def review(self, code_snippet):\n            # Ici appeler le modèle réel; simulé pour le gabarit\n            prompt = self.build_prompt(code_snippet)\n            return {\n                \"prompt_used\": prompt,\n                \"summary\": f\"Résumé simulé pour {self.client}\",\n                \"issues\": [],\n                \"suggestions\": []\n            }\n\n    return ReviewAgent(client_name, prompt_template, language)\n\nUsage exemple :\nagent = build_review_agent(\"AcmeCorp\")\nres = agent.review(\"def foo(): pass\")\nprint(res[\"prompt_used\"])\n\nPoints clés à respecter :\n- Ne pas hard-coder de données spécifiques au client.\n- Exposer paramètres clairs et documentés.\n- Valider les entrées.\n- Utiliser des templates sûrs (format plutôt que concaténation fragile).\n- Fournir usage/pytest minimal pour vérifier réutilisabilité."
      },
      "rubric": "",
      "correctOptionIds": []
    }
  }
} as const;
