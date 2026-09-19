export type AssessmentSubmissionMode = "prompt" | "artifact" | "mixed" | "evidence";

export type AssessmentSubmissionGuidance = {
  mode: AssessmentSubmissionMode;
  title: string;
  introduction: string;
  instruction: string;
  placeholder: string;
};

const PROMPT_TERMS = /\b(prompt|prompts|invite|invites|ask|request|demandez|demander|instruction|follow-up|relance)\b/i;
const ARTIFACT_TERMS = /\b(result|résultat|output|livrable|deliverable|analysis|analyse|summary|résumé|recommendation|recommandation|chart|graph|graphique|table|email|e-mail|message|presentation|présentation|slide|diapositive|report|rapport|plan|storyline|récit|visual|visuel|code|document)\b/i;

function resolveLocalizedText(value: unknown, lang: string): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const localized = value as Record<string, unknown>;
  const preferred = localized[lang];
  const fallback = lang === "en" ? localized.fr : localized.en;
  return typeof preferred === "string" ? preferred : typeof fallback === "string" ? fallback : "";
}

function criterionText(criterion: unknown, lang: string) {
  if (typeof criterion === "string") return criterion;
  if (!criterion || typeof criterion !== "object") return "";
  const record = criterion as Record<string, unknown>;
  return [resolveLocalizedText(record.label, lang), resolveLocalizedText(record.description, lang)].filter(Boolean).join(" ");
}

function explicitGuidance(block: Record<string, unknown>, lang: string) {
  return resolveLocalizedText(block.submissionInstructions, lang)
    || resolveLocalizedText(block.expectedDeliverable, lang)
    || resolveLocalizedText(block.answerFormat, lang);
}

export function getVisibleAssessmentCriteria(block: Record<string, unknown>, lang: string) {
  const structured = [
    ...(Array.isArray(block.learnerCriteria) ? block.learnerCriteria : []),
    ...(Array.isArray(block.rubricCriteria) ? block.rubricCriteria : []),
  ].map((criterion) => criterionText(criterion, lang)).filter(Boolean);
  if (structured.length) return Array.from(new Set(structured)).slice(0, 8);

  const prompt = resolveLocalizedText(block.prompt, lang);
  const emphasized = Array.from(prompt.matchAll(/\*\*([^*]{2,180})\*\*/g), (match) => match[1].trim()).filter(Boolean);
  if (emphasized.length) return Array.from(new Set(emphasized)).slice(0, 8);

  const rubric = resolveLocalizedText(block.rubric, lang);
  return rubric.split(/\n|(?=\b(?:task|context|response_format)\s*:)/i)
    .map((part) => part.replace(/^\s*(?:task|context|response_format)\s*:\s*/i, "").trim())
    .filter((part) => part.length >= 3)
    .slice(0, 8);
}

export function inferAssessmentSubmissionMode(block: Record<string, unknown>, lang: string): AssessmentSubmissionMode {
  const declaredMode = String(block.submissionMode || "");
  if (declaredMode === "prompt" || declaredMode === "artifact" || declaredMode === "mixed" || declaredMode === "evidence") return declaredMode;
  const criteria = getVisibleAssessmentCriteria(block, lang);
  const source = criteria.join(" ");
  const asksForPrompt = PROMPT_TERMS.test(source) || /(موجّه|موجه|تعليمة|تعليمات|طلب|سؤال|متابعة)/i.test(source);
  const asksForArtifact = ARTIFACT_TERMS.test(source) || /(نتيجة|مخرج|تسليم|تحليل|ملخص|توصية|جدول|رسم|عرض|تقرير|خطة|كود|وثيقة)/i.test(source);
  if (asksForPrompt && asksForArtifact) return "mixed";
  if (asksForPrompt) return "prompt";
  if (asksForArtifact) return "artifact";
  return "evidence";
}

export function getAssessmentSubmissionGuidance(block: Record<string, unknown>, lang: string): AssessmentSubmissionGuidance {
  const english = lang === "en";
  const arabic = lang === "ar";
  const explicit = explicitGuidance(block, lang);
  const mode = inferAssessmentSubmissionMode(block, lang);
  const common = english
    ? "This field is not a new question: it is where you provide the textual evidence that the evaluator can check against the criteria below."
    : arabic
      ? "هذا الحقل ليس سؤالاً جديداً: استخدمه لتقديم الدليل النصي الذي سيتحقق منه المُقيّم وفقاً للمعايير الظاهرة أدناه."
      : "Ce champ n’est pas une nouvelle question : il sert à fournir la preuve textuelle que l’évaluateur vérifiera par rapport aux critères ci-dessous.";
  const title = english ? "What to submit" : arabic ? "ما الذي يجب تسليمه" : "Ce que vous devez remettre";

  if (explicit) {
    return { mode, title, introduction: common, instruction: explicit, placeholder: english ? "Paste the requested evidence here…" : arabic ? "ألصق الدليل المطلوب هنا…" : "Collez ici la preuve demandée…" };
  }
  if (mode === "prompt") {
    return {
      mode,
      title,
      introduction: common,
      instruction: english
        ? "Paste the exact prompt you wrote and actually used. If the criteria require several prompts or follow-ups, number them in the order used. Do not paste the assistant’s full reply unless a criterion explicitly asks for it."
        : arabic
          ? "ألصق الموجّه الدقيق الذي كتبته واستخدمته فعلياً. إذا كانت المعايير تتطلب عدة موجّهات أو أسئلة متابعة، فرقمها حسب ترتيب استخدامها. لا تلصق رد المساعد كاملاً إلا إذا طلب أحد المعايير ذلك صراحةً."
          : "Collez l’invite exacte que vous avez rédigée et réellement utilisée. Si les critères demandent plusieurs invites ou relances, numérotez-les dans l’ordre. Ne collez pas toute la réponse de l’assistant sauf si un critère le demande explicitement.",
      placeholder: english ? "1. Exact prompt used…\n2. Follow-up prompt, if requested…" : arabic ? "1. الموجّه الدقيق المستخدم…\n2. موجّه المتابعة، إذا كان مطلوباً…" : "1. Invite exacte utilisée…\n2. Invite de relance, si elle est demandée…",
    };
  }
  if (mode === "artifact") {
    return {
      mode,
      title,
      introduction: common,
      instruction: english
        ? "Paste the requested deliverable or a faithful text transcription. If the result is visual and cannot be pasted, describe its visible labels, values, structure, and main takeaway so each criterion can be verified."
        : arabic
          ? "ألصق التسليم المطلوب أو نسخة نصية أمينة منه. إذا كانت النتيجة مرئية ولا يمكن لصقها، فصف عناوينها وقيمها وبنيتها وخلاصتها الرئيسية حتى يمكن التحقق من كل معيار."
          : "Collez le livrable demandé ou sa transcription textuelle fidèle. Si le résultat est visuel et ne peut pas être collé, décrivez ses libellés, valeurs, sa structure et l’enseignement principal afin que chaque critère puisse être vérifié.",
      placeholder: english ? "Requested deliverable or verifiable description of the result…" : arabic ? "التسليم المطلوب أو وصف قابل للتحقق من النتيجة…" : "Livrable demandé ou description vérifiable du résultat…",
    };
  }
  if (mode === "mixed") {
    return {
      mode,
      title,
      introduction: common,
      instruction: english
        ? "Submit two clearly labelled parts: (1) the exact prompt(s) or actions you used; (2) the resulting deliverable, extract, or verifiable description. Follow the visible criteria in order."
        : arabic
          ? "قدّم جزأين واضحين: 1) الموجّه أو الموجّهات الدقيقة أو الإجراءات التي نفذتها؛ 2) التسليم أو المقتطف الناتج أو وصف قابل للتحقق منه. اتبع ترتيب المعايير الظاهرة."
          : "Remettez deux parties clairement identifiées : 1) les invites exactes ou actions réalisées ; 2) le livrable, l’extrait obtenu ou sa description vérifiable. Suivez l’ordre des critères visibles.",
      placeholder: english ? "1. Prompt(s) / actions used…\n2. Result / deliverable obtained…" : arabic ? "1. الموجّه أو الإجراءات المستخدمة…\n2. النتيجة أو التسليم المحصل عليه…" : "1. Invite(s) / actions réalisées…\n2. Résultat / livrable obtenu…",
    };
  }
  return {
    mode,
    title,
    introduction: common,
    instruction: english
      ? "Briefly state what you did, then provide the concrete evidence that corresponds to each visible criterion. Number your evidence when there is more than one criterion."
      : arabic
        ? "اذكر بإيجاز ما الذي فعلته، ثم قدّم الدليل الملموس المقابل لكل معيار ظاهر. رقّم الأدلة عندما يوجد أكثر من معيار."
        : "Indiquez brièvement ce que vous avez fait, puis fournissez la preuve concrète correspondant à chaque critère visible. Numérotez vos éléments lorsqu’il y a plusieurs critères.",
    placeholder: english ? "What I did:\nEvidence for criterion 1:\nEvidence for criterion 2:" : arabic ? "ما الذي فعلته:\nدليل المعيار 1:\nدليل المعيار 2:" : "Ce que j’ai fait :\nPreuve pour le critère 1 :\nPreuve pour le critère 2 :",
  };
}

export function resolveAssessmentMinimumLength(block: Record<string, unknown>, trackedEvaluation: boolean) {
  const explicit = Number(block.minimumAnswerLength);
  if (Number.isFinite(explicit) && explicit >= 1) return Math.floor(explicit);
  if (!trackedEvaluation || block.workflowUploadRequired) return 1;
  return 40;
}
