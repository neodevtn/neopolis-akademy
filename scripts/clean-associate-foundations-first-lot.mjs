import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__01.json",
);

const source = await readFile(coursePath, "utf8");
const course = JSON.parse(source);
const lesson = course.lessons?.[0];

if (!lesson || lesson.id !== "lesson_01") {
  throw new Error("La structure attendue de Associate Foundations 01 est introuvable.");
}

const capabilityChapter = lesson.chapters?.[3];
const takeawaysChapter = lesson.chapters?.[9];
const entryPointExercise = course.exercises?.find(
  (exercise) => exercise.id === "ex_claude_certified_associate_foundations__01_002",
);
const scenarioExercise = course.exercises?.find(
  (exercise) => exercise.id === "ex_claude_certified_associate_foundations__01_004",
);

if (
  capabilityChapter?.blocks?.[0]?.type !== "content" ||
  capabilityChapter?.blocks?.[1]?.type !== "tabbed_content" ||
  capabilityChapter?.blocks?.[2]?.type !== "content" ||
  takeawaysChapter?.blocks?.[0]?.type !== "content" ||
  !entryPointExercise ||
  !scenarioExercise
) {
  throw new Error("Les blocs de correction attendus ne correspondent plus au contenu source.");
}

const capabilityBody = capabilityChapter.blocks[0].body;
capabilityBody.en = `## Skills and Code Execution

Entry points determine where you work. The capability layer determines what Claude can do within that entry point.

Three features extend Claude's default text-generation behavior in ways that matter for professional work: **Skills** for consistent procedures, **Code Execution** for verified computation, and **Memory** for continuity across sessions.

## The four-layer model

The layers are independent. Combine them according to the task rather than treating them as a mandatory sequence.

| Layer | Role | Use it when |
| --- | --- | --- |
| **Projects** | Carry context | Background knowledge and standing instructions apply to a workstream. |
| **Skills** | Define procedures | A task needs to be executed consistently, every time. |
| **Code Execution** | Verify computations | The result must be correct, not merely plausible. |
| **Memory** | Preserve continuity | Relevant facts should carry forward across sessions without re-entry. |

A one-off question may need none of these layers, while a recurring analytical workflow can use all four.`;
capabilityBody.fr = `## Skills et Code Execution

Les points d’entrée déterminent où vous travaillez. La couche des capacités détermine ce que Claude peut faire dans ce point d’entrée.

Trois fonctionnalités étendent de façon utile le comportement de génération de texte de Claude pour le travail professionnel : les **Skills** pour des procédures cohérentes, **Code Execution** pour un calcul vérifié et la **Mémoire** pour conserver la continuité entre les sessions.

## Le modèle à quatre couches

Les couches sont indépendantes. Combinez-les selon la tâche, plutôt que de les traiter comme une séquence obligatoire.

| Couche | Rôle | À utiliser lorsque |
| --- | --- | --- |
| **Projets** | Porter le contexte | Des connaissances de référence et des instructions permanentes s’appliquent à un flux de travail. |
| **Skills** | Définir des procédures | Une tâche doit être exécutée de manière cohérente, à chaque fois. |
| **Code Execution** | Vérifier les calculs | Le résultat doit être exact, et pas seulement plausible. |
| **Mémoire** | Assurer la continuité | Des faits pertinents doivent être conservés entre les sessions sans ressaisie. |

Une question ponctuelle peut ne nécessiter aucune de ces couches, tandis qu’un flux d’analyse récurrent peut utiliser les quatre.`;

const memoryTab = capabilityChapter.blocks[1].tabs?.find((tab) => tab.label?.en === "Memory");
if (!memoryTab?.content?.fr) {
  throw new Error("L’onglet Mémoire attendu est introuvable.");
}
if (memoryTab.content.fr.includes("ScenarioCapability Layer")) {
  memoryTab.content.fr = memoryTab.content.fr.split("\n\nScenarioCapability Layer")[0];
}

const scenarioBody = capabilityChapter.blocks[2].body;
scenarioBody.en = `## Scenario: Capability Layer

### A monthly report that became faster and more accurate

### Context

A business analyst produces a regulatory tracking report each month. The task is consistent: identify the month’s regulatory updates that apply to the portfolio, summarize the implications, and format the result using a defined template. It is high-stakes work with a repeatable structure.

### Before the redesign

For the first two months, the analyst ran the workflow in Chat. In every session, she uploaded the regulatory documents, re-pasted the portfolio context, and re-typed the format instructions. She verified every numeric figure and caught two errors in month one and one in month two before the report was sent.

### Redesigning the workflow

In month three, she used the capability layer: portfolio context and standing format instructions went into a Project, prior reports went into the knowledge base, a Skill standardized the report output, and numeric calculations moved to Code Execution.

### Result

The time per session fell from 65 minutes to 30 minutes while the verification step remained in place. No errors were detected between months three and eight.

### Questions to ask before rebuilding

| Question | Layer it points to |
| --- | --- |
| Which parts of this task are the same every time? | Standing instructions + Skill |
| Which reference material recurs across sessions? | Knowledge base |
| Which outputs must be computed correctly, not merely sound right? | Code Execution |
| Which context should continue across sessions without re-entry? | Memory |`;
scenarioBody.fr = `## Scénario : couche des capacités

### Un rapport mensuel devenu plus rapide et plus précis

### Contexte

Une analyste métier produit chaque mois un rapport de suivi réglementaire. La tâche est récurrente : identifier les mises à jour réglementaires du mois applicables au portefeuille, en résumer les implications et mettre le résultat en forme selon un modèle défini. Le travail est à enjeux élevés, mais sa structure est répétable.

### Avant la refonte

Pendant les deux premiers mois, l’analyste exécutait le flux de travail dans Chat. À chaque session, elle téléversait les documents réglementaires, recollait le contexte du portefeuille et ressaisissait les instructions de format. Elle vérifiait chaque valeur numérique et a détecté deux erreurs le premier mois, puis une le deuxième, avant l’envoi du rapport.

### Refonte du flux de travail

Au troisième mois, elle a mobilisé la couche des capacités : le contexte du portefeuille et les instructions de format permanentes ont été placés dans un Projet, les rapports antérieurs dans la base de connaissances, une Skill a standardisé le format de sortie et les calculs numériques ont été déplacés vers Code Execution.

### Résultat

Le temps par session est passé de 65 à 30 minutes, tandis que l’étape de vérification est restée en place. Aucune erreur n’a été détectée entre les mois trois et huit.

### Questions à se poser avant la refonte

| Question | Couche correspondante |
| --- | --- |
| Quelles parties de cette tâche sont identiques à chaque exécution ? | Instructions permanentes + Skill |
| Quel matériel de référence revient d’une session à l’autre ? | Base de connaissances |
| Quels résultats doivent être calculés correctement, et pas seulement sembler justes ? | Code Execution |
| Quel contexte doit être conservé d’une session à l’autre sans ressaisie ? | Mémoire |`;

takeawaysChapter.blocks[0].body.en = `## Key Takeaways

- **How Claude behaves**: generative outputs are probabilistic; a confident tone is not evidence of accuracy, so review and verification remain essential.
- **Core entry points**: choose Chat for one-off work, Projects for recurring work with context, Artifacts for deliverables, and Research for multi-source investigation.
- **Capability layer**: Projects, Skills, Code Execution, and Memory are independent layers that can be combined for a task.
- **Choosing models**: match Haiku, Sonnet, or Opus to the required capability, response time, and cost constraints.
- **Context management**: keep the context relevant, preserve necessary instructions and references, and manage continuity deliberately.

### Next steps

- Revisit the sections you found challenging.
- Complete the module quiz if you have not already done so.
- Continue to the next module when you are ready.`;
takeawaysChapter.blocks[0].body.fr = `## Points clés à retenir

- **Comportement de Claude** : les sorties génératives sont probabilistes ; un ton confiant ne prouve pas l’exactitude, donc la revue et la vérification restent essentielles.
- **Points d’entrée principaux** : utilisez Chat pour un besoin ponctuel, les Projets pour un travail récurrent avec contexte, les Artefacts pour un livrable et la Recherche pour une investigation multi-sources.
- **Couche des capacités** : Projets, Skills, Code Execution et Mémoire sont des couches indépendantes que vous pouvez combiner pour une même tâche.
- **Choix des modèles** : adaptez Haiku, Sonnet ou Opus au niveau de capacité, au temps de réponse et aux contraintes de coût nécessaires.
- **Gestion du contexte** : gardez un contexte pertinent, conservez les instructions et références nécessaires, et gérez la continuité de manière délibérée.

### Prochaines étapes

- Revenez sur les sections que vous avez trouvées difficiles.
- Terminez le quiz du module si ce n’est pas déjà fait.
- Passez au module suivant lorsque vous êtes prêt.`;

entryPointExercise.title.en = "Choose the right entry point";
entryPointExercise.title.fr = "Choisir le bon point d’entrée";
entryPointExercise.prompt.en = `Use the table below to justify the entry point you would choose for a task.

| Task type | Entry point |
| --- | --- |
| One-off question or quick task with no plan to reuse context | Chat |
| Recurring work with stable context requirements | Project |
| Output is a deliverable the recipient will open and read | Artifact |
| Requires deep multi-source investigation or synthesis | Research |

For quick current-information lookups, use web search in Chat.`;
entryPointExercise.prompt.fr = `Utilisez le tableau ci-dessous pour justifier le point d’entrée que vous choisiriez pour une tâche.

| Type de tâche | Point d’entrée |
| --- | --- |
| Question ponctuelle ou tâche rapide, sans besoin de réutiliser le contexte | Chat |
| Travail récurrent avec des exigences de contexte stables | Projet |
| La sortie est un livrable que le destinataire ouvrira et lira | Artefact |
| Nécessite une investigation ou une synthèse approfondie à partir de plusieurs sources | Recherche |

Pour une recherche rapide d’informations actuelles, utilisez la recherche web dans Chat.`;

scenarioExercise.prompt.en = scenarioExercise.prompt.en
  .replace("(Illustrative Scenario)", "## Case study")
  .replace("Setup", "### Context");
scenarioExercise.prompt.fr = scenarioExercise.prompt.fr
  .replace("(Scénario illustratif)", "## Cas pratique")
  .replace("Mise en place", "### Contexte");

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
