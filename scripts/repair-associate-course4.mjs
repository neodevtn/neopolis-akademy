import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursePath = path.join(root, 'client/public/data/courses/claude_certified_associate_foundations__04.json');
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const lesson = course.lessons[0];

lesson.title.fr = 'Intégration des flux de travail et conception de solutions';

const intro = lesson.chapters[0].blocks[0].body;
intro.en = intro.en.replace('**Estimated time:** 15-25 minutes', '**Official duration:** 63 minutes\n\n**Neopolis estimate:** 15–25 minutes');
intro.fr = intro.fr.replace('**Durée estimée :** 15-25 minutes', '**Durée officielle :** 63 minutes\n\n**Estimation Neopolis :** 15–25 minutes');

const requirements = lesson.chapters.find((chapter) => chapter.id === 'chapter_05');
requirements.blocks[0].body.fr = requirements.blocks[0].body.fr
  .replace('« we need better reporting »', '« nous avons besoin de meilleurs rapports »')
  .replace('Cela révèle les exigences cachées, celles enterrées dans une clause subordonnée ou implicites par un critère d’évaluation, qui coûtent des offres lorsque elles ne sont pas respectées.', 'Cela révèle les exigences cachées, celles enterrées dans une clause subordonnée ou implicites dans un critère d’évaluation, qui coûtent des offres lorsqu’elles sont négligées.')
  .replace('« From the attached RFP and the email thread, extract every distinct requirement the client is asking us to address. For each, give a short label, the exact RFP section it comes from, whether our thread already has an answer, and any requirement that is ambiguous and needs clarification. Return it as a table. »', '« À partir du RFP joint et du fil d’e-mails, extrayez chaque exigence distincte à laquelle le client demande de répondre. Pour chacune, indiquez un libellé court, la section exacte du RFP dont elle provient, si notre fil contient déjà une réponse et toute exigence ambiguë nécessitant une clarification. Présentez le résultat sous forme de tableau. »');

const researchPlanning = lesson.chapters.find((chapter) => chapter.id === 'chapter_06');
for (const block of researchPlanning.blocks) {
  if (block.type !== 'flip_cards') continue;
  for (const card of block.cards) {
    if (card.front.en === 'Research and synthesis') {
      card.back.fr = 'Claude peut synthétiser des informations provenant de plusieurs sources pour élaborer un plan : rassembler les points à considérer, structurer les options et exposer les compromis. Pour les informations récentes postérieures à l’entraînement, la recherche web dans le chat couvre les recherches rapides et Research fournit des apports plus approfondis et à jour. La synthèse est utile, mais elle doit toujours être soumise à la vérification appropriée.';
    }
    if (card.front.en === 'Code execution for verified analysis') {
      card.back.en = 'When a plan depends on numbers, have Claude compute them. Upload the dataset and use code execution to run the calculations, produce trend charts, and process the files. A staffing plan built on a guessed utilization rate is a guess; one built on a code-executed analysis of the actual timesheet data is a real plan.';
      card.back.fr = 'Quand un plan dépend de chiffres, demandez à Claude de les calculer. Téléversez le jeu de données et utilisez l’exécution de code pour effectuer les calculs, produire des graphiques de tendance et traiter les fichiers. Un plan de dotation fondé sur un taux d’utilisation estimé n’est qu’une supposition ; un plan fondé sur une analyse exécutée par code des données réelles des feuilles de temps est un véritable plan.';
    }
  }
}

const solutionDesign = lesson.chapters.find((chapter) => chapter.id === 'chapter_07');
solutionDesign.blocks[0].body.fr = solutionDesign.blocks[0].body.fr
  .replace('Claude est un partenaire de design, pas une machine distributrice.', 'Claude est un partenaire de conception, pas une machine distributrice.')
  .replace('Le prendre pour une boucle, et maintenir le contexte de design stable au cours des itérations, est ce qui produit une solution plutôt qu\'un amas de brouillons isolés.', 'Le traiter comme une boucle et maintenir un contexte de conception stable au cours des itérations, c’est ce qui produit une solution plutôt qu’un amas de brouillons isolés.')
  .replace('un artefact Web', 'un artefact web')
  .replace('le build n\'est plus un exercice de prompt-and-iterate.', 'la construction n’est plus un exercice consistant à rédiger et itérer sur des prompts.');
for (const block of solutionDesign.blocks) {
  if (block.type !== 'flip_cards') continue;
  for (const card of block.cards) {
    if (card.front.en === 'Cycle 1 · Build') {
      card.front.fr = 'Cycle 1 · Construire';
      card.back.fr = '« Créez un artefact de tableau de bord simple qui présente ces cinq métriques à partir des données jointes, avec un graphique pour chacune. » Claude produit un artefact fonctionnel.';
    }
    if (card.front.en === 'Knowing when to escalate') {
      card.front.fr = 'Savoir quand faire appel à une expertise supérieure';
      card.back.fr = 'Cet artefact répondait à un besoin interne d’une petite équipe. Lorsqu’une solution devient un système dont d’autres dépendent, avec des exigences de disponibilité, de sécurité ou d’intégration, elle dépasse le périmètre Associate et relève d’une expertise Developer ou Architect.';
    }
  }
}

const delegation = lesson.chapters.find((chapter) => chapter.id === 'chapter_08');
delegation.blocks[0].body.fr = delegation.blocks[0].body.fr
  .replaceAll('AI-appropriate', 'adaptée à l’IA')
  .replaceAll('human-retained', 'réservée à l’humain')
  .replaceAll('Human-retained', 'réservée à l’humain')
  .replaceAll('Collaborative', 'collaborative')
  .replaceAll('AI ', 'IA ')
  .replace('qui la possède : AI, un humain, ou les deux ensemble.', 'qui en est responsable : l’IA, un humain, ou les deux ensemble.')
  .replace('s\'il accumulate silencieusement des risques.', 's’il accumule silencieusement des risques.')
  .replace('accorder à AI plus', 'accorder à l’IA plus')
  .replace('accorder à IA plus', 'accorder à l’IA plus')
  .replace('à AI, cela constitue', 'à l’IA, cela constitue')
  .replace('à IA, cela constitue', 'à l’IA, cela constitue')
  .replace('confiée à AI parce', 'confiée à l’IA parce')
  .replace('confiée à IA parce', 'confiée à l’IA parce')
  .replace('"IA drafts, human reviews" devient discrètement "IA drafts"', '« l’IA rédige, l’humain révise » devient discrètement « l’IA rédige »')
  .replace('sans vrai reviewer', 'sans véritable relecteur');

const delegationCards = delegation.blocks.find((block) => block.type === 'flip_cards').cards;
delegationCards.find((card) => card.front.en === 'Building the redesign').back.fr = 'Une fois les étapes cartographiées, associez la bonne fonctionnalité à chaque étape adaptée à l’IA : une Skill pour une procédure répétable, l’exécution de code pour une étape de données. Une Skill configurée apporte une cohérence plus fiable qu’un prompting héroïque. Les étapes réservées à l’humain deviennent des contrôles de revue explicites, jamais des ajouts tardifs.';
delegationCards.find((card) => card.front.en === 'Recognizing over-delegation').back.fr = 'Il est incorrect de confier à l’IA davantage que ne le justifie le profil de risque : Claude peut préparer une rédaction, mais ne doit ni approuver une clause ni envoyer un contrat. La qualité d’un brouillon n’autorise pas à déléguer la décision. Une étape irréversible ou à forte responsabilité confiée à l’IA est un cas de sur-délégation.';
for (const card of delegationCards.filter((card) => card.front.en === 'Workflow stepDelegationWhy')) {
  card.front.fr = 'Étape du workflow — Niveau de délégation — Justification';
}

const delegationExercise = delegation.blocks.find((block) => block.id === 'bucket_delegation_mapping');
delegationExercise.title.fr = 'Associez chaque étape au bon niveau de délégation';
delegationExercise.instructions.fr = 'Pour chaque étape, choisissez le niveau de délégation adapté en tenant compte de la réversibilité, des enjeux et de la responsabilité humaine.';
delegationExercise.buckets.find((bucket) => bucket.id === 'full').label.fr = 'Adaptée à l’IA';
delegationExercise.buckets.find((bucket) => bucket.id === 'assisted').label.fr = 'Collaboration IA–humain';
delegationExercise.buckets.find((bucket) => bucket.id === 'review').label.fr = 'Revue humaine requise';
delegationExercise.buckets.find((bucket) => bucket.id === 'human').label.fr = 'Réservée à l’humain';
delegationExercise.cards.find((card) => card.id === 'c3').text.fr = 'Générer des pistes pour une campagne marketing';
delegationExercise.correction.fr = 'Adaptée à l’IA : tâches routinières, réversibles et à faible enjeu, comme la mise en forme ou la synthèse.\nCollaboration IA–humain : l’IA prépare des options et une personne sélectionne, adapte ou valide.\nRevue humaine requise : l’IA peut préparer le livrable, mais un expert doit vérifier un résultat à enjeu élevé.\nRéservée à l’humain : décisions juridiques, financières ou éthiques qui engagent directement la responsabilité humaine.';

const value = lesson.chapters.find((chapter) => chapter.id === 'chapter_09');
value.blocks[0].body.fr = value.blocks[0].body.fr
  .replace('« Our new AI system reviews contracts automatically. » Sets an expectation the workflow does not meet and hides the human gate.', '« Notre nouveau système d’IA examine automatiquement les contrats. » Cette formulation crée une attente que le flux ne respecte pas et masque le contrôle humain.')
  .replace('« Fully automated » est presque jamais vrai', '« Entièrement automatisé » est presque jamais vrai')
  .replace('« It’s basically as good as a person at Y »', '« C’est pratiquement aussi bon qu’une personne pour Y »')
  .replace('« It\'s basically as good as a person at Y »', '« C’est pratiquement aussi bon qu’une personne pour Y »')
  .replaceAll('flux de travail AI', 'flux de travail d’IA');
for (const block of value.blocks) {
  if (block.type !== 'flip_cards') continue;
  for (const card of block.cards) {
    if (card.front.en === 'Describe capability accurately') {
      card.back.fr = 'Indiquez ce que Claude peut faire de manière fiable pour le cas d’usage et ce qu’il ne peut pas faire, sans exagération ni fausse modestie. « Claude rédige le premier jet de la redline, ensuite revu par un avocat » est précis et crédible. « Claude gère la revue de contrat » surestime la capacité et efface le contrôle humain.';
    }
    if (card.front.en === 'Document the human oversight') {
      card.back.fr = 'Nommez les contrôles de revue qui restent en place. « Toute sortie destinée à un client passe par une revue humaine » rend le flux défendable. Les parties prenantes font davantage confiance à un flux d’IA lorsque les points de contrôle humains sont explicites.';
    }
    if (card.front.en === 'Calibrate to the audience') {
      card.back.en = "Match the message to the audience's AI literacy. A technical stakeholder wants feature detail and failure modes; an executive wants the outcome, oversight in place, and risk posture. The expectation you set should match the capability boundary, so no one is surprised later. This is the Description competency from Module 2 applied outward: the same precise specification of what the tool can and cannot do, now directed at stakeholders rather than at Claude.";
      card.back.fr = "Adaptez le message au niveau de maîtrise de l’IA du public. Une partie prenante technique attend les détails des fonctionnalités et les modes de défaillance ; un dirigeant attend le résultat, la supervision en place et la posture de risque. Les attentes que vous fixez doivent correspondre au périmètre des capacités, afin que personne ne soit surpris plus tard. Il s’agit de la compétence Description du module 2 appliquée vers l’extérieur : la même spécification précise de ce que l’outil peut et ne peut pas faire, désormais destinée aux parties prenantes plutôt qu’à Claude.";
    }
    if (card.front.en === 'Overstated vs. Accurate') {
      card.back.en = '"Our new AI system reviews contracts automatically." This sets an expectation the workflow does not meet and hides the human gate. "Claude drafts the redline and flags playbook departures; our legal lead reviews and approves every change before anything is sent. The team’s review time is down about half, with the same approval standard." This states value and limits in one breath.';
      card.back.fr = '« Notre nouveau système d’IA examine automatiquement les contrats. » Cette formulation crée une attente que le flux de travail ne respecte pas et masque le contrôle humain. « Claude rédige la redline et signale les écarts par rapport au playbook ; notre responsable juridique examine et approuve chaque modification avant tout envoi. Le temps de révision de l’équipe est réduit d’environ la moitié, avec le même niveau d’approbation. » Cette formulation exprime la valeur et les limites en une seule phrase.';
    }
    if (card.front.en === 'Phrases that quietly overstate') {
      card.back.en = '"Fully automated" is almost never true, and the first visible error exposes it. "Claude handles X" removes the human gate from the sentence. "It’s basically as good as a person at Y" sets a standard that the tool will eventually miss publicly. Each replaces a defensible, bounded claim with an inflated one. The fix is the same every time: state what the tool does, then identify the human checkpoint.';
      card.back.fr = '« Entièrement automatisé » n’est presque jamais vrai, et la première erreur visible le révèle. « Claude gère X » fait disparaître le contrôle humain de la phrase. « C’est pratiquement aussi performant qu’une personne pour Y » fixe une norme que l’outil finira par ne pas atteindre publiquement. Chacune de ces formules remplace une affirmation défendable et circonscrite par une affirmation exagérée. La solution reste la même : indiquez ce que l’outil fait, puis identifiez le point de contrôle humain.';
    }
  }
}

const moduleQuiz = lesson.chapters.find((chapter) => chapter.id === 'chapter_11');
moduleQuiz.title.fr = 'Module 4';
moduleQuiz.blocks[0].body.fr = 'Quiz du module 4 : Intégration des flux de travail et conception de solutions\n\nCinq questions de type scénario. Chaque question présente une situation : choisissez la réponse qui s’applique le mieux au cadre d’intégration du module. Durée approximative : cinq minutes.';

function localizeFrenchWorkflow(value) {
  if (Array.isArray(value)) {
    value.forEach(localizeFrenchWorkflow);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === 'fr' && typeof nestedValue === 'string') {
      value[key] = nestedValue.replaceAll('workflow', 'flux de travail');
    } else {
      localizeFrenchWorkflow(nestedValue);
    }
  }
}

localizeFrenchWorkflow(course);

// These imported free-text payloads are unrelated, optional, and bypass the course’s
// self-contained Neopolis activities. The two bucket sorts and five quiz questions live
// directly in their chapters and remain the seven activities counted by the catalogue.
course.exercises = [];

const catalogCourse = index.courses.find((item) => item.id === course.courseId);
catalogCourse.title.en = 'Workflow Integration & Solution Design';
catalogCourse.title.fr = 'Intégration des flux de travail et conception de solutions';
catalogCourse.officialDurationMinutes = 63;

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

console.log('Associate course 4 normalized.');
