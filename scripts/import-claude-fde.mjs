import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const coursesDir = path.join(root, "client", "public", "data", "courses");

const i18n = (en, fr) => ({ en, fr });
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const source = {
  provider: "Anthropic Partner Academy / Skilljar",
  pathUrl: "https://anthropic-partners.skilljar.com/path/claude-fde",
  observedAt: "2026-10-18",
  sourceLanguage: "en",
  usage: "Original bilingual Neopolis Akademy synthesis from authenticated course structure and verified learning objectives; no source paragraphs, proprietary case studies, or non-provided assets reproduced.",
};

const deliveryLessons = [
  {
    title: i18n("Use case identification and qualification", "Identifier et qualifier un cas d’usage"),
    description: i18n("Decide whether a use case is worth piloting before allocating delivery capacity.", "Décider si un cas d’usage mérite un pilote avant de mobiliser une capacité de déploiement."),
    body: i18n(
      "## Qualify before you pilot\n\nA useful pilot is not simply a demonstration that a team can use an AI tool. It tests a **specific change in work** and produces evidence that a decision-maker can review. Separate a marginal gain — the same task completed a little faster — from a structural gain, where the unit of work, lead time, or feasible scope changes.\n\nAssess each candidate on four questions: does enough work recur to observe a pattern; is the work complex enough for meaningful leverage; can a baseline be captured before the start; and is the team ready to change its workflow? A weakness in measurability is a signal to redesign the scope before launching.\n\n**Akademy practice.** Write a one-sentence use case, identify the baseline, then name the owner who will confirm the result at the pilot readout.",
      "## Qualifier avant de lancer un pilote\n\nUn pilote utile ne consiste pas seulement à démontrer qu’une équipe peut utiliser un outil d’IA. Il teste un **changement de travail précis** et produit une preuve qu’une personne décisionnaire peut examiner. Distinguez un gain marginal — la même tâche réalisée un peu plus vite — d’un gain structurel, où l’unité de travail, le délai ou le périmètre réalisable change.\n\nÉvaluez chaque candidat selon quatre questions : le travail se répète-t-il assez pour observer une tendance ; sa complexité permet-elle un levier significatif ; une référence de départ peut-elle être relevée avant le début ; et l’équipe est-elle prête à faire évoluer son flux de travail ? Une faiblesse sur la mesurabilité invite à revoir le périmètre avant le lancement.\n\n**Mise en pratique Akademy.** Rédigez le cas d’usage en une phrase, identifiez la référence de départ, puis nommez la personne qui confirmera le résultat lors de la restitution du pilote."
    ),
    question: i18n("Which condition is essential before claiming a pilot’s return on investment?", "Quelle condition est indispensable avant d’affirmer le retour sur investissement d’un pilote ?"),
    options: [
      i18n("A baseline that can be compared with an agreed outcome", "Une référence de départ comparable à un résultat convenu"),
      i18n("The largest possible participant group", "Le groupe de participants le plus large possible"),
      i18n("A demonstration with no named owner", "Une démonstration sans responsable désigné"),
      i18n("A task that occurs only once", "Une tâche qui ne se produit qu’une seule fois")
    ],
    correct: "a",
    explanation: i18n("A baseline makes a later comparison possible; without it, a positive impression is not a defensible ROI result.", "Une référence de départ rend la comparaison ultérieure possible ; sans elle, une impression positive ne constitue pas un résultat ROI défendable.")
  },
  {
    title: i18n("Pilot design", "Concevoir le pilote"),
    description: i18n("Define a pilot that yields a decision, rather than an open-ended trial.", "Définir un pilote qui mène à une décision plutôt qu’à un essai sans fin."),
    body: i18n(
      "## Design for a decision\n\nA pilot needs a bounded cohort, a defined workflow, a time window, and a success criterion agreed before participants begin. Keep the first scope narrow enough that the team can observe what changes, yet representative enough to matter to the business.\n\nDescribe what participants will do, what remains under human judgment, what data may be used, and when the team will pause to review progress. A midpoint check protects the pilot from drifting into unrelated experimentation.\n\n**Akademy practice.** Write a pilot brief with one use case, one owner, one cohort, one baseline, and one end-of-pilot decision: continue, adapt, or stop.",
      "## Concevoir pour décider\n\nUn pilote a besoin d’une cohorte limitée, d’un flux de travail défini, d’une fenêtre de temps et d’un critère de réussite convenu avant que les participants ne commencent. Gardez le premier périmètre assez restreint pour observer ce qui change, tout en restant suffisamment représentatif pour compter pour l’activité.\n\nDécrivez ce que feront les participants, ce qui demeure sous jugement humain, quelles données peuvent être utilisées et à quel moment l’équipe s’arrêtera pour examiner l’avancement. Un point d’étape intermédiaire évite que le pilote ne dérive vers une expérimentation sans rapport.\n\n**Mise en pratique Akademy.** Rédigez une fiche pilote avec un cas d’usage, un responsable, une cohorte, une référence de départ et une décision de fin de pilote : poursuivre, adapter ou arrêter."
    ),
    question: i18n("What best prevents a pilot from becoming an open-ended experiment?", "Qu’est-ce qui empêche le mieux un pilote de devenir une expérimentation sans fin ?"),
    options: [
      i18n("A predefined scope, review cadence, and decision criterion", "Un périmètre, une cadence de revue et un critère de décision définis à l’avance"),
      i18n("Adding new use cases whenever someone requests them", "Ajouter de nouveaux cas d’usage dès qu’une personne les demande"),
      i18n("Removing the named business owner", "Supprimer le responsable métier désigné"),
      i18n("Waiting until the end to define success", "Attendre la fin pour définir la réussite")
    ],
    correct: "a",
    explanation: i18n("A bounded design and explicit decision rule turn observed work into evidence rather than an indefinite trial.", "Un dispositif borné et une règle de décision explicite transforment le travail observé en preuve plutôt qu’en essai indéfini.")
  },
  {
    title: i18n("ROI measurement", "Mesurer le ROI"),
    description: i18n("Build a measurement plan that links adoption evidence to the stated use case.", "Construire un plan de mesure qui relie les preuves d’adoption au cas d’usage annoncé."),
    body: i18n(
      "## Measure the change, not the excitement\n\nAn ROI scorecard begins with the baseline chosen during qualification. Pair an operational measure — for example cycle time, volume completed, or rework — with an adoption measure that shows whether the new workflow was actually used.\n\nKeep the measurement traceable to the pilot’s original hypothesis. Record the observation method, the time period, and the limits of interpretation. Numbers can support a decision only when they are comparable and understood in context.\n\n**Akademy practice.** Define one leading indicator that can be seen during the pilot and one outcome indicator to review at closeout.",
      "## Mesurer le changement, pas l’enthousiasme\n\nUn tableau de bord ROI commence par la référence de départ choisie lors de la qualification. Associez une mesure opérationnelle — par exemple le délai de cycle, le volume réalisé ou les reprises — à une mesure d’adoption qui montre si le nouveau flux a réellement été utilisé.\n\nGardez la mesure traçable à l’hypothèse initiale du pilote. Consignez la méthode d’observation, la période et les limites d’interprétation. Les chiffres ne peuvent étayer une décision que s’ils sont comparables et compris dans leur contexte.\n\n**Mise en pratique Akademy.** Définissez un indicateur avancé observable pendant le pilote et un indicateur de résultat à examiner lors de la clôture."
    ),
    question: i18n("Which pair best supports a pilot ROI review?", "Quelle paire soutient le mieux une revue ROI de pilote ?"),
    options: [
      i18n("A baseline-linked workflow measure and an adoption measure", "Une mesure de flux liée à une référence de départ et une mesure d’adoption"),
      i18n("A list of favorite features and a launch date", "Une liste de fonctionnalités préférées et une date de lancement"),
      i18n("A single anecdote and an untracked estimate", "Une seule anecdote et une estimation non suivie"),
      i18n("A metric collected only before the pilot", "Une métrique collectée uniquement avant le pilote")
    ],
    correct: "a",
    explanation: i18n("The two measures connect whether the workflow was adopted with what changed relative to the agreed baseline.", "Ces deux mesures relient l’adoption réelle du flux à ce qui a changé par rapport à la référence convenue.")
  },
  {
    title: i18n("Phased rollout and change management", "Déploiement par étapes et conduite du changement"),
    description: i18n("Move from a pilot to broader use without losing learning or accountability.", "Passer d’un pilote à un usage plus large sans perdre l’apprentissage ni la responsabilité."),
    body: i18n(
      "## Expand with evidence\n\nA pilot is a learning stage, not an automatic mandate to deploy everywhere. Use the pilot readout to decide which conditions are ready to repeat and which must change first. Sequence the rollout by use case, team readiness, and support capacity.\n\nChange management is practical: explain why the workflow changes, provide a route for questions, make boundaries visible, and feed observed friction back into the next phase. Keep the successful pattern reusable without pretending every team starts from the same point.\n\n**Akademy practice.** For the next cohort, state what stays constant, what will be adapted, and who can approve the change.",
      "## Étendre avec des preuves\n\nUn pilote est une étape d’apprentissage, pas un mandat automatique de déployer partout. Utilisez la restitution du pilote pour décider quelles conditions sont prêtes à être reproduites et lesquelles doivent d’abord évoluer. Séquencez le déploiement selon le cas d’usage, la maturité des équipes et la capacité d’accompagnement.\n\nLa conduite du changement est concrète : expliquez pourquoi le flux évolue, prévoyez un canal de questions, rendez les limites visibles et réinjectez les frictions observées dans la phase suivante. Rendez le modèle réussi réutilisable sans prétendre que toutes les équipes partent du même point.\n\n**Mise en pratique Akademy.** Pour la cohorte suivante, indiquez ce qui reste stable, ce qui sera adapté et qui peut valider le changement."
    ),
    question: i18n("What should determine the order of a broader rollout?", "Qu’est-ce qui doit déterminer l’ordre d’un déploiement plus large ?"),
    options: [
      i18n("Evidence from the pilot, team readiness, and support capacity", "Les preuves du pilote, la maturité des équipes et la capacité d’accompagnement"),
      i18n("The alphabetical order of department names", "L’ordre alphabétique des départements"),
      i18n("The number of feature requests", "Le nombre de demandes de fonctionnalités"),
      i18n("A promise to deploy to everyone on the same day", "Une promesse de déployer pour tout le monde le même jour")
    ],
    correct: "a",
    explanation: i18n("Phasing should reproduce demonstrated conditions while keeping support and change capacity realistic.", "Le déploiement par étapes doit reproduire des conditions démontrées tout en gardant réalistes la capacité de support et de changement.")
  },
  {
    title: i18n("Champion enablement and internal documentation", "Habiliter les champions et documenter en interne"),
    description: i18n("Equip peers to make adoption repeatable, safe, and visible.", "Outiller les pairs afin de rendre l’adoption répétable, sûre et visible."),
    body: i18n(
      "## Turn local learning into shared capability\n\nChampions make a rollout durable when their role is clear: they model the workflow, gather questions, surface limits, and connect colleagues to the right support. They are not a substitute for accountable owners or technical governance.\n\nInternal documentation should preserve decisions that people can reuse: the chosen use case, known boundaries, approved workflow steps, measurement definitions, and a route for feedback. Short, maintained guidance is more useful than a large document that nobody can update.\n\n**Akademy practice.** Create a one-page champion brief: audience, recurring task, safe starting point, escalation path, and one metric to observe.",
      "## Transformer l’apprentissage local en capacité partagée\n\nLes champions rendent un déploiement durable lorsque leur rôle est clair : ils modélisent le flux, recueillent les questions, signalent les limites et orientent les collègues vers le bon support. Ils ne remplacent ni les responsables redevables ni la gouvernance technique.\n\nLa documentation interne doit préserver des décisions réutilisables : le cas d’usage choisi, les limites connues, les étapes approuvées du flux, les définitions de mesure et un canal de retour. Un guide court et maintenu vaut mieux qu’un document volumineux que personne ne peut mettre à jour.\n\n**Mise en pratique Akademy.** Créez une fiche champion d’une page : public, tâche récurrente, point de départ sûr, voie d’escalade et métrique à observer."
    ),
    question: i18n("What is an appropriate champion responsibility?", "Quelle responsabilité convient à un champion ?"),
    options: [
      i18n("Model the approved workflow and surface recurring questions", "Modéliser le flux approuvé et faire remonter les questions récurrentes"),
      i18n("Independently approve all governance exceptions", "Approuver seul toutes les exceptions de gouvernance"),
      i18n("Replace every delivery owner", "Remplacer tous les responsables de déploiement"),
      i18n("Keep useful practices undocumented", "Garder les pratiques utiles non documentées")
    ],
    correct: "a",
    explanation: i18n("Champions amplify a defined practice and feedback loop; ownership and governance remain explicit elsewhere.", "Les champions amplifient une pratique définie et une boucle de retour ; la responsabilité et la gouvernance restent explicites ailleurs.")
  },
  {
    title: i18n("Preempting common failure modes", "Prévenir les échecs fréquents"),
    description: i18n("Recognize early signals that a delivery engagement is losing its decision value.", "Reconnaître les signaux précoces qu’un engagement de déploiement perd sa valeur de décision."),
    body: i18n(
      "## Protect the learning loop\n\nCommon delivery failures are usually visible early: a use case keeps changing, no baseline is available, nobody owns the outcome, the cohort is too broad to support, or participants are asked to adopt a workflow without time or guidance.\n\nDo not hide these signals with more activity. Reframe the scope, pause expansion, or return to qualification. A short, honest correction is safer than accumulating evidence that cannot answer the original question.\n\n**Akademy practice.** Add a risk check to each review: scope stability, baseline availability, accountable owner, participant support, and feedback route.",
      "## Protéger la boucle d’apprentissage\n\nLes échecs fréquents de déploiement sont souvent visibles tôt : le cas d’usage change sans cesse, aucune référence de départ n’est disponible, personne ne porte le résultat, la cohorte est trop large pour être accompagnée ou les participants doivent adopter un flux sans temps ni guidance.\n\nNe masquez pas ces signaux en ajoutant de l’activité. Recadrez le périmètre, suspendez l’extension ou revenez à la qualification. Une correction courte et honnête est plus sûre que l’accumulation de preuves incapables de répondre à la question initiale.\n\n**Mise en pratique Akademy.** Ajoutez un contrôle de risque à chaque revue : stabilité du périmètre, disponibilité de la référence, responsable redevable, accompagnement des participants et canal de retour."
    ),
    question: i18n("Which early signal calls for reframing rather than expanding a pilot?", "Quel signal précoce appelle à recadrer plutôt qu’à étendre un pilote ?"),
    options: [
      i18n("No agreed baseline exists for the claimed outcome", "Aucune référence de départ convenue n’existe pour le résultat revendiqué"),
      i18n("The team schedules a midpoint review", "L’équipe planifie une revue à mi-parcours"),
      i18n("A named owner attends the readout", "Un responsable désigné participe à la restitution"),
      i18n("The scope is written down", "Le périmètre est écrit")
    ],
    correct: "a",
    explanation: i18n("Without a baseline, the team cannot make the comparison needed for the pilot’s stated decision.", "Sans référence de départ, l’équipe ne peut pas réaliser la comparaison nécessaire à la décision annoncée pour le pilote.")
  },
  {
    title: i18n("30-day Claude Code activation", "Activation Claude Code sur 30 jours"),
    description: i18n("Run a short, structured activation from kickoff to a clear closeout decision.", "Mener une activation courte et structurée, du lancement à une décision claire de clôture."),
    body: i18n(
      "## A structured 30-day activation\n\nA short activation has four moments: prepare the cohort and baseline; begin a defined workflow; review evidence in the middle; and close with an accountable decision. The rhythm matters because it lets a team correct course while the work is still active.\n\nAt closeout, review the original use case, the measures, the participant feedback, and the conditions needed for a next cohort. The result may be to continue, adapt, or stop. Treating any outcome as evidence protects the credibility of the delivery process.\n\n**Akademy practice.** Put the kickoff, midpoint review, and closeout on the calendar before participants start.",
      "## Une activation structurée sur 30 jours\n\nUne activation courte comporte quatre moments : préparer la cohorte et la référence de départ ; démarrer un flux défini ; examiner les preuves à mi-parcours ; puis clôturer par une décision redevable. Ce rythme compte car il permet à l’équipe de corriger sa trajectoire pendant que le travail est encore actif.\n\nÀ la clôture, examinez le cas d’usage initial, les mesures, les retours des participants et les conditions nécessaires à une cohorte suivante. Le résultat peut être de poursuivre, d’adapter ou d’arrêter. Considérer chaque issue comme une preuve protège la crédibilité du processus de déploiement.\n\n**Mise en pratique Akademy.** Inscrivez au calendrier le lancement, la revue à mi-parcours et la clôture avant le démarrage des participants."
    ),
    question: i18n("When should the midpoint review be planned?", "Quand la revue à mi-parcours doit-elle être planifiée ?"),
    options: [
      i18n("Before the activation starts, as part of its cadence", "Avant le début de l’activation, dans le cadre de sa cadence"),
      i18n("Only if all participants complain", "Uniquement si tous les participants se plaignent"),
      i18n("After the closeout decision", "Après la décision de clôture"),
      i18n("Never; the team should avoid revisiting scope", "Jamais ; l’équipe doit éviter de revisiter le périmètre")
    ],
    correct: "a",
    explanation: i18n("A planned midpoint review provides a safe point to inspect evidence and correct course before closeout.", "Une revue à mi-parcours planifiée offre un point sûr pour examiner les preuves et corriger la trajectoire avant la clôture.")
  }
];

const enterpriseLessons = [
  {
    title: i18n("Welcome to Claude for Enterprise", "Bienvenue dans Claude pour l’entreprise"),
    description: i18n("Frame enterprise adoption as a coordinated transformation, not a one-time tool launch.", "Poser l’adoption d’entreprise comme une transformation coordonnée, non comme le lancement ponctuel d’un outil."),
    body: i18n(
      "## Start with a shared adoption purpose\n\nEnterprise adoption combines technical setup, coordinated enablement, communication, and measurement. The source course frames the person leading implementation as responsible for bringing these elements together rather than treating them as separate projects.\n\nThe practical toolkit includes configuration checklists, adoption strategy templates, surveys, communication materials, enablement frameworks, and guidance for champions and train-the-trainer programmes. Use them as guideposts and adapt them to the organization’s context.\n\n**Akademy practice.** Name the sponsor, the implementation lead, and the first decision the adoption programme must support.",
      "## Commencer par un objectif d’adoption partagé\n\nL’adoption en entreprise combine la configuration technique, l’enablement coordonné, la communication et la mesure. Le cours source présente la personne qui pilote l’implémentation comme responsable de réunir ces éléments plutôt que de les traiter comme des projets séparés.\n\nLa boîte à outils pratique comprend des checklists de configuration, des modèles de stratégie d’adoption, des enquêtes, des supports de communication, des cadres d’enablement et une guidance pour les programmes champions et train-the-trainer. Utilisez-les comme repères, puis adaptez-les au contexte de l’organisation.\n\n**Mise en pratique Akademy.** Nommez le sponsor, le responsable d’implémentation et la première décision que le programme d’adoption doit éclairer."
    ),
    question: i18n("Which approach best reflects enterprise adoption?", "Quelle approche reflète le mieux l’adoption en entreprise ?"),
    options: [
      i18n("Coordinate setup, enablement, communication, and measurement", "Coordonner configuration, enablement, communication et mesure"),
      i18n("Launch access and assume use will follow", "Ouvrir les accès et supposer que l’usage suivra"),
      i18n("Treat each team as unrelated to the others", "Traiter chaque équipe comme indépendante des autres"),
      i18n("Measure success only once, before launch", "Mesurer la réussite une seule fois, avant le lancement")
    ],
    correct: "a",
    explanation: i18n("The course presents adoption as a coordinated programme, not only a technical provision of access.", "Le cours présente l’adoption comme un programme coordonné, et non comme la seule fourniture technique d’un accès.")
  },
  {
    title: i18n("What is the ‘Activation’ phase?", "Qu’est-ce que la phase « Activation » ?"),
    description: i18n("Establish the initial conditions for a responsible and supported rollout.", "Mettre en place les conditions initiales d’un déploiement responsable et accompagné."),
    body: i18n(
      "## Activation: build the foundation\n\nThe source roadmap positions Activation in the first one to two months. Its purpose is to establish the operating conditions for adoption: the right people are coordinated, configuration work is planned, communication is ready, and the first enablement route is known.\n\nActivation is not a promise of immediate scale. It creates enough clarity for early users to begin safely, ask questions, and generate useful feedback. Define what must be ready before launch and what will be learned during the first cycle.\n\n**Akademy practice.** Separate launch prerequisites from learning questions so that a missing answer does not become an invisible risk.",
      "## Activation : construire les fondations\n\nLa feuille de route source situe l’Activation au cours du premier ou des deux premiers mois. Son objectif est de mettre en place les conditions de fonctionnement de l’adoption : les bonnes personnes sont coordonnées, le travail de configuration est planifié, la communication est prête et le premier parcours d’enablement est connu.\n\nL’activation ne promet pas une mise à l’échelle immédiate. Elle crée assez de clarté pour que les premiers utilisateurs puissent démarrer en sécurité, poser des questions et produire des retours utiles. Définissez ce qui doit être prêt avant le lancement et ce qui sera appris pendant le premier cycle.\n\n**Mise en pratique Akademy.** Séparez les prérequis de lancement des questions d’apprentissage afin qu’une réponse manquante ne devienne pas un risque invisible."
    ),
    question: i18n("What is the main purpose of Activation?", "Quel est le but principal de l’Activation ?"),
    options: [
      i18n("Create the initial conditions for a supported first rollout", "Créer les conditions initiales d’un premier déploiement accompagné"),
      i18n("Scale every use case immediately", "Mettre immédiatement à l’échelle tous les cas d’usage"),
      i18n("Avoid collecting early feedback", "Éviter de recueillir les premiers retours"),
      i18n("Replace all local workflows at once", "Remplacer tous les flux locaux d’un coup")
    ],
    correct: "a",
    explanation: i18n("Activation establishes readiness and learning conditions before broader scaling.", "L’activation établit la préparation et les conditions d’apprentissage avant une mise à l’échelle plus large.")
  },
  {
    title: i18n("Administrative Pre-work: Assembling Your Success Team", "Travail préparatoire : réunir l’équipe de réussite"),
    description: i18n("Clarify cross-functional responsibility before users are asked to change how they work.", "Clarifier la responsabilité transversale avant de demander aux utilisateurs de modifier leur façon de travailler."),
    body: i18n(
      "## Assemble accountable roles\n\nAn adoption programme needs named ownership across business sponsorship, implementation coordination, technical administration, enablement, and feedback collection. One person may cover several roles in a small organization, but the responsibilities should still be visible.\n\nAgree how the team will make decisions, where questions will be collected, and when issues need escalation. This reduces the risk that early users receive conflicting instructions or no support.\n\n**Akademy practice.** Build a simple responsibility map: decision owner, technical contact, learner-support contact, and feedback facilitator.",
      "## Réunir des rôles redevables\n\nUn programme d’adoption a besoin de responsabilités nommées pour le sponsoring métier, la coordination d’implémentation, l’administration technique, l’enablement et la collecte de retours. Dans une petite organisation, une même personne peut couvrir plusieurs rôles, mais les responsabilités doivent rester visibles.\n\nConvenez de la manière dont l’équipe prendra ses décisions, du lieu où seront collectées les questions et du moment où les problèmes doivent être escaladés. Cela réduit le risque que les premiers utilisateurs reçoivent des instructions contradictoires ou aucun accompagnement.\n\n**Mise en pratique Akademy.** Établissez une carte simple des responsabilités : propriétaire de décision, contact technique, contact support apprenant et facilitateur des retours."
    ),
    question: i18n("Why name responsibilities before launch?", "Pourquoi nommer les responsabilités avant le lancement ?"),
    options: [
      i18n("To make decisions, support, and escalation routes visible", "Pour rendre visibles les décisions, le support et les voies d’escalade"),
      i18n("To eliminate feedback from learners", "Pour éliminer les retours des apprenants"),
      i18n("To let each user set independent policy", "Pour laisser chaque utilisateur définir une politique indépendante"),
      i18n("To postpone all coordination until after launch", "Pour reporter toute coordination après le lancement")
    ],
    correct: "a",
    explanation: i18n("Visible accountability helps early users receive consistent guidance and routes issues to the right owner.", "Une responsabilité visible aide les premiers utilisateurs à recevoir une guidance cohérente et oriente les problèmes vers le bon responsable.")
  },
  {
    title: i18n("Provisioning Claude", "Provisionner Claude"),
    description: i18n("Prepare access and operating expectations before inviting the first cohort.", "Préparer l’accès et les attentes d’utilisation avant d’inviter la première cohorte."),
    body: i18n(
      "## Prepare access deliberately\n\nProvisioning is more than sending invitations. Before access is offered, agree who is in the first cohort, what support they receive, which operating expectations apply, and where configuration questions go.\n\nUse a checklist so that technical administration and learner communication stay aligned. When a condition is uncertain, record it and assign an owner rather than asking participants to infer the answer.\n\n**Akademy practice.** Review cohort access, support contact, communication timing, and any organization-specific boundaries together before the invitation is sent.",
      "## Préparer l’accès délibérément\n\nLe provisionnement ne consiste pas seulement à envoyer des invitations. Avant d’ouvrir l’accès, convenez de la première cohorte, du support qu’elle recevra, des attentes de fonctionnement applicables et du point d’entrée pour les questions de configuration.\n\nUtilisez une checklist afin que l’administration technique et la communication aux apprenants restent alignées. Lorsqu’une condition est incertaine, consignez-la et attribuez un responsable plutôt que de demander aux participants de deviner la réponse.\n\n**Mise en pratique Akademy.** Examinez ensemble l’accès de la cohorte, le contact support, le calendrier de communication et les limites propres à l’organisation avant l’envoi des invitations."
    ),
    question: i18n("What should accompany first-cohort access?", "Qu’est-ce qui doit accompagner l’accès de la première cohorte ?"),
    options: [
      i18n("Clear support, communication, and operating expectations", "Un support, une communication et des attentes de fonctionnement clairs"),
      i18n("No contact point for questions", "Aucun point de contact pour les questions"),
      i18n("An assumption that every user has the same context", "L’hypothèse que tous les utilisateurs ont le même contexte"),
      i18n("A request to configure everything independently", "Une demande de tout configurer individuellement")
    ],
    correct: "a",
    explanation: i18n("Access works as part of a supported operating model, not as an isolated administrative action.", "L’accès fonctionne dans le cadre d’un modèle d’utilisation accompagné, et non comme une action administrative isolée.")
  },
  {
    title: i18n("Creating a culture for successful change management", "Créer une culture propice à la conduite du changement"),
    description: i18n("Make learning, questions, and responsible experimentation part of the rollout.", "Faire de l’apprentissage, des questions et de l’expérimentation responsable une partie du déploiement."),
    body: i18n(
      "## Make change discussable\n\nPeople adopt a new way of working when they understand why it matters, how it affects their work, and where they can raise concerns. Leadership sponsorship gives the programme legitimacy, while practical examples make it relevant to everyday tasks.\n\nTreat questions and early friction as signals to improve communication or enablement. Avoid promising that every task will change in the same way; adoption is more credible when limits and human responsibilities are explicit.\n\n**Akademy practice.** Prepare a short message that states the purpose, one safe first action, one boundary, and the channel for feedback.",
      "## Rendre le changement discutable\n\nLes personnes adoptent une nouvelle façon de travailler lorsqu’elles comprennent pourquoi elle compte, comment elle affecte leur travail et où elles peuvent faire remonter leurs préoccupations. Le sponsoring de la direction donne de la légitimité au programme, tandis que des exemples pratiques le rendent pertinent pour les tâches quotidiennes.\n\nConsidérez les questions et les premières frictions comme des signaux d’amélioration de la communication ou de l’enablement. Évitez de promettre que chaque tâche changera de la même façon ; l’adoption est plus crédible lorsque les limites et les responsabilités humaines sont explicites.\n\n**Mise en pratique Akademy.** Préparez un message court qui énonce l’objectif, une première action sûre, une limite et le canal de retour."
    ),
    question: i18n("What supports successful change management?", "Qu’est-ce qui soutient une conduite du changement réussie ?"),
    options: [
      i18n("A clear purpose, practical examples, and a feedback route", "Un objectif clair, des exemples pratiques et un canal de retour"),
      i18n("Hiding the limits of the rollout", "Masquer les limites du déploiement"),
      i18n("Forbidding questions during the first cycle", "Interdire les questions pendant le premier cycle"),
      i18n("Assuming every role changes identically", "Supposer que chaque rôle évolue de manière identique")
    ],
    correct: "a",
    explanation: i18n("Meaningful purpose, relevant practice, and feedback make the change easier to understand and improve.", "Un objectif porteur de sens, une pratique pertinente et les retours rendent le changement plus compréhensible et améliorable.")
  },
  {
    title: i18n("Enabling your organization", "Habiliter votre organisation"),
    description: i18n("Design practical learning and support around real work, not generic announcements.", "Concevoir un apprentissage et un support pratiques autour du travail réel, plutôt que des annonces génériques."),
    body: i18n(
      "## Enable people in context\n\nEnablement connects shared principles to the work people actually perform. Offer a clear starting point, examples appropriate to the audience, a place to ask questions, and a route to improve material based on what users encounter.\n\nDo not confuse a single training event with sustained capability. Reinforcement, peer support, and accessible internal guidance help people return to the workflow when the first session is over.\n\n**Akademy practice.** Pair each audience with one recurring task, one learning resource, one support route, and one observation you will use to improve the next session.",
      "## Habiliter les personnes dans leur contexte\n\nL’enablement relie des principes partagés au travail réellement effectué. Proposez un point de départ clair, des exemples adaptés au public, un espace pour poser des questions et une voie pour améliorer les supports selon ce que rencontrent les utilisateurs.\n\nNe confondez pas un événement de formation unique avec une capacité durable. Le renforcement, le soutien par les pairs et une guidance interne accessible aident les personnes à revenir vers le flux de travail après la première session.\n\n**Mise en pratique Akademy.** Associez à chaque public une tâche récurrente, une ressource d’apprentissage, une voie de support et une observation qui permettra d’améliorer la session suivante."
    ),
    question: i18n("What makes enablement sustainable?", "Qu’est-ce qui rend l’enablement durable ?"),
    options: [
      i18n("Reinforcement, peer support, and maintained guidance around real work", "Le renforcement, le soutien des pairs et une guidance maintenue autour du travail réel"),
      i18n("One generic announcement with no follow-up", "Une annonce générique unique sans suivi"),
      i18n("Training that ignores recurring tasks", "Une formation qui ignore les tâches récurrentes"),
      i18n("No opportunity to improve materials", "Aucune possibilité d’améliorer les supports")
    ],
    correct: "a",
    explanation: i18n("Capability is sustained when learning, support, and guidance continue beyond a first session.", "La capacité se maintient lorsque l’apprentissage, le support et la guidance continuent au-delà d’une première session.")
  },
  {
    title: i18n("Launch", "Lancement"),
    description: i18n("Coordinate the first live moment so learners know what to do and where to get help.", "Coordonner le premier moment de mise en œuvre afin que les apprenants sachent quoi faire et où obtenir de l’aide."),
    body: i18n(
      "## Launch with a visible path\n\nA launch is a coordinated moment, not just an announcement. Participants should know why they were invited, the first action to take, where to find the relevant guidance, and how to request help.\n\nUse the launch to confirm the feedback loop and the next review date. A welcoming experience can invite curiosity, but it should not obscure responsibilities, boundaries, or the fact that learning will continue after day one.\n\n**Akademy practice.** Test the invitation, first-step instructions, support route, and feedback form with one colleague before sending them to the cohort.",
      "## Lancer avec un parcours visible\n\nUn lancement est un moment coordonné, pas seulement une annonce. Les participants doivent savoir pourquoi ils sont invités, quelle première action mener, où trouver la guidance pertinente et comment demander de l’aide.\n\nUtilisez le lancement pour confirmer la boucle de retour et la date de la prochaine revue. Une expérience accueillante peut encourager la curiosité, mais elle ne doit pas masquer les responsabilités, les limites ni le fait que l’apprentissage se poursuit après le premier jour.\n\n**Mise en pratique Akademy.** Testez l’invitation, les consignes de première étape, la voie de support et le formulaire de retour avec un collègue avant l’envoi à la cohorte."
    ),
    question: i18n("What should a learner know at launch?", "Que doit savoir un apprenant au lancement ?"),
    options: [
      i18n("The first action, where to find guidance, and how to get help", "La première action, où trouver la guidance et comment obtenir de l’aide"),
      i18n("Only the programme name", "Uniquement le nom du programme"),
      i18n("Nothing until a later review", "Rien avant une revue ultérieure"),
      i18n("How to bypass any support process", "Comment contourner tout processus de support")
    ],
    correct: "a",
    explanation: i18n("A launch should make the first useful action and the support route unambiguous.", "Un lancement doit rendre non ambiguës la première action utile et la voie de support.")
  },
  {
    title: i18n("What is the ‘Acceleration’ phase?", "Qu’est-ce que la phase « Accélération » ?"),
    description: i18n("Scale the patterns that proved useful during activation while keeping feedback active.", "Mettre à l’échelle les pratiques utiles démontrées pendant l’activation tout en gardant les retours actifs."),
    body: i18n(
      "## Acceleration: scale what works\n\nThe source roadmap places Acceleration in months two to six. The emphasis shifts from establishing initial readiness to reinforcing successful patterns, sharing learning across teams, and maintaining an operating rhythm for enablement and review.\n\nAcceleration is not a shortcut around governance or support. It requires enough coordination to help more teams learn from evidence rather than repeat the same early mistakes independently.\n\n**Akademy practice.** Select one validated pattern from Activation and state the support needed to introduce it to a second audience.",
      "## Accélération : mettre à l’échelle ce qui fonctionne\n\nLa feuille de route source situe l’Accélération entre les mois deux et six. L’accent passe de la préparation initiale au renforcement des pratiques réussies, au partage des apprentissages entre équipes et au maintien d’un rythme d’enablement et de revue.\n\nL’accélération n’est pas un raccourci qui contourne la gouvernance ou le support. Elle nécessite assez de coordination pour aider davantage d’équipes à apprendre à partir de preuves plutôt que de répéter indépendamment les mêmes erreurs initiales.\n\n**Mise en pratique Akademy.** Sélectionnez un modèle validé pendant l’Activation et indiquez le support nécessaire pour le présenter à un second public."
    ),
    question: i18n("What changes during Acceleration?", "Qu’est-ce qui évolue pendant l’Accélération ?"),
    options: [
      i18n("Validated patterns are reinforced and shared across more teams", "Les pratiques validées sont renforcées et partagées avec davantage d’équipes"),
      i18n("All review and support stop", "Toute revue et tout support s’arrêtent"),
      i18n("The initial team’s feedback is discarded", "Les retours de l’équipe initiale sont écartés"),
      i18n("Every team must invent a separate operating model", "Chaque équipe doit inventer un modèle de fonctionnement distinct")
    ],
    correct: "a",
    explanation: i18n("Acceleration builds on demonstrated practice while retaining coordination and learning loops.", "L’accélération s’appuie sur des pratiques démontrées tout en conservant la coordination et les boucles d’apprentissage.")
  },
  {
    title: i18n("Building a Center of Excellence", "Construire un centre d’excellence"),
    description: i18n("Create a practical coordination point for adoption learning, support, and repeatable practice.", "Créer un point de coordination concret pour l’apprentissage, le support et les pratiques d’adoption reproductibles."),
    body: i18n(
      "## A Center of Excellence supports the system\n\nA Center of Excellence can reinforce executive commitment, organize continuous learning, make success stories visible, and coordinate reusable enablement. Its purpose is to help teams learn faster from shared experience, not to become a bottleneck for every local decision.\n\nDefine the centre’s remit, the cadence for reviewing evidence, and how teams can contribute patterns and questions. Keep its outputs practical: guidance, examples, learning sessions, and a clear route to the right accountable owners.\n\n**Akademy practice.** State one service your Center of Excellence will provide and one decision it will not centralize.",
      "## Un centre d’excellence soutient le système\n\nUn centre d’excellence peut renforcer l’engagement de la direction, organiser l’apprentissage continu, rendre visibles les réussites et coordonner un enablement réutilisable. Son but est d’aider les équipes à apprendre plus vite à partir d’expériences partagées, non de devenir un goulot d’étranglement pour chaque décision locale.\n\nDéfinissez le périmètre du centre, la cadence de revue des preuves et la manière dont les équipes peuvent contribuer avec des pratiques et des questions. Gardez ses résultats concrets : guidance, exemples, sessions d’apprentissage et une voie claire vers les responsables redevables.\n\n**Mise en pratique Akademy.** Indiquez un service que votre centre d’excellence fournira et une décision qu’il ne centralisera pas."
    ),
    question: i18n("What is a useful Center of Excellence role?", "Quel est un rôle utile pour un centre d’excellence ?"),
    options: [
      i18n("Coordinate reusable learning and make evidence visible", "Coordonner l’apprentissage réutilisable et rendre les preuves visibles"),
      i18n("Block every local decision", "Bloquer chaque décision locale"),
      i18n("Replace business accountability", "Remplacer la responsabilité métier"),
      i18n("Avoid sharing practices across teams", "Éviter de partager les pratiques entre équipes")
    ],
    correct: "a",
    explanation: i18n("The centre helps scale learning and support while accountability remains with the appropriate owners.", "Le centre aide à mettre à l’échelle l’apprentissage et le support, tandis que la responsabilité reste chez les bons responsables.")
  },
  {
    title: i18n("Continuous Train the Trainer Enablement", "Enablement continu Train the Trainer"),
    description: i18n("Help internal trainers pass on useful practice and improve it through each cohort.", "Aider les formateurs internes à transmettre des pratiques utiles et à les améliorer au fil des cohortes."),
    body: i18n(
      "## Enable the people who enable others\n\nTrain-the-trainer programmes make learning repeatable when facilitators have current material, a route to surface questions, and feedback from previous cohorts. Internal trainers should be able to explain the approved starting point while adapting examples to the audience.\n\nKeep the programme continuous: refresh material, compare recurring questions, and share what changed. This avoids treating initial training as a finished handoff.\n\n**Akademy practice.** After each cohort, capture one question to clarify, one example to retain, and one change to test in the next session.",
      "## Habiliter celles et ceux qui habilitent les autres\n\nLes programmes train-the-trainer rendent l’apprentissage reproductible lorsque les animateurs disposent de supports à jour, d’une voie pour faire remonter les questions et de retours des cohortes précédentes. Les formateurs internes doivent pouvoir expliquer le point de départ approuvé tout en adaptant les exemples au public.\n\nGardez le programme continu : actualisez les supports, comparez les questions récurrentes et partagez ce qui a changé. Cela évite de considérer la formation initiale comme un transfert définitivement achevé.\n\n**Mise en pratique Akademy.** Après chaque cohorte, consignez une question à clarifier, un exemple à conserver et un changement à tester lors de la session suivante."
    ),
    question: i18n("What makes a train-the-trainer programme continuous?", "Qu’est-ce qui rend un programme train-the-trainer continu ?"),
    options: [
      i18n("Refreshing material and learning from each cohort’s feedback", "Actualiser les supports et apprendre des retours de chaque cohorte"),
      i18n("Reusing the same material forever without review", "Réutiliser les mêmes supports indéfiniment sans revue"),
      i18n("Keeping recurring questions private", "Garder les questions récurrentes privées"),
      i18n("Removing facilitators after the first session", "Retirer les animateurs après la première session")
    ],
    correct: "a",
    explanation: i18n("Continuous enablement incorporates feedback and keeps facilitators aligned with current practice.", "Un enablement continu intègre les retours et maintient les animateurs alignés sur la pratique actuelle.")
  },
  {
    title: i18n("What is the ‘Expansion’ phase?", "Qu’est-ce que la phase « Expansion » ?"),
    description: i18n("Use mature adoption evidence to guide broader investment after month six.", "Utiliser les preuves d’une adoption mûre pour orienter des investissements plus larges après le sixième mois."),
    body: i18n(
      "## Expansion: maximize learning from investment\n\nThe source roadmap positions Expansion from month six onward. The organization uses what it has learned to quantify transformation outcomes, consider additional products or use cases, and plan capability expansion responsibly.\n\nExpansion should be driven by evidence, not novelty alone. Preserve the discipline of qualification, operating support, and measurement as the programme reaches new teams or more complex work.\n\n**Akademy practice.** Before adding a new audience or use case, identify the evidence from earlier phases that justifies the next investment.",
      "## Expansion : tirer parti des apprentissages de l’investissement\n\nLa feuille de route source situe l’Expansion à partir du sixième mois. L’organisation utilise ce qu’elle a appris pour quantifier les résultats de transformation, envisager d’autres produits ou cas d’usage et planifier l’extension des capacités de manière responsable.\n\nL’expansion doit être guidée par les preuves, et non par la seule nouveauté. Préservez la discipline de qualification, d’accompagnement opérationnel et de mesure lorsque le programme atteint de nouvelles équipes ou des travaux plus complexes.\n\n**Mise en pratique Akademy.** Avant d’ajouter un nouveau public ou un nouveau cas d’usage, identifiez la preuve issue des phases antérieures qui justifie le prochain investissement."
    ),
    question: i18n("What should guide Expansion?", "Qu’est-ce qui doit guider l’Expansion ?"),
    options: [
      i18n("Evidence from earlier adoption phases and continued qualification", "Les preuves des phases précédentes et une qualification continue"),
      i18n("Novelty without a stated purpose", "La nouveauté sans objectif explicite"),
      i18n("Removing all measurement once adoption grows", "Supprimer toute mesure lorsque l’adoption augmente"),
      i18n("Ignoring support needs for new teams", "Ignorer les besoins de support des nouvelles équipes")
    ],
    correct: "a",
    explanation: i18n("Expansion uses learned evidence while retaining the controls that made earlier adoption interpretable.", "L’expansion utilise les preuves acquises tout en conservant les contrôles qui rendaient l’adoption antérieure interprétable.")
  },
  {
    title: i18n("Measure impact, celebrate, and iterate", "Mesurer l’impact, célébrer et itérer"),
    description: i18n("Turn outcomes and feedback into the next improvement cycle.", "Transformer les résultats et les retours en un nouveau cycle d’amélioration."),
    body: i18n(
      "## Measure, recognize, improve\n\nImpact measurement combines evidence of use with evidence of outcomes. Review the measures in their context, listen to participant experience, and be clear about what the information can and cannot demonstrate.\n\nCelebrating useful practice makes learning visible, but it should not stop the review. Use successes and limitations to refine guidance, identify the next question, and make the next cohort better prepared.\n\n**Akademy practice.** For a recent adoption milestone, record one outcome, one learner insight, one limitation, and one adjustment for the next cycle.",
      "## Mesurer, reconnaître, améliorer\n\nLa mesure d’impact combine les preuves d’usage et les preuves de résultat. Examinez les mesures dans leur contexte, écoutez l’expérience des participants et soyez clair sur ce que les informations peuvent ou ne peuvent pas démontrer.\n\nCélébrer une pratique utile rend l’apprentissage visible, mais ne doit pas arrêter la revue. Utilisez les réussites et les limites pour affiner la guidance, identifier la prochaine question et mieux préparer la cohorte suivante.\n\n**Mise en pratique Akademy.** Pour un jalon d’adoption récent, consignez un résultat, un enseignement apprenant, une limite et un ajustement pour le cycle suivant."
    ),
    question: i18n("What should follow a positive adoption result?", "Qu’est-ce qui doit suivre un résultat d’adoption positif ?"),
    options: [
      i18n("Recognition plus a review of evidence, limits, and next adjustments", "Une reconnaissance accompagnée d’une revue des preuves, limites et prochains ajustements"),
      i18n("An end to all learning and measurement", "La fin de tout apprentissage et de toute mesure"),
      i18n("A claim that the same result is guaranteed everywhere", "L’affirmation que le même résultat est garanti partout"),
      i18n("Discarding participant feedback", "L’écartement des retours participants")
    ],
    correct: "a",
    explanation: i18n("Celebration is useful when it also feeds an evidence-based next iteration.", "La célébration est utile lorsqu’elle nourrit aussi une prochaine itération fondée sur des preuves.")
  },
  {
    title: i18n("Exploring new products and use cases", "Explorer de nouveaux produits et cas d’usage"),
    description: i18n("Discover new opportunities while applying the same qualification discipline.", "Découvrir de nouvelles opportunités tout en appliquant la même discipline de qualification."),
    body: i18n(
      "## Explore responsibly\n\nMature adoption creates insight into where additional use cases may be valuable. Discovery should begin with a real work problem, the people affected, the expected change, and the evidence required to decide whether to proceed.\n\nDo not assume that a successful first workflow automatically validates another. Re-qualify new opportunities, involve the relevant owners, and plan the support needed for the new context.\n\n**Akademy practice.** For a new idea, write the problem, the expected work change, the responsible owner, and the first evidence you would need before investing further.",
      "## Explorer de manière responsable\n\nUne adoption mûre crée des enseignements sur les cas d’usage supplémentaires susceptibles d’avoir de la valeur. La découverte doit partir d’un problème de travail réel, des personnes concernées, du changement attendu et de la preuve nécessaire pour décider d’avancer.\n\nNe supposez pas qu’un premier flux réussi valide automatiquement un autre. Requalifiez les nouvelles opportunités, associez les responsables concernés et planifiez le support nécessaire au nouveau contexte.\n\n**Mise en pratique Akademy.** Pour une nouvelle idée, écrivez le problème, le changement de travail attendu, le responsable et la première preuve dont vous auriez besoin avant d’investir davantage."
    ),
    question: i18n("How should a new use case be approached?", "Comment aborder un nouveau cas d’usage ?"),
    options: [
      i18n("Re-qualify it in its own work context with accountable owners", "Le requalifier dans son propre contexte de travail avec des responsables redevables"),
      i18n("Assume a prior success proves it automatically", "Supposer qu’une réussite antérieure le prouve automatiquement"),
      i18n("Skip evidence because the idea is new", "Ignorer les preuves parce que l’idée est nouvelle"),
      i18n("Avoid involving the people affected", "Éviter d’impliquer les personnes concernées")
    ],
    correct: "a",
    explanation: i18n("Each use case has its own context and should earn investment through a fresh, accountable qualification.", "Chaque cas d’usage a son propre contexte et doit justifier l’investissement par une nouvelle qualification responsable.")
  },
  {
    title: i18n("Wrap up and thank you", "Conclusion et remerciements"),
    description: i18n("Consolidate the roadmap into a living adoption plan with clear next actions.", "Consolider la feuille de route en un plan d’adoption vivant avec des prochaines actions claires."),
    body: i18n(
      "## Keep the roadmap alive\n\nThe three phases provide a sequence for learning: Activation establishes foundations, Acceleration reinforces effective patterns, and Expansion uses evidence to guide broader capability. The value of the roadmap lies in the next accountable action, not in completing a checklist.\n\nClose by reviewing what is ready now, what remains to be learned, and when the team will meet again to examine evidence. A maintained roadmap makes adoption a continuous operating practice.\n\n**Akademy practice.** Record the next owner, the next review date, the evidence to bring, and the decision that review must enable.",
      "## Garder la feuille de route vivante\n\nLes trois phases fournissent une séquence d’apprentissage : l’Activation établit les fondations, l’Accélération renforce les pratiques efficaces et l’Expansion utilise les preuves pour orienter des capacités plus larges. La valeur de la feuille de route réside dans la prochaine action redevable, non dans le fait de cocher une liste.\n\nConcluez en examinant ce qui est prêt maintenant, ce qui reste à apprendre et la date à laquelle l’équipe se réunira de nouveau pour analyser les preuves. Une feuille de route maintenue transforme l’adoption en pratique opérationnelle continue.\n\n**Mise en pratique Akademy.** Consignez le prochain responsable, la prochaine date de revue, les preuves à apporter et la décision que cette revue doit permettre."
    ),
    question: i18n("What makes an adoption roadmap operational?", "Qu’est-ce qui rend une feuille de route d’adoption opérationnelle ?"),
    options: [
      i18n("A named next owner, review date, evidence, and decision", "Un prochain responsable nommé, une date de revue, des preuves et une décision"),
      i18n("A document that is never revisited", "Un document qui n’est jamais revu"),
      i18n("A checklist without accountability", "Une checklist sans responsabilité"),
      i18n("A launch message with no follow-up", "Un message de lancement sans suivi")
    ],
    correct: "a",
    explanation: i18n("A roadmap becomes operational when it ties the next review to evidence, ownership, and a decision.", "Une feuille de route devient opérationnelle lorsqu’elle relie la prochaine revue à des preuves, une responsabilité et une décision.")
  }
];

function createCourse({ courseId, sourceCourseTitle, sourceCourseUrl, officialDurationMinutes, lessons, competencyTags, description }) {
  return {
    courseId,
    sourceCourseTitle,
    sourceProvider: source.provider,
    sourceCourseUrl,
    sourceLanguage: source.sourceLanguage,
    integration: {
      schemaVersion: "neopolis.anthropic_fde.skilljar.v1",
      sourcePath: source.pathUrl,
      sourceObservedAt: source.observedAt,
      sourceMediaAudit: {
        result: "No source learning image, video, audio, iframe, downloadable resource, or external workflow required was detected in the verified source lesson HTML; brand and user-avatar assets are intentionally not imported.",
        verifiedLessonHtml: courseId === "claude_fde_delivery_methodology__01"
          ? "anthropic-partners.skilljar.com_path_claude-fde_delivery-methodology_486625_1792343722667.html"
          : "anthropic-partners.skilljar.com_path_claude-fde_driving-enterprise-adoption-of-claude_334606_1792343637547.html",
      },
      adaptation: "Each official Skilljar lesson is represented by one Neopolis screen using only standard blocks. The required knowledge check is newly written, server-validated, and does not replace or impersonate the original source assessment.",
    },
    source_refs: [{ id: "anthropic_fde_skilljar", provider: source.provider, url: sourceCourseUrl, accessedAt: source.observedAt }],
    lessons: lessons.map((lesson, index) => {
      const lessonNumber = String(index + 1).padStart(2, "0");
      const lessonId = `${courseId}_l${lessonNumber}`;
      const exerciseId = `${lessonId}_knowledge_check`;
      const options = lesson.options.map((option, optionIndex) => ({ id: String.fromCharCode(97 + optionIndex), text: option }));
      return {
        id: lessonId,
        title: lesson.title,
        description: lesson.description,
        competencyTags,
        recommendedVideos: [],
        // Les leçons Skilljar vérifiées sont textuelles et ne déclarent pas de
        // vidéo de fin de module : ne pas inventer une recommandation externe.
        recommendedVideosManaged: false,
        source_refs: [{ id: "anthropic_fde_skilljar", url: sourceCourseUrl, lessonTitle: lesson.title.en }],
        chapters: [{
          id: `${lessonId}_screen_01`,
          title: lesson.title,
          description: lesson.description,
          type: "teaching",
          requiredBeforeAdvance: true,
          completionRule: { type: "exercise", exerciseId },
          source_refs: [{ id: "anthropic_fde_skilljar", url: sourceCourseUrl, lessonTitle: lesson.title.en }],
          blocks: [
            {
              type: "content",
              id: `${lessonId}_content`,
              body: lesson.body,
              source_refs: [{ id: "anthropic_fde_skilljar", url: sourceCourseUrl, lessonTitle: lesson.title.en }],
            },
            {
              type: "single_choice_exercise",
              id: exerciseId,
              exerciseId,
              serverValidated: true,
              completionRequiresCorrectAnswer: true,
              question: lesson.question,
              options,
              correctAnswer: lesson.correct,
              explanation: lesson.explanation,
              source_refs: [{ id: "anthropic_fde_skilljar", url: sourceCourseUrl, lessonTitle: lesson.title.en }],
            },
          ],
        }],
      };
    }),
  };
}

const certificationId = "claude_forward_deployed_engineer";
const deliveryId = "claude_fde_delivery_methodology__01";
const enterpriseId = "claude_fde_enterprise_adoption__01";
const courses = [
  createCourse({
    courseId: deliveryId,
    sourceCourseTitle: "Delivery Methodology",
    sourceCourseUrl: "https://anthropic-partners.skilljar.com/path/claude-fde/delivery-methodology",
    officialDurationMinutes: 40,
    lessons: deliveryLessons,
    competencyTags: ["ai_solution_design", "ai_business", "ai_development", "ai_governance"],
    description: i18n("Qualify Claude Code delivery opportunities, design a measured pilot, enable champions, and run a 30-day activation.", "Qualifier les opportunités de déploiement Claude Code, concevoir un pilote mesuré, habiliter les champions et mener une activation sur 30 jours."),
  }),
  createCourse({
    courseId: enterpriseId,
    sourceCourseTitle: "Driving enterprise adoption of Claude",
    sourceCourseUrl: "https://anthropic-partners.skilljar.com/path/claude-fde/driving-enterprise-adoption-of-claude",
    officialDurationMinutes: 120,
    lessons: enterpriseLessons,
    competencyTags: ["ai_business", "ai_governance", "ai_solution_design", "leadership"],
    description: i18n("Lead enterprise Claude adoption through Activation, Acceleration, and Expansion with enablement, measurement, and accountable operating practices.", "Piloter l’adoption de Claude en entreprise à travers les phases Activation, Accélération et Expansion, avec enablement, mesure et pratiques de fonctionnement responsables."),
  }),
];

const index = readJson(indexPath);
for (const course of courses) writeJson(path.join(coursesDir, `${course.courseId}.json`), course);

const certification = {
  id: certificationId,
  title: i18n("Claude Forward Deployed Engineer", "Claude Forward Deployed Engineer"),
  description: i18n(
    "Advanced Claude delivery training: qualify Claude Code use cases, run measured pilots, and lead enterprise adoption from activation to expansion.",
    "Formation avancée au déploiement de Claude : qualifier les cas d’usage Claude Code, mener des pilotes mesurés et piloter l’adoption en entreprise, de l’activation à l’expansion."
  ),
  level: i18n("Advanced", "Avancé"),
  icon: "🚀",
  courseCount: courses.length,
  totalLessons: courses.reduce((sum, course) => sum + course.lessons.length, 0),
  totalExercises: courses.reduce((sum, course) => sum + course.lessons.length, 0),
  totalVideos: 0,
  totalDownloads: 0,
  totalActivities: courses.reduce((sum, course) => sum + course.lessons.length, 0),
  courses: [deliveryId, enterpriseId],
  group: "claude_ai_agents",
  catalogTag: i18n("Claude delivery & enterprise adoption", "Déploiement Claude et adoption en entreprise"),
  trainingFormat: "formation",
  provider: "anthropic",
  source_refs: [source.pathUrl],
  sequentialCourseLocking: true,
  noDuplicateSourceCourses: true,
  companionCourses: [
    "claude_101__01",
    "claude_code_101__01",
    "claude_code_in_action__01",
    "introduction_to_agent_skills__01",
    "introduction_to_claude_models__01",
    "introduction_to_subagents__01",
    "model_context_protocol_advanced_topics__01",
    "software_development_with_claude_code__01",
    "building_scalable_agentic_systems__01",
  ],
  companionCoursesTitle: i18n("FDE modules already available in Akademy", "Modules FDE déjà disponibles dans Akademy"),
  companionCoursesDescription: i18n(
    "These nine modules are shared with the Claude Certified Developer learning path. They remain in their canonical paths to preserve one consistent learner history and are linked here without duplication.",
    "Ces neuf modules sont communs avec le parcours Claude Certified Developer. Ils restent dans leurs parcours d’origine afin de préserver un historique apprenant cohérent et sont liés ici sans duplication."
  ),
  mediaStatus: {
    result: "No course media were available in the verified source lesson HTML. Default Akademy visual is intentionally used until an official course-specific asset is supplied or published to the Neopolis media library.",
    verifiedAt: source.observedAt,
  },
};
index.certifications = (index.certifications || []).filter((item) => item.id !== certificationId);
index.certifications.push(certification);
index.courses = (index.courses || []).filter((item) => ![deliveryId, enterpriseId].includes(item.id));
index.courses.push(
  {
    id: deliveryId,
    certId: certificationId,
    title: courses[0].lessons[0].title && i18n("Delivery Methodology", "Méthodologie de déploiement"),
    description: i18n("Qualify use cases, design pilots, measure ROI, enable champions, and run a 30-day Claude Code activation.", "Qualifier les cas d’usage, concevoir des pilotes, mesurer le ROI, habiliter les champions et mener une activation Claude Code sur 30 jours."),
    order: 1,
    officialDurationMinutes: 40,
    sourceProvider: source.provider,
    sourceCourseUrl: courses[0].sourceCourseUrl,
    competencyTags: ["ai_solution_design", "ai_business", "ai_development", "ai_governance"],
  },
  {
    id: enterpriseId,
    certId: certificationId,
    title: i18n("Driving enterprise adoption of Claude", "Piloter l’adoption de Claude en entreprise"),
    description: i18n("Lead enterprise adoption through Activation, Acceleration, and Expansion.", "Piloter l’adoption en entreprise à travers les phases Activation, Accélération et Expansion."),
    order: 2,
    officialDurationMinutes: 120,
    sourceProvider: source.provider,
    sourceCourseUrl: courses[1].sourceCourseUrl,
    competencyTags: ["ai_business", "ai_governance", "ai_solution_design", "leadership"],
  },
);
writeJson(indexPath, index);
console.log(JSON.stringify({ certificationId, courses: courses.map((course) => ({ id: course.courseId, lessons: course.lessons.length, screens: course.lessons.length, requiredChecks: course.lessons.length })), reusedCompanionCourses: certification.companionCourses.length }, null, 2));
