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
  .replace('Cela révèle les exigences cachées, celles enterrées dans une clause subordonnée ou implicites par un critère d’évaluation, qui coûtent des offres lorsque elles ne sont pas respectées.', 'Cela révèle les exigences cachées, celles enterrées dans une clause subordonnée ou implicites dans un critère d’évaluation, qui coûtent des offres lorsqu’elles sont négligées.');

const solutionDesign = lesson.chapters.find((chapter) => chapter.id === 'chapter_07');
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
  }
}

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
