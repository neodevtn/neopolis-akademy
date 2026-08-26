export type EvaluationCriterion = {
  id: string;
  label: string;
  description: string;
  weight: number;
};

export type StructuredEvaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  criterionScores: Array<{ criterionId: string; score: number; rationale: string }>;
};

export const OPENROUTER_EVALUATION_MODEL = "google/gemini-3.7-flash";

export function normalizeEvaluation(raw: unknown, maxScore: number, criteria: EvaluationCriterion[]): StructuredEvaluation {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const asText = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";
  const asItems = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 4) : [];
  const score = Math.min(maxScore, Math.max(0, Number(source.score) || 0));
  const byCriterion = new Map<string, { criterionId: string; score: number; rationale: string }>();
  if (Array.isArray(source.criterionScores)) {
    for (const item of source.criterionScores) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as Record<string, unknown>;
      const criterionId = asText(candidate.criterionId, 80);
      if (!criteria.some((criterion) => criterion.id === criterionId)) continue;
      byCriterion.set(criterionId, {
        criterionId,
        score: Math.min(100, Math.max(0, Number(candidate.score) || 0)),
        rationale: asText(candidate.rationale, 500),
      });
    }
  }
  return {
    score,
    feedback: asText(source.feedback, 1800) || "L’évaluation n’a pas produit de feedback exploitable. Réessayez avec une réponse plus précise.",
    strengths: asItems(source.strengths),
    improvements: asItems(source.improvements),
    criterionScores: criteria.map((criterion) => byCriterion.get(criterion.id) || ({ criterionId: criterion.id, score: 0, rationale: "Critère non évalué." })),
  };
}

export async function evaluateFreeResponseWithOpenRouter(input: {
  prompt: string;
  answer: string;
  criteria: EvaluationCriterion[];
  maxScore: number;
  language: "fr" | "en";
}): Promise<StructuredEvaluation> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  const language = input.language === "fr" ? "français" : "anglais";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://akademy.neodev.click", "X-Title": "Neopolis Akademy" },
    body: JSON.stringify({
      model: OPENROUTER_EVALUATION_MODEL,
      temperature: 0,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `Vous êtes un évaluateur pédagogique. Évaluez uniquement selon la rubrique fournie, sans inventer de critères. Répondez en ${language}. Ne donnez jamais de conseil comptable, fiscal, juridique ou financier personnalisé. Ne déduisez ni identité, ni données sensibles. Retournez uniquement un JSON avec score (0-${input.maxScore}), feedback, strengths (tableau), improvements (tableau), criterionScores ({criterionId, score: 0-100, rationale}).` },
        { role: "user", content: `Énoncé :\n${input.prompt}\n\nRubrique :\n${JSON.stringify(input.criteria)}\n\nRéponse de l’apprenant :\n${input.answer}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter evaluation failed (${response.status}).`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content || "{}";
  let parsed: unknown = {};
  try { parsed = JSON.parse(content); } catch { throw new Error("OpenRouter returned invalid evaluation JSON."); }
  return normalizeEvaluation(parsed, input.maxScore, input.criteria);
}
