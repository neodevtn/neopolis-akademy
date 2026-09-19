import { invokeLLM } from "./_core/llm";
import { getLearnerOrientation } from "./orientationService";
import { appendTekTekMessage, getOrCreateTekTekConversation } from "./tektekDb";
import { CAREER_FAMILY_DEFINITIONS, inferCareerFamilyIds, parseCareerFamilyIds } from "../shared/careerPathways";
import { DEFAULT_COMPETENCIES } from "../shared/competencyFramework";
import type { OrientationGoal, OrientationTargetLevel } from "../shared/orientationFramework";
import trainingIndex from "../client/src/data/trainingIndex.json";

export type TekTekOrientationDraft = {
  summary: string;
  careerFamilyIds: string[];
  goals: Array<OrientationGoal & { why: string }>;
  wantsOfficialCertification: boolean;
  officialCertificationIds: string[];
  suggestedCertifications: Array<{ id: string; title: string }>;
  model: "claude-sonnet-4-6" | null;
};

type RawOrientationDraft = Omit<TekTekOrientationDraft, "suggestedCertifications" | "model">;
type SupportedLanguage = "fr" | "en" | "ar";

const validFamilyIds: ReadonlySet<string> = new Set<string>(CAREER_FAMILY_DEFINITIONS.map((family) => family.id));
const validCompetencyIds: ReadonlySet<string> = new Set<string>(DEFAULT_COMPETENCIES.map((competency) => competency.id));
const certificationRows = (trainingIndex.certifications || []) as Array<{ id: string; title?: string | { fr?: string; en?: string }; group?: string }>;
const validCertificationIds = new Set(certificationRows.map((certification) => certification.id));
const officialCertificationIds = certificationRows.filter((certification) => certification.group === "anthropic_certification_preparation").map((certification) => certification.id);

function localized(value: unknown, language: SupportedLanguage, fallback = "") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return String(record[language] || record.fr || record.en || fallback);
}

function parseResponseContent(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part && typeof part === "object" && (part as { type?: unknown }).type === "text")
    .map((part) => String((part as { text?: unknown }).text || ""))
    .join("\n")
    .trim();
}

function parseRawDraft(content: string): RawOrientationDraft | null {
  const normalized = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(normalized) as RawOrientationDraft;
    return parsed && typeof parsed.summary === "string" && Array.isArray(parsed.careerFamilyIds) && Array.isArray(parsed.goals)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function normalizeTargetLevel(value: unknown): OrientationTargetLevel {
  return value === "gold" || value === "silver" ? value : "bronze";
}

function getSuggestedCertifications(familyIds: string[], goals: OrientationGoal[]) {
  const orderedIds = new Set<string>();
  for (const familyId of familyIds) {
    const family = CAREER_FAMILY_DEFINITIONS.find((entry) => entry.id === familyId);
    if (!family) continue;
    for (const id of [...family.foundationCertificationIds, ...family.recommendedCertificationIds]) {
      if (validCertificationIds.has(id)) orderedIds.add(id);
      if (orderedIds.size >= 8) break;
    }
    if (orderedIds.size >= 8) break;
  }
  if (!orderedIds.size) {
    for (const goal of goals) {
      const matchingFamily = CAREER_FAMILY_DEFINITIONS.find((family) => family.primaryCompetencyIds.some((competencyId) => competencyId === goal.competencyId));
      const fallbackId = matchingFamily?.foundationCertificationIds.find((id) => validCertificationIds.has(id));
      if (fallbackId) orderedIds.add(fallbackId);
    }
  }
  return Array.from(orderedIds).slice(0, 8).map((id) => {
    const certification = certificationRows.find((entry) => entry.id === id);
    return { id, title: localized(certification?.title, "fr", id) };
  });
}

export function normalizeTekTekOrientationDraft(input: unknown, fallbackInput: { objective: string; inferredCareerFamilyIds?: string[]; language?: SupportedLanguage }): TekTekOrientationDraft {
  const raw = input && typeof input === "object" ? input as Partial<RawOrientationDraft> : {};
  const fallbackWhy = fallbackInput.language === "en" ? "Priority skill for your objective." : fallbackInput.language === "ar" ? "مهارة ذات أولوية لتحقيق هدفك." : "Compétence prioritaire pour votre objectif.";
  const familyFallbackWhy = fallbackInput.language === "en" ? "Priority skill for your career family." : fallbackInput.language === "ar" ? "مهارة ذات أولوية لعائلتك المهنية." : "Compétence prioritaire pour votre famille métier.";
  const inferred = parseCareerFamilyIds(fallbackInput.inferredCareerFamilyIds);
  const familyIds = parseCareerFamilyIds(raw.careerFamilyIds).slice(0, 4);
  const fallbackFamilies = inferCareerFamilyIds(fallbackInput.objective).slice(0, 4);
  const careerFamilyIds = familyIds.length ? familyIds : inferred.length ? inferred : fallbackFamilies.length ? fallbackFamilies : ["strategy"];

  const rawGoals = Array.isArray(raw.goals) ? raw.goals : [];
  const goals: Array<OrientationGoal & { why: string }> = [];
  for (const candidate of rawGoals) {
    if (!candidate || typeof candidate !== "object") continue;
    const goal = candidate as Partial<OrientationGoal> & { why?: unknown };
    const competencyId = String(goal.competencyId || "");
    if (!validCompetencyIds.has(competencyId) || goals.some((entry) => entry.competencyId === competencyId)) continue;
    goals.push({
      competencyId,
      targetLevel: normalizeTargetLevel(goal.targetLevel),
      why: typeof goal.why === "string" && goal.why.trim() ? goal.why.trim().slice(0, 300) : fallbackWhy,
    });
    if (goals.length >= 5) break;
  }

  if (!goals.length) {
    for (const familyId of careerFamilyIds) {
      const family = CAREER_FAMILY_DEFINITIONS.find((entry) => entry.id === familyId);
      for (const competencyId of family?.primaryCompetencyIds || []) {
        if (!goals.some((goal) => goal.competencyId === competencyId)) goals.push({ competencyId, targetLevel: "bronze", why: familyFallbackWhy });
        if (goals.length >= 3) break;
      }
      if (goals.length >= 3) break;
    }
  }

  const requestedOfficialIds = Array.isArray(raw.officialCertificationIds)
    ? raw.officialCertificationIds.filter((id): id is string => typeof id === "string" && officialCertificationIds.includes(id)).slice(0, 2)
    : [];
  const wantsOfficialCertification = Boolean(raw.wantsOfficialCertification && requestedOfficialIds.length);
  const summary = typeof raw.summary === "string" && raw.summary.trim()
    ? raw.summary.trim().slice(0, 700)
    : fallbackInput.language === "en"
      ? "TekTek turned your objective into a draft of career families and skills. Review it before saving."
      : fallbackInput.language === "ar"
        ? "حوّل TekTek هدفك إلى مسودة من العائلات المهنية والمهارات. راجعها قبل الحفظ."
        : "TekTek a transformé votre objectif en une proposition de familles métier et de compétences. Vérifiez-la avant de l’enregistrer.";

  return {
    summary,
    careerFamilyIds,
    goals,
    wantsOfficialCertification,
    officialCertificationIds: wantsOfficialCertification ? requestedOfficialIds : [],
    suggestedCertifications: getSuggestedCertifications(careerFamilyIds, goals),
    model: null,
  };
}

function responseSchema() {
  return {
    type: "json_schema" as const,
    json_schema: {
      name: "tektek_orientation_draft",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "careerFamilyIds", "goals", "wantsOfficialCertification", "officialCertificationIds"],
        properties: {
          summary: { type: "string", minLength: 20, maxLength: 700 },
          careerFamilyIds: { type: "array", minItems: 1, maxItems: 4, uniqueItems: true, items: { type: "string", enum: Array.from(validFamilyIds) } },
          goals: {
            type: "array",
            minItems: 1,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["competencyId", "targetLevel", "why"],
              properties: {
                competencyId: { type: "string", enum: Array.from(validCompetencyIds) },
                targetLevel: { type: "string", enum: ["bronze", "silver", "gold"] },
                why: { type: "string", minLength: 10, maxLength: 300 },
              },
            },
          },
          wantsOfficialCertification: { type: "boolean" },
          officialCertificationIds: { type: "array", maxItems: 2, uniqueItems: true, items: { type: "string", enum: officialCertificationIds } },
        },
      },
    },
  };
}

export async function planOrientationWithTekTek(input: { userId: number; objective: string; language: SupportedLanguage }) {
  const orientation = await getLearnerOrientation(input.userId);

  const languageName = input.language === "ar" ? "Modern Standard Arabic" : input.language === "en" ? "English" : "French";
  const careerFamilies = CAREER_FAMILY_DEFINITIONS.map((family) => ({ id: family.id, title: family.title, description: family.description, primaryCompetencyIds: family.primaryCompetencyIds }));
  const competencies = DEFAULT_COMPETENCIES.map((competency) => ({ id: competency.id, title: competency.title, description: competency.description }));
  const officialCertifications = certificationRows.filter((certification) => officialCertificationIds.includes(certification.id)).map((certification) => ({ id: certification.id, title: certification.title }));
  const context = {
    objective: input.objective,
    alreadySelectedCareerFamilyIds: orientation.profile.careerFamilyIds,
    candidateInferredCareerFamilyIds: orientation.profile.inferredCareerFamilyIds,
    existingGoals: orientation.profile.goals,
    currentCompetencyPoints: Object.fromEntries(orientation.competencies.map((competency: { id: string; level: number }) => [competency.id, competency.level])),
    careerFamilies,
    competencies,
    officialCertifications,
  };

  const conversation = await getOrCreateTekTekConversation({ userId: input.userId, certificationId: "tektek_orientation", activeCourseId: "orientation", language: input.language });
  await appendTekTekMessage({ conversationId: conversation.id, courseId: "orientation", role: "user", content: "[orientation_draft_request]" });

  let draft = normalizeTekTekOrientationDraft(null, { objective: input.objective, inferredCareerFamilyIds: orientation.profile.inferredCareerFamilyIds, language: input.language });
  let usage = { promptTokens: null as number | null, completionTokens: null as number | null };
  try {
    const response = await invokeLLM({
      model: "claude-sonnet-4-6",
      maxTokens: 1_800,
      thinking: { type: "enabled", budget_tokens: 700 },
      responseFormat: responseSchema(),
      messages: [
        {
          role: "system",
          content: [
            "You are TekTek, the Neopolis Akademy AI orientation coach.",
            `Write in ${languageName}.`,
            "Transform the learner's stated objective into a conservative draft using only the supplied career families, competencies, current points, and official certifications.",
            "Never invent a family, competency, certification, job guarantee, salary, prerequisite, or course availability.",
            "Prefer a realistic Bronze target for a new area, Silver only when the current evidence supports it, and Gold only for an already advanced profile.",
            "Select at most four career families and five competencies. The learner will review the draft before it is saved.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify(context) },
      ],
    });
    const parsed = parseRawDraft(parseResponseContent(response.choices?.[0]?.message?.content));
    draft = { ...normalizeTekTekOrientationDraft(parsed, { objective: input.objective, inferredCareerFamilyIds: orientation.profile.inferredCareerFamilyIds, language: input.language }), model: "claude-sonnet-4-6" };
    usage = {
      promptTokens: Number.isFinite(response.usage?.prompt_tokens) ? Number(response.usage?.prompt_tokens) : null,
      completionTokens: Number.isFinite(response.usage?.completion_tokens) ? Number(response.usage?.completion_tokens) : null,
    };
  } catch (error) {
    console.warn("TekTek orientation planning unavailable; deterministic fallback used", error instanceof Error ? error.name : "unknown");
  }

  await appendTekTekMessage({
    conversationId: conversation.id,
    courseId: "orientation",
    role: "assistant",
    content: "[orientation_draft_generated]",
    model: draft.model,
    promptTokens: draft.model ? usage.promptTokens : null,
    completionTokens: draft.model ? usage.completionTokens : null,
  });
  return draft;
}
