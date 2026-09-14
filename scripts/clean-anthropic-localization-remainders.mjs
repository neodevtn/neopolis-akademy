import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursesDir = resolve(process.cwd(), "client/public/data/courses");
const course101Path = resolve(coursesDir, "claude_101__01.json");
const code101Path = resolve(coursesDir, "claude_code_101__01.json");
const codeActionPath = resolve(coursesDir, "claude_code_in_action__01.json");
const [course101, code101, codeAction] = await Promise.all([course101Path, code101Path, codeActionPath].map(async (path) => JSON.parse(await readFile(path, "utf8"))));

for (const target of [course101.lessons[1].chapters[5].title, course101.lessons[1].chapters[5].blocks[0].title]) {
  if (target.en !== "Skills vs. Projects") throw new Error("Libellé Claude 101 attendu introuvable.");
  target.fr = "Skills et Projects";
}

const planExercise = code101.lessons[1].chapters[6].blocks[0];
planExercise.instructions.fr = `Lancez Claude Code avec \`claude\`.

Passez en mode Plan en saisissant \`/plan\` ou en appuyant sur \`Maj+Tab\` jusqu’à voir « Plan Mode ».

Demandez à Claude de planifier l’ajout d’une gestion d’erreurs à \`load_data.py\` pour les fichiers CSV absents ou mal formés.

Examinez le plan produit par Claude, puis saisissez \`/exit\` pour quitter Claude Code.

Remarque : Claude peut vous poser des questions pour mettre le plan en œuvre. Vos choix n’ont pas d’incidence sur l’évaluation de l’exercice.`;
code101.lessons[2].chapters[1].blocks[0].options[1].text.fr = "Explorer → Planifier → Coder → Commit";

const actionLesson2 = codeAction.lessons[1];
actionLesson2.chapters[2].blocks[0].instructions.fr = `Lancez Claude Code avec \`claude\`.

Demandez à Claude de réécrire \`CLAUDE.md\` afin que chaque règle soit précise et vérifiable, et que chaque interdiction indique son remplacement.

Dans la même demande, demandez à Claude de mettre l’accent sur deux règles au maximum et de supprimer la règle « never push to main », qu’un hook appliquera dans une leçon ultérieure.

Saisissez \`/exit\` pour quitter Claude Code.`;
for (const target of [actionLesson2.chapters[3].title, actionLesson2.chapters[3].blocks[0].title]) target.fr = "Vidéo : Compétences de vérification";
actionLesson2.chapters[4].title.fr = "Compétences de vérification";

const routinesLesson = codeAction.lessons[2];
routinesLesson.chapters[1].blocks[0].hint.fr = `Une routine regroupe un prompt, un dépôt et les connecteurs nécessaires, puis s’exécute selon un calendrier cron, une requête HTTP POST ou un événement GitHub.

L’un des garde-fous sert précisément à empêcher une exécution autonome de réécrire votre branche par défaut.`;
routinesLesson.chapters[2].description.fr = "Une fois que vous confiez une tâche à Claude, cessez de la faire à la main. Planifiez des prompts sous forme de routines sur l’infrastructure d’Anthropic, passez en mode headless lorsque le travail exige votre propre pipeline et utilisez Claude sur les pull requests avec la revue de code gérée et l’action GitHub.";
routinesLesson.chapters[2].blocks[0].instructions.fr = "Classez chaque tâche selon qu’elle convient à une routine, au mode headless ou à l’Agent SDK.";
routinesLesson.chapters[5].blocks[0].instructions.fr = `Lancez Claude Code avec \`claude\`.

Demandez à Claude de créer \`.github/workflows/claude.yaml\`, qui exécute \`anthropics/claude-code-action@v1\` lorsqu’une personne commente une pull request.

Demandez-lui de transmettre la clé API depuis les secrets du dépôt, d’écouter la phrase de déclenchement \`@claude\` et de régler \`claude_args\` avec une limite de cinq tours et un mode d’autorisation qui ne s’interrompt jamais pour demander.

Saisissez \`/exit\` pour quitter Claude Code.`;
routinesLesson.chapters[5].blocks[0].hint.fr = `L’entrée \`trigger_phrase\` correspond à ce que l’action écoute dans les commentaires ; sa valeur par défaut est \`@claude\`.

\`claude_args\` est une simple chaîne d’arguments CLI transmise directement à Claude Code : \`--max-turns 5\` et le mode d’autorisation y figurent donc tous deux.

Une exécution sans supervision ne dispose de personne pour répondre à un prompt ; le mode recherché n’autorise donc que les outils préapprouvés et refuse les autres.`;

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await Promise.all([
  writeFile(course101Path, `${JSON.stringify(course101, null, 2)}\n`, "utf8"),
  writeFile(code101Path, `${JSON.stringify(code101, null, 2)}\n`, "utf8"),
  writeFile(codeActionPath, `${JSON.stringify(codeAction, null, 2)}\n`, "utf8"),
]);
console.log("Corrections de localisation résiduelles appliquées.");
