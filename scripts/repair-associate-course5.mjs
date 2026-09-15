import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__05.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const lesson = course.lessons[0];

const findChapter = (id) => lesson.chapters.find((chapter) => chapter.id === id);
const flipCards = (chapter) => chapter.blocks.find((block) => block.type === 'flip_cards').cards;
const findCard = (chapter, front) => flipCards(chapter).find((card) => card.front.en === front);

course.sourceCourseTitle = 'Claude Certified Associate - Foundations / Configuration & Knowledge Management';
lesson.title.en = 'Configuration & Knowledge Management';
lesson.title.fr = 'Configuration et gestion des connaissances';

const intro = findChapter('chapter_01_1').blocks[0].body;
intro.en = intro.en.replace('**Estimated time:** 15-25 minutes', '**Official duration:** 47 minutes');
intro.fr = intro.fr.replace('**Durée estimée :** 15-25 minutes', '**Durée officielle :** 47 minutes');

const projects = findChapter('chapter_01');
projects.blocks[0].body.fr = projects.blocks[0].body.fr
  .replace('\nCompétences\n\nProcédures répétables', '\nSkills\n\nProcédures répétables')
  .replace('la Memory contextualisée assure la continuité', 'la Scoped Memory assure la continuité')
  .replace('La question récurrente est : instruction, connaissance, ou Skill ? Une règle sur le comportement (« Citer systématiquement le document source pour toute affirmation factuelle ») est une instruction. Un fait dont Claude a besoin (« notre palette de marque est ces codes hexadécimaux ») est une connaissance. Une procédure en plusieurs étapes (« formater les résultats dans notre modèle de rapport standard ») est une Skill, construite une fois au niveau du compte sous Customize et réutilisée dans tout Project qui en a besoin, plutôt que configurée dans un seul Project.', 'La question récurrente est la suivante : instruction, knowledge base ou Skill ? Une règle de comportement (« toujours citer les sources ») relève d’une instruction. Un fait dont Claude a besoin (« notre palette de marque correspond à ces codes hexadécimaux ») relève de la knowledge base. Une procédure en plusieurs étapes (« mettre les résultats en forme dans notre modèle de rapport standard ») relève d’une Skill, créée une fois au niveau du compte sous Customize et réutilisée dans tout Project qui en a besoin, plutôt que d’être configurée dans un seul Project.');
findCard(projects, 'Standing instructions').front.fr = 'Instructions permanentes';
findCard(projects, 'Knowledge base').front.fr = 'knowledge base';
findCard(projects, 'Skills').front.fr = 'Skills';
findCard(projects, 'Scoped Memory').front.fr = 'Scoped Memory';
findCard(projects, 'Configuring Claude Projects').back.fr = 'Un Project dispose de plusieurs emplacements de configuration, et la compétence consiste à placer chaque élément d’un besoin récurrent au bon endroit. Les instructions régissent le comportement, la knowledge base contient les faits, les Skills portent les procédures et la Scoped Memory assure la continuité. Choisir le bon emplacement pour chaque besoin rend un Project efficace.';
findCard(projects, 'Choosing the right mechanism').back.en = 'The recurring question is: instruction, knowledge, or Skill? A rule about behavior ("always cite sources") is an instruction. A fact Claude needs ("our brand palette is these hex codes") is knowledge. A multi-step procedure ("format findings into our standard report template") is a Skill, built once at the account level under Customize and reused across any Project that needs it, rather than configured inside a single Project.';
findCard(projects, 'Choosing the right mechanism').back.fr = 'La question récurrente est la suivante : instruction, knowledge base ou Skill ? Une règle de comportement (« toujours citer les sources ») relève d’une instruction. Un fait dont Claude a besoin (« notre palette de marque correspond à ces codes hexadécimaux ») relève de la knowledge base. Une procédure en plusieurs étapes (« mettre les résultats en forme dans notre modèle de rapport standard ») relève d’une Skill, créée une fois au niveau du compte sous Customize et réutilisée dans tout Project qui en a besoin, plutôt que d’être configurée dans un seul Project.';

const connectors = findChapter('chapter_02');
findCard(connectors, 'Capability boundaries').back.en = 'Each connector has a defined boundary and knowing it prevents wasted time. A mail connector may let Claude search and read messages but not send them. Expecting an action a connector cannot perform produces a confusing failure, not a clear error, so learn each connector’s boundaries before you build a workflow on it.';
findCard(connectors, 'Capability boundaries').back.fr = 'Chaque connecteur a un périmètre défini, et le connaître évite de perdre du temps. Un connecteur de messagerie peut permettre à Claude de rechercher et de lire des messages, mais pas de les envoyer. Attendre une action qu’un connecteur ne peut pas effectuer entraîne un échec déroutant, et non une erreur claire ; apprenez donc les limites de chaque connecteur avant de construire un flux de travail qui en dépend.';

const instructions = findChapter('chapter_03');
instructions.blocks[0].body.fr = instructions.blocks[0].body.fr
  .replace('"Cite the source document for every factual claim, and say \'I don\'t know\' rather than guessing when the documents do not cover something."', '« Citez le document source pour chaque affirmation factuelle et dites “Je ne sais pas” plutôt que de deviner lorsque les documents ne couvrent pas un sujet. »')
  .replace('"Be professional"', '« Soyez professionnel »')
  .replace('"Use a formal register, define any acronym on first use, and keep paragraphs under four sentences"', '« Utilisez un registre formel, définissez tout acronyme lors de sa première occurrence et limitez les paragraphes à quatre phrases. »')
  .replace('"Make the reports good and accurate."', '« Produisez des rapports utiles et exacts. »')
  .replace('"For every figure in a report, state its source. If a figure is not in the provided data, mark it \'unverified\' rather than including it. Lead each report with a one-sentence headline."', '« Pour chaque chiffre d’un rapport, indiquez sa source. Si un chiffre n’apparaît pas dans les données fournies, marquez-le comme “non vérifié” au lieu de l’inclure. Commencez chaque rapport par un titre d’une phrase. »');
findCard(instructions, 'Anticipate the use cases').back.en = 'Good standing instructions embed format, tone, and guardrail guidance ahead of need. If the Project produces client deliverables, the instructions can specify the preferred format and register up front, so the first draft lands closer to a final deliverable rather than needing the same corrections each time.';
findCard(instructions, 'Anticipate the use cases').back.fr = 'De bonnes instructions permanentes intègrent à l’avance des indications sur le format, le ton et les garde-fous. Si le Project produit des livrables client, les instructions peuvent préciser dès le départ le format et le registre préférés, afin que le premier brouillon soit plus proche d’un livrable final au lieu de nécessiter les mêmes corrections à chaque fois.';
findCard(instructions, 'Precision, or it silently fails').back.fr = 'Les instructions vagues n’annoncent pas leur échec ; elles cessent simplement d’être utiles. « Soyez professionnel » donne à Claude trop peu d’éléments concrets. « Utilisez un registre formel, définissez tout acronyme lors de sa première occurrence et limitez les paragraphes à quatre phrases. » est suffisamment précis pour modifier la sortie.';
findCard(instructions, 'Vague instruction').back.fr = '« Produisez des rapports utiles et exacts. » La qualité des sorties varie d’une conversation à l’autre ; aucun changement concret n’est demandé.';
findCard(instructions, 'Precise instruction').back.fr = '« Pour chaque chiffre d’un rapport, indiquez sa source. Si un chiffre n’apparaît pas dans les données fournies, marquez-le comme “non vérifié” au lieu de l’inclure. Commencez chaque rapport par un titre d’une phrase. » Le comportement de vérification est alors cohérent et le titre apparaît à chaque fois.';

const maintenance = findChapter('chapter_04');
maintenance.blocks[0].body.fr = maintenance.blocks[0].body.fr
  .replace(/Un (?:Project|projet) de rapport récurrent commence à produire (?:une sortie|des résultats) légèrement (?:incorrecte|incorrects)\./, 'Un projet de rapport récurrent commence à produire des résultats légèrement incorrects.');
findCard(maintenance, 'Review cadence').back.en = 'Set a recurring review for each active Project: do the standing instructions still match the current process, is the knowledge base free of superseded documents, are the right Skills enabled? A monthly pass for active Projects catches most drift. The signal that you waited too long is output quality slipping for no visible reason.';
findCard(maintenance, 'Review cadence').back.fr = 'Planifiez une revue récurrente pour chaque Project actif : les instructions permanentes correspondent-elles toujours au processus actuel, la knowledge base est-elle exempte de documents remplacés, les bons Skills sont-ils activés ? Une revue mensuelle des Projects actifs détecte la plupart des dérives. Le signe que vous avez trop attendu est une dégradation de la qualité des résultats sans raison visible.';
findCard(maintenance, 'Skills versioning').front.fr = 'Versionnage des Skills';
findCard(maintenance, 'Skills versioning').back.en = 'Skills update over time. Anthropic-built and organization-provisioned Skills update automatically; your own custom-uploaded Skills change only when you re-upload them. Watch for a misconfigured or out-of-date Skill degrading output. A Skill that silently produces a slightly off format every run is a maintenance problem, not a prompting problem.';
findCard(maintenance, 'Skills versioning').back.fr = 'Les Skills évoluent au fil du temps. Les Skills créés par Anthropic et ceux fournis par l’organisation se mettent à jour automatiquement ; vos propres Skills personnalisés importés ne changent que lorsque vous les importez à nouveau. Surveillez tout Skill mal configuré ou obsolète qui dégrade les résultats. Un Skill qui produit silencieusement un format légèrement incorrect à chaque exécution relève d’un problème de maintenance, pas d’un problème de prompting.';
findCard(maintenance, 'Memory lifecycle').front.fr = 'Cycle de vie de Memory';
findCard(maintenance, 'Memory lifecycle').back.en = 'Treat Memory like a working file. Review it periodically, edit or delete entries that have gone stale, and export it as a backup before a major change. When a Project’s Memory has accumulated enough outdated context to mislead, a full reset is the right call. The accuracy of what is stored matters more than the volume.';
findCard(maintenance, 'Memory lifecycle').back.fr = 'Traitez Memory comme un fichier de travail. Examinez-la périodiquement, modifiez ou supprimez les entrées devenues obsolètes et exportez-la comme sauvegarde avant un changement majeur. Lorsque la Memory d’un Project a accumulé suffisamment de contexte dépassé pour induire en erreur, une réinitialisation complète est la bonne solution. L’exactitude de ce qui est stocké importe davantage que le volume.';

const quiz = findChapter('chapter_05');
quiz.title.fr = 'Module 5';
quiz.blocks[0].body.fr = 'Quiz du module 5\n\nCinq questions sous forme de scénarios. Chaque question présente une situation ; choisissez la réponse qui applique le mieux le cadre de configuration du module. Durée approximative : cinq minutes.';
const quizCards = flipCards(quiz);
quizCards.find((card) => card.front.en === 'Match each need to the right mechanism.').back.fr = 'Instructions pour le comportement, knowledge base pour les faits, Skills pour les procédures et Scoped Memory pour la continuité.';
const q2 = quiz.blocks.find((block) => block.id === 'q2');
q2.options.find((option) => option.id === 'b').text.fr = 'Claude exige que l’e-mail soit importé dans la knowledge base avant de pouvoir interagir avec lui.';
const q4 = quiz.blocks.find((block) => block.id === 'q4');
q4.question.fr = 'Une équipe chargée du projet configure un Project Claude pour l’intégration de nouveaux employés. Elle veut que Claude guide les nouvelles recrues à travers un processus d’installation informatique en 10 étapes de manière cohérente à chaque demande. Quel emplacement de configuration est le plus approprié pour stocker ce processus en 10 étapes ?';

function localizeProductTerms(value) {
  if (Array.isArray(value)) {
    value.forEach(localizeProductTerms);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === 'fr' && typeof nestedValue === 'string') {
      value[key] = nestedValue
        .replace(/\bProjets\b/g, 'Projects')
        .replace(/\bProjet\b/g, 'Project')
        .replace(/\bBase de connaissances\b/g, 'knowledge base')
        .replace(/\bbase de connaissances\b/g, 'knowledge base')
        .replace(/\bMémoire\b/g, 'Memory')
        .replace(/\bmémoire\b/g, 'Memory');
    } else {
      localizeProductTerms(nestedValue);
    }
  }
}

localizeProductTerms(course);

// The lesson contains the five deterministic single-choice questions in the quiz
// chapter. Imported free-text payloads are unrelated artifacts, bypass the course
// flow, and contradict the evaluation readiness matrix for this course.
course.exercises = [];

// No official/local video or download record is available for this course. Do not
// expose unrelated external recommendations without provenance, captions, checksum
// and playback verification required by the Associate delivery protocol.
delete lesson.recommendedVideos;
lesson.recommendedVideosManaged = false;

const catalogCourse = catalog.courses.find((item) => item.id === course.courseId);
catalogCourse.title.en = 'Configuration & Knowledge Management';
catalogCourse.title.fr = 'Configuration et gestion des connaissances';
catalogCourse.officialDurationMinutes = 47;
catalogCourse.exerciseCount = 5;
catalogCourse.chapterCount = 8;
catalogCourse.videoCount = 0;
catalogCourse.downloadCount = 0;
catalogCourse.videos = [];

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log('Associate course 5 normalized.');
