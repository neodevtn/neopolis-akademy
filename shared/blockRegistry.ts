/**
 * Block Registry — Source de vérité centralisée pour tous les types de blocs de cours.
 * Utilisé par le rendu LessonViewer ET l'éditeur admin.
 * 
 * RÈGLE : Ne jamais supprimer un type existant — les cours en production en dépendent.
 * Pour déprécier un type, mettre `deprecated: true`.
 */

export type BlockCategory =
  | "content"      // Blocs de contenu textuel
  | "media"        // Vidéos, audio, téléchargements
  | "interactive"  // Quiz, drag-drop, cartes
  | "exercise"     // Exercices pratiques
  | "code"         // Blocs liés au code
  | "layout"       // Mise en page (onglets, colonnes)
  | "assessment"   // Évaluation et feedback
  | "slide";       // Blocs ProjectorPlayer (DataCamp)

export interface BlockFieldSchema {
  key: string;
  label: { en: string; fr: string };
  type: "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "array" | "json" | "code" | "i18n_text" | "i18n_textarea" | "i18n_richtext";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // for select
  arrayItemSchema?: BlockFieldSchema[]; // for array type
  defaultValue?: any;
  helpText?: { en: string; fr: string };
}

export interface BlockTypeDefinition {
  type: string;
  label: { en: string; fr: string };
  description: { en: string; fr: string };
  category: BlockCategory;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class for badge
  schema: BlockFieldSchema[];
  defaultData: Record<string, any>;
  deprecated?: boolean;
  /** If true, this block type is a chapter-level type (not a block inside a chapter) */
  isChapterType?: boolean;
  /** Minimum version when this block type was introduced */
  since?: string;
}

// ============================================================
// EXISTING BLOCK TYPES (rétrocompatibles — NE PAS MODIFIER)
// ============================================================

const contentBlock: BlockTypeDefinition = {
  type: "content",
  label: { en: "Text Content", fr: "Contenu texte" },
  description: { en: "Rich text block with Markdown support", fr: "Bloc de texte riche avec support Markdown" },
  category: "content",
  icon: "FileText",
  color: "bg-blue-100 text-blue-700",
  schema: [
    { key: "body", label: { en: "Content", fr: "Contenu" }, type: "i18n_richtext", required: true, helpText: { en: "Supports Markdown formatting", fr: "Supporte le formatage Markdown" } },
  ],
  defaultData: { type: "content", body: { en: "", fr: "" } },
};

const videoBlock: BlockTypeDefinition = {
  type: "video",
  label: { en: "Video", fr: "Vidéo" },
  description: { en: "YouTube video or local MP4 with optional transcript", fr: "Vidéo YouTube ou MP4 local avec transcription optionnelle" },
  category: "media",
  icon: "PlayCircle",
  color: "bg-red-100 text-red-700",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "url", label: { en: "YouTube URL", fr: "URL YouTube" }, type: "text", placeholder: "https://www.youtube.com/watch?v=..." },
    { key: "mp4Url", label: { en: "MP4 URL (alternative)", fr: "URL MP4 (alternative)" }, type: "text" },
    { key: "transcript", label: { en: "Transcript", fr: "Transcription" }, type: "textarea" },
  ],
  defaultData: { type: "video", title: { en: "", fr: "" }, url: "" },
};

const transcriptBlock: BlockTypeDefinition = {
  type: "transcript",
  label: { en: "Video Transcript", fr: "Transcription vidéo" },
  description: { en: "Text transcript linked to a video", fr: "Transcription textuelle liée à une vidéo" },
  category: "media",
  icon: "ScrollText",
  color: "bg-gray-100 text-gray-700",
  schema: [
    { key: "body", label: { en: "Transcript text", fr: "Texte de transcription" }, type: "textarea", required: true },
    { key: "videoId", label: { en: "YouTube Video ID", fr: "ID vidéo YouTube" }, type: "text" },
  ],
  defaultData: { type: "transcript", body: "", videoId: "" },
};

const downloadBlock: BlockTypeDefinition = {
  type: "download",
  label: { en: "Downloadable File", fr: "Fichier téléchargeable" },
  description: { en: "PDF, guide, or resource file for download", fr: "PDF, guide ou fichier ressource à télécharger" },
  category: "media",
  icon: "Download",
  color: "bg-purple-100 text-purple-700",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "description", label: { en: "Description", fr: "Description" }, type: "i18n_textarea" },
    { key: "download_url", label: { en: "Download URL", fr: "URL de téléchargement" }, type: "text", required: true },
    { key: "filename", label: { en: "Filename", fr: "Nom du fichier" }, type: "text" },
    { key: "color", label: { en: "Color accent", fr: "Couleur d'accent" }, type: "text", placeholder: "#3B82F6" },
  ],
  defaultData: { type: "download", title: { en: "", fr: "" }, download_url: "", filename: "" },
};

const flipCardsBlock: BlockTypeDefinition = {
  type: "flip_cards",
  label: { en: "Flip Cards", fr: "Cartes à retourner" },
  description: { en: "Interactive cards with front/back content for memorization", fr: "Cartes interactives recto/verso pour la mémorisation" },
  category: "interactive",
  icon: "RotateCcw",
  color: "bg-amber-100 text-amber-700",
  schema: [
    {
      key: "cards", label: { en: "Cards", fr: "Cartes" }, type: "array", required: true,
      arrayItemSchema: [
        { key: "front", label: { en: "Front", fr: "Recto" }, type: "i18n_text", required: true },
        { key: "back", label: { en: "Back", fr: "Verso" }, type: "i18n_textarea", required: true },
      ],
    },
  ],
  defaultData: { type: "flip_cards", cards: [{ front: { en: "Term", fr: "Terme" }, back: { en: "Definition", fr: "Définition" } }] },
};

const singleChoiceExerciseBlock: BlockTypeDefinition = {
  type: "single_choice_exercise",
  label: { en: "Single Choice Quiz", fr: "QCM choix unique" },
  description: { en: "Multiple choice question with one correct answer", fr: "Question à choix multiples avec une seule bonne réponse" },
  category: "interactive",
  icon: "CircleDot",
  color: "bg-green-100 text-green-700",
  schema: [
    { key: "question", label: { en: "Question", fr: "Question" }, type: "i18n_text", required: true },
    { key: "options", label: { en: "Options", fr: "Options" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "ID", fr: "ID" }, type: "text", required: true },
      { key: "text", label: { en: "Option text", fr: "Texte de l'option" }, type: "i18n_text", required: true },
    ]},
    { key: "correctAnswer", label: { en: "Correct answer ID", fr: "ID de la bonne réponse" }, type: "text", required: true },
    { key: "explanation", label: { en: "Explanation", fr: "Explication" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "single_choice_exercise", question: { en: "", fr: "" }, options: [{ id: "a", text: { en: "", fr: "" } }, { id: "b", text: { en: "", fr: "" } }], correctAnswer: "a", explanation: { en: "", fr: "" } },
};

const bucketSortBlock: BlockTypeDefinition = {
  type: "bucket_sort",
  label: { en: "Drag & Drop Sort", fr: "Tri par glisser-déposer" },
  description: { en: "Drag items into the correct category buckets", fr: "Glisser des éléments dans les bonnes catégories" },
  category: "interactive",
  icon: "ArrowDownUp",
  color: "bg-indigo-100 text-indigo-700",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_textarea" },
    { key: "buckets", label: { en: "Buckets (categories)", fr: "Catégories" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "ID", fr: "ID" }, type: "text", required: true },
      { key: "label", label: { en: "Label", fr: "Libellé" }, type: "i18n_text", required: true },
    ]},
    { key: "cards", label: { en: "Cards to sort", fr: "Cartes à trier" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "ID", fr: "ID" }, type: "text", required: true },
      { key: "text", label: { en: "Text", fr: "Texte" }, type: "i18n_text", required: true },
      { key: "correctBucket", label: { en: "Correct bucket ID", fr: "ID catégorie correcte" }, type: "text", required: true },
    ]},
  ],
  defaultData: { type: "bucket_sort", title: { en: "", fr: "" }, buckets: [{ id: "a", label: { en: "Category A", fr: "Catégorie A" } }], cards: [] },
};

const tabbedContentBlock: BlockTypeDefinition = {
  type: "tabbed_content",
  label: { en: "Tabbed Content", fr: "Contenu à onglets" },
  description: { en: "Multiple content sections in tabs", fr: "Plusieurs sections de contenu dans des onglets" },
  category: "layout",
  icon: "PanelTop",
  color: "bg-cyan-100 text-cyan-700",
  schema: [
    { key: "tabs", label: { en: "Tabs", fr: "Onglets" }, type: "array", required: true, arrayItemSchema: [
      { key: "label", label: { en: "Tab label", fr: "Libellé onglet" }, type: "i18n_text", required: true },
      { key: "content", label: { en: "Content", fr: "Contenu" }, type: "i18n_richtext", required: true },
    ]},
  ],
  defaultData: { type: "tabbed_content", tabs: [{ label: { en: "Tab 1", fr: "Onglet 1" }, content: { en: "", fr: "" } }] },
};

const comparisonBlock: BlockTypeDefinition = {
  type: "comparison",
  label: { en: "Comparison", fr: "Comparaison" },
  description: { en: "Side-by-side comparison of two items", fr: "Comparaison côte à côte de deux éléments" },
  category: "layout",
  icon: "Columns2",
  color: "bg-teal-100 text-teal-700",
  schema: [
    { key: "items", label: { en: "Items to compare", fr: "Éléments à comparer" }, type: "array", required: true, arrayItemSchema: [
      { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
      { key: "content", label: { en: "Content", fr: "Contenu" }, type: "i18n_richtext", required: true },
    ]},
    { key: "conclusion", label: { en: "Conclusion", fr: "Conclusion" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "comparison", items: [{ title: { en: "A", fr: "A" }, content: { en: "", fr: "" } }, { title: { en: "B", fr: "B" }, content: { en: "", fr: "" } }] },
};

const checkpointBlock: BlockTypeDefinition = {
  type: "checkpoint",
  label: { en: "Checkpoint", fr: "Point de validation" },
  description: { en: "Validation checkpoint referencing an exercise", fr: "Point de validation référençant un exercice" },
  category: "assessment",
  icon: "ShieldCheck",
  color: "bg-orange-100 text-orange-700",
  isChapterType: true,
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text" },
    { key: "questions", label: { en: "Validation questions", fr: "Questions de validation" }, type: "array", arrayItemSchema: [
      { key: "question", label: { en: "Question", fr: "Question" }, type: "i18n_textarea", required: true },
      { key: "explanation", label: { en: "Explanation", fr: "Explication" }, type: "i18n_textarea" },
    ] },
  ],
  defaultData: { type: "checkpoint", title: { en: "Checkpoint", fr: "Point de validation" }, questions: [] },
};

const cloudExerciseBlock: BlockTypeDefinition = {
  type: "cloud_exercise",
  label: { en: "Cloud Exercise", fr: "Exercice cloud" },
  description: { en: "Hands-on cloud exercise with instructions, hints, and solution", fr: "Exercice pratique cloud avec instructions, indices et solution" },
  category: "exercise",
  icon: "Cloud",
  color: "bg-sky-100 text-sky-700",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_richtext", required: true },
    { key: "hint", label: { en: "Hint", fr: "Indice" }, type: "i18n_textarea" },
    { key: "solution", label: { en: "Solution", fr: "Solution" }, type: "i18n_richtext" },
    { key: "successMessage", label: { en: "Success message", fr: "Message de succès" }, type: "i18n_text" },
  ],
  defaultData: { type: "cloud_exercise", title: { en: "", fr: "" }, instructions: { en: "", fr: "" } },
};

const exerciseBlock: BlockTypeDefinition = {
  type: "exercise",
  label: { en: "Lab Exercise", fr: "Exercice de lab" },
  description: { en: "Structured lab exercise with instructions (BI Codex style)", fr: "Exercice de lab structuré avec instructions (style BI Codex)" },
  category: "exercise",
  icon: "FlaskConical",
  color: "bg-violet-100 text-violet-700",
  isChapterType: true,
  schema: [
    { key: "body", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_richtext", required: true },
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text" },
  ],
  defaultData: { type: "exercise", title: { en: "", fr: "" }, body: { en: "", fr: "" } },
};

const textBlock: BlockTypeDefinition = {
  type: "text",
  label: { en: "Simple Text", fr: "Texte simple" },
  description: { en: "Plain text block (legacy)", fr: "Bloc de texte simple (ancien format)" },
  category: "content",
  icon: "Type",
  color: "bg-gray-100 text-gray-600",
  deprecated: true,
  schema: [
    { key: "body", label: { en: "Text", fr: "Texte" }, type: "textarea" },
    { key: "content", label: { en: "Content (alt)", fr: "Contenu (alt)" }, type: "textarea" },
  ],
  defaultData: { type: "text", body: "" },
};

// ============================================================
// NEW BLOCK TYPES (v2 — Priorité haute)
// ============================================================

const codeReplBlock: BlockTypeDefinition = {
  type: "code_repl",
  label: { en: "Interactive Code", fr: "Code interactif" },
  description: { en: "Executable code editor with output panel (Python, JS)", fr: "Éditeur de code exécutable avec panneau de sortie (Python, JS)" },
  category: "code",
  icon: "Terminal",
  color: "bg-emerald-100 text-emerald-700",
  since: "2.0",
  schema: [
    { key: "language", label: { en: "Language", fr: "Langage" }, type: "select", required: true, options: [
      { value: "python", label: "Python" },
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "sql", label: "SQL" },
    ]},
    { key: "starterCode", label: { en: "Starter code", fr: "Code de départ" }, type: "code", required: true, helpText: { en: "Pre-filled code shown to the learner", fr: "Code pré-rempli affiché à l'apprenant" } },
    { key: "solutionCode", label: { en: "Solution code", fr: "Code solution" }, type: "code", helpText: { en: "Correct solution (shown after submission)", fr: "Solution correcte (affichée après soumission)" } },
    { key: "testCode", label: { en: "Test/validation code", fr: "Code de test/validation" }, type: "code", helpText: { en: "Code that validates the learner's output", fr: "Code qui valide la sortie de l'apprenant" } },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_richtext", required: true },
    { key: "expectedOutput", label: { en: "Expected output", fr: "Sortie attendue" }, type: "textarea" },
  ],
  defaultData: { type: "code_repl", language: "python", starterCode: "# Write your code here\n", solutionCode: "", testCode: "", instructions: { en: "", fr: "" }, expectedOutput: "" },
};

const matchingBlock: BlockTypeDefinition = {
  type: "matching",
  label: { en: "Matching / Association", fr: "Association / Matching" },
  description: { en: "Connect terms to their definitions by drag-and-drop", fr: "Relier des termes à leurs définitions par glisser-déposer" },
  category: "interactive",
  icon: "Link2",
  color: "bg-pink-100 text-pink-700",
  since: "2.0",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_textarea" },
    { key: "pairs", label: { en: "Pairs to match", fr: "Paires à associer" }, type: "array", required: true, arrayItemSchema: [
      { key: "left", label: { en: "Left (term)", fr: "Gauche (terme)" }, type: "i18n_text", required: true },
      { key: "right", label: { en: "Right (definition)", fr: "Droite (définition)" }, type: "i18n_text", required: true },
    ]},
    { key: "feedback", label: { en: "Feedback on completion", fr: "Feedback à la complétion" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "matching", title: { en: "", fr: "" }, pairs: [{ left: { en: "", fr: "" }, right: { en: "", fr: "" } }] },
};

const fillBlankBlock: BlockTypeDefinition = {
  type: "fill_blank",
  label: { en: "Fill in the Blanks", fr: "Texte à trous" },
  description: { en: "Complete code or text with inline blank fields", fr: "Compléter du code ou du texte avec des champs à remplir" },
  category: "interactive",
  icon: "TextCursorInput",
  color: "bg-yellow-100 text-yellow-700",
  since: "2.0",
  schema: [
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_textarea", required: true },
    { key: "template", label: { en: "Template (use {{blank}} for blanks)", fr: "Modèle (utiliser {{blank}} pour les trous)" }, type: "code", required: true, helpText: { en: "Use {{blank:answer}} syntax. E.g.: def {{blank:hello}}():", fr: "Syntaxe {{blank:réponse}}. Ex: def {{blank:hello}}():" } },
    { key: "blanks", label: { en: "Blanks (answers)", fr: "Trous (réponses)" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "Blank ID", fr: "ID du trou" }, type: "text", required: true },
      { key: "answer", label: { en: "Correct answer", fr: "Réponse correcte" }, type: "text", required: true },
      { key: "alternatives", label: { en: "Alternative answers (comma-separated)", fr: "Réponses alternatives (séparées par virgule)" }, type: "text" },
    ]},
    { key: "feedback", label: { en: "Feedback", fr: "Feedback" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "fill_blank", instructions: { en: "", fr: "" }, template: "", blanks: [{ id: "1", answer: "", alternatives: "" }] },
};

const terminalSimBlock: BlockTypeDefinition = {
  type: "terminal_sim",
  label: { en: "Terminal Simulation", fr: "Simulation de terminal" },
  description: { en: "Simulated terminal for practicing CLI commands", fr: "Terminal simulé pour pratiquer des commandes CLI" },
  category: "code",
  icon: "SquareTerminal",
  color: "bg-slate-100 text-slate-700",
  since: "2.0",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_richtext", required: true },
    { key: "prompt", label: { en: "Terminal prompt", fr: "Invite du terminal" }, type: "text", defaultValue: "$ " },
    { key: "steps", label: { en: "Expected commands (steps)", fr: "Commandes attendues (étapes)" }, type: "array", required: true, arrayItemSchema: [
      { key: "command", label: { en: "Expected command", fr: "Commande attendue" }, type: "text", required: true },
      { key: "output", label: { en: "Simulated output", fr: "Sortie simulée" }, type: "textarea", required: true },
      { key: "hint", label: { en: "Hint if wrong", fr: "Indice si erreur" }, type: "i18n_text" },
      { key: "alternatives", label: { en: "Alternative valid commands", fr: "Commandes alternatives valides" }, type: "text" },
    ]},
    { key: "completionMessage", label: { en: "Completion message", fr: "Message de complétion" }, type: "i18n_text" },
  ],
  defaultData: { type: "terminal_sim", title: { en: "", fr: "" }, instructions: { en: "", fr: "" }, prompt: "$ ", steps: [{ command: "", output: "", hint: { en: "", fr: "" } }] },
};

const aiEvaluationBlock: BlockTypeDefinition = {
  type: "ai_evaluation",
  label: { en: "AI Evaluation", fr: "Évaluation IA" },
  description: { en: "AI-powered evaluation of free-text answers with structured feedback", fr: "Évaluation IA des réponses libres avec feedback structuré" },
  category: "assessment",
  icon: "BrainCircuit",
  color: "bg-fuchsia-100 text-fuchsia-700",
  since: "2.0",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "prompt", label: { en: "Question/Prompt", fr: "Question/Consigne" }, type: "i18n_richtext", required: true },
    { key: "rubric", label: { en: "Evaluation rubric (for AI)", fr: "Grille d'évaluation (pour l'IA)" }, type: "textarea", required: true, helpText: { en: "Criteria the AI uses to evaluate the answer", fr: "Critères utilisés par l'IA pour évaluer la réponse" } },
    { key: "maxScore", label: { en: "Max score", fr: "Score maximum" }, type: "number", defaultValue: 10 },
    { key: "sampleAnswer", label: { en: "Sample good answer", fr: "Exemple de bonne réponse" }, type: "i18n_textarea" },
    { key: "minWords", label: { en: "Minimum word count", fr: "Nombre minimum de mots" }, type: "number", defaultValue: 50 },
  ],
  defaultData: { type: "ai_evaluation", title: { en: "", fr: "" }, prompt: { en: "", fr: "" }, rubric: "", maxScore: 10, sampleAnswer: { en: "", fr: "" }, minWords: 50 },
};

const calloutBlock: BlockTypeDefinition = {
  type: "callout",
  label: { en: "Callout / Alert", fr: "Encadré / Alerte" },
  description: { en: "Highlighted info, warning, tip, or danger box", fr: "Encadré mis en avant : info, attention, conseil ou danger" },
  category: "content",
  icon: "AlertCircle",
  color: "bg-blue-100 text-blue-700",
  since: "2.0",
  schema: [
    { key: "variant", label: { en: "Variant", fr: "Variante" }, type: "select", required: true, options: [
      { value: "info", label: "ℹ️ Info" },
      { value: "tip", label: "💡 Tip / Conseil" },
      { value: "warning", label: "⚠️ Warning / Attention" },
      { value: "danger", label: "🚫 Danger" },
      { value: "success", label: "✅ Success / Succès" },
    ]},
    { key: "title", label: { en: "Title (optional)", fr: "Titre (optionnel)" }, type: "i18n_text" },
    { key: "body", label: { en: "Content", fr: "Contenu" }, type: "i18n_richtext", required: true },
  ],
  defaultData: { type: "callout", variant: "info", title: { en: "", fr: "" }, body: { en: "", fr: "" } },
};

const orderingBlock: BlockTypeDefinition = {
  type: "ordering",
  label: { en: "Ordering / Sequence", fr: "Remise en ordre" },
  description: { en: "Drag items into the correct order", fr: "Remettre des éléments dans le bon ordre" },
  category: "interactive",
  icon: "ListOrdered",
  color: "bg-lime-100 text-lime-700",
  since: "2.0",
  schema: [
    { key: "title", label: { en: "Title", fr: "Titre" }, type: "i18n_text", required: true },
    { key: "instructions", label: { en: "Instructions", fr: "Instructions" }, type: "i18n_textarea" },
    { key: "items", label: { en: "Items (in correct order)", fr: "Éléments (dans l'ordre correct)" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "ID", fr: "ID" }, type: "text", required: true },
      { key: "text", label: { en: "Text", fr: "Texte" }, type: "i18n_text", required: true },
    ]},
    { key: "feedback", label: { en: "Feedback", fr: "Feedback" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "ordering", title: { en: "", fr: "" }, items: [{ id: "1", text: { en: "", fr: "" } }] },
};

const multiChoiceBlock: BlockTypeDefinition = {
  type: "multi_choice_exercise",
  label: { en: "Multiple Choice Quiz", fr: "QCM choix multiples" },
  description: { en: "Multiple choice question with multiple correct answers", fr: "Question à choix multiples avec plusieurs bonnes réponses" },
  category: "interactive",
  icon: "CheckSquare",
  color: "bg-green-100 text-green-700",
  since: "2.0",
  schema: [
    { key: "question", label: { en: "Question", fr: "Question" }, type: "i18n_text", required: true },
    { key: "options", label: { en: "Options", fr: "Options" }, type: "array", required: true, arrayItemSchema: [
      { key: "id", label: { en: "ID", fr: "ID" }, type: "text", required: true },
      { key: "text", label: { en: "Option text", fr: "Texte de l'option" }, type: "i18n_text", required: true },
    ]},
    { key: "correctAnswers", label: { en: "Correct answer IDs (comma-separated)", fr: "IDs bonnes réponses (séparés par virgule)" }, type: "text", required: true },
    { key: "explanation", label: { en: "Explanation", fr: "Explication" }, type: "i18n_textarea" },
  ],
  defaultData: { type: "multi_choice_exercise", question: { en: "", fr: "" }, options: [{ id: "a", text: { en: "", fr: "" } }, { id: "b", text: { en: "", fr: "" } }], correctAnswers: "a", explanation: { en: "", fr: "" } },
};

// ============================================================
// SLIDE TYPES (ProjectorPlayer — read-only, not editable in admin)
// ============================================================

const titleSlideBlock: BlockTypeDefinition = {
  type: "TitleSlide",
  label: { en: "Title Slide", fr: "Diapositive titre" },
  description: { en: "Projector title slide (DataCamp)", fr: "Diapositive titre Projector (DataCamp)" },
  category: "slide",
  icon: "Presentation",
  color: "bg-gray-100 text-gray-500",
  deprecated: true,
  schema: [],
  defaultData: { type: "TitleSlide" },
};

const fullSlideBlock: BlockTypeDefinition = {
  type: "FullSlide",
  label: { en: "Full Slide", fr: "Diapositive pleine" },
  description: { en: "Projector full slide (DataCamp)", fr: "Diapositive pleine Projector (DataCamp)" },
  category: "slide",
  icon: "Presentation",
  color: "bg-gray-100 text-gray-500",
  deprecated: true,
  schema: [],
  defaultData: { type: "FullSlide" },
};

const twoColumnsBlock: BlockTypeDefinition = {
  type: "TwoColumns",
  label: { en: "Two Columns Slide", fr: "Diapositive deux colonnes" },
  description: { en: "Projector two-columns slide (DataCamp)", fr: "Diapositive deux colonnes Projector (DataCamp)" },
  category: "slide",
  icon: "Columns2",
  color: "bg-gray-100 text-gray-500",
  deprecated: true,
  schema: [],
  defaultData: { type: "TwoColumns" },
};

const finalSlideBlock: BlockTypeDefinition = {
  type: "FinalSlide",
  label: { en: "Final Slide", fr: "Diapositive finale" },
  description: { en: "Projector final slide (DataCamp)", fr: "Diapositive finale Projector (DataCamp)" },
  category: "slide",
  icon: "Presentation",
  color: "bg-gray-100 text-gray-500",
  deprecated: true,
  schema: [],
  defaultData: { type: "FinalSlide" },
};

// ============================================================
// REGISTRY EXPORT
// ============================================================

export const BLOCK_REGISTRY: BlockTypeDefinition[] = [
  // Content
  contentBlock,
  calloutBlock,
  textBlock,
  // Media
  videoBlock,
  transcriptBlock,
  downloadBlock,
  // Interactive
  flipCardsBlock,
  singleChoiceExerciseBlock,
  multiChoiceBlock,
  bucketSortBlock,
  matchingBlock,
  fillBlankBlock,
  orderingBlock,
  // Code
  codeReplBlock,
  terminalSimBlock,
  // Exercise
  cloudExerciseBlock,
  exerciseBlock,
  checkpointBlock,
  // Assessment
  aiEvaluationBlock,
  // Layout
  tabbedContentBlock,
  comparisonBlock,
  // Slides (deprecated, read-only)
  titleSlideBlock,
  fullSlideBlock,
  twoColumnsBlock,
  finalSlideBlock,
];

/** Get block definition by type */
export function getBlockDef(type: string): BlockTypeDefinition | undefined {
  return BLOCK_REGISTRY.find(b => b.type === type);
}

/** Get all non-deprecated block types available for the editor */
export function getEditableBlockTypes(): BlockTypeDefinition[] {
  return BLOCK_REGISTRY.filter(b => !b.deprecated && !b.isChapterType);
}

/** Get block types grouped by category */
export function getBlockTypesByCategory(): Record<BlockCategory, BlockTypeDefinition[]> {
  const grouped: Record<string, BlockTypeDefinition[]> = {};
  for (const block of getEditableBlockTypes()) {
    if (!grouped[block.category]) grouped[block.category] = [];
    grouped[block.category].push(block);
  }
  return grouped as Record<BlockCategory, BlockTypeDefinition[]>;
}

/** Category labels for UI */
export const CATEGORY_LABELS: Record<BlockCategory, { en: string; fr: string; icon: string }> = {
  content: { en: "Content", fr: "Contenu", icon: "FileText" },
  media: { en: "Media", fr: "Médias", icon: "PlayCircle" },
  interactive: { en: "Interactive", fr: "Interactif", icon: "MousePointerClick" },
  exercise: { en: "Exercises", fr: "Exercices", icon: "Dumbbell" },
  code: { en: "Code", fr: "Code", icon: "Code2" },
  layout: { en: "Layout", fr: "Mise en page", icon: "LayoutGrid" },
  assessment: { en: "Assessment", fr: "Évaluation", icon: "Award" },
  slide: { en: "Slides (legacy)", fr: "Slides (ancien)", icon: "Presentation" },
};
