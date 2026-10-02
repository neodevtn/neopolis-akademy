import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Usage: node scripts/import_certsafari_anthropic_bank.mjs <partner.json> [private-output.json]
// Exécuter séparément pour chaque certification ; aucune banque privée dans client/public.
const input = path.resolve(process.argv[2] || "/home/ubuntu/upload/certsafari_questions.json");
const raw = await fs.readFile(input);
const source = JSON.parse(raw.toString("utf8"));
const codeMatch = /\b(CCDV-F|CCAO-F|CCAR-F|CCAR-P)\b/.exec(source.source?.certificate || "");
const idsByCode = {
  "CCDV-F": "claude_certified_developer_foundations",
  "CCAO-F": "claude_certified_associate_foundations",
  "CCAR-F": "claude_certified_architect_foundations",
  "CCAR-P": "claude_certified_architect_professional",
};
const code = codeMatch?.[1];
const certificationId = idsByCode[code];
if (source.source?.name !== "CertSafari" || !certificationId) throw new Error("Certificat CertSafari inconnu.");
const output = path.resolve(process.argv[3] || `/home/ubuntu/anthropic-mock-exam-work/partner-${certificationId}.json`);
if (!Array.isArray(source.questions)) throw new Error("Tableau de questions manquant.");
const training = JSON.parse(await fs.readFile("client/src/data/trainingIndex.json", "utf8"));
const domainNames = training.examConfig[certificationId]?.domains.map((entry) => entry.name.en);
if (!domainNames?.length) throw new Error("Configuration de domaines manquante.");
const ids = new Set();
const transformed = [];
const notes = [];
for (const original of source.questions) {
  for (const item of [original, ...(original.variants || [])]) {
    const key = `cs_${code.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${item.id}`;
    if (!Number.isSafeInteger(item.id) || ids.has(key)) throw new Error(`Identifiant source invalide ou dupliqué : ${key}`);
    ids.add(key);
    const domainMatch = /^Domain ([1-8]): (.+)$/.exec(item.domain);
    const domain = domainNames[Number(domainMatch?.[1]) - 1];
    if (!domain || domain !== domainMatch?.[2]) throw new Error(`${key}: domaine inattendu : ${item.domain} ≠ ${domain}`);
    const prompt = original.question;
    const options = item.options;
    const answers = item.correct_answers;
    const explanations = item.explanations;
    if (typeof prompt !== "string" || !prompt.trim() || !Array.isArray(options) || options.length < 4 || options.length > 8 ||
      options.some((option) => typeof option !== "string" || !option.trim()) ||
      new Set(options.map((option) => option.toLowerCase().replace(/\s+/g, " ").trim())).size !== options.length) {
      throw new Error(`${key}: énoncé ou options invalides.`);
    }
    const letters = options.map((_, index) => String.fromCharCode(65 + index));
    if (!Array.isArray(answers) || !answers.length || new Set(answers).size !== answers.length ||
      answers.some((answer) => !letters.includes(answer))) throw new Error(`${key}: réponses invalides.`);
    if (!Array.isArray(explanations) || explanations.length !== options.length ||
      new Set(explanations.map((entry) => entry.option)).size !== options.length ||
      explanations.some((entry) => !letters.includes(entry.option) || typeof entry.explanation !== "string" || !entry.explanation.trim())) {
      throw new Error(`${key}: explication de chaque option nécessaire.`);
    }
    const explanationByLetter = new Map(explanations.map((entry) => [entry.option, entry.explanation]));
    if (Object.values(item.source_urls || {}).some(Boolean) || Object.values(item.option_urls || {}).some(Boolean)) {
      notes.push(`Des URLs de référence existent pour ${key} dans l'export source ; revoir leur publication séparément.`);
    }
    transformed.push({
      id: key, certificationId, domain,
      subdomain: String(item.subdomain || "").replace(/^Subdomain [\d.]+:\s*/, ""),
      objective: item.subdomain || item.domain,
      difficulty: answers.length > 1 ? "advanced" : "intermediate",
      sourceType: "certsafari-partner-practice",
      sourcePedagogique: source.source.url,
      sourceQuestionId: item.id,
      sourceVariantGroup: `cs_${code.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_group_${original.id}`,
      version: `certsafari-capture-${source.source.capture_date}`,
      question: { en: prompt },
      choices: options.map((option, index) => ({
        id: letters[index].toLowerCase(), text: { en: option },
        rationale: { en: explanationByLetter.get(letters[index]) },
        rationaleProvenance: { method: "partner-supplied-verbatim" },
      })),
      correctChoiceIds: answers.map((letter) => letter.toLowerCase()),
    });
  }
}
if (transformed.length !== source.summary.unique_source_question_ids || ids.size !== transformed.length) {
  throw new Error(`Inventaire partenaire incohérent : ${transformed.length} contre ${source.summary.unique_source_question_ids}.`);
}
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(transformed, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  output, certificationId, inputSha256: crypto.createHash("sha256").update(raw).digest("hex"),
  total: transformed.length, groupedStems: source.summary.unique_question_stems,
  multipleAnswerCount: transformed.filter((item) => item.correctChoiceIds.length > 1).length,
  optionCounts: Object.fromEntries([...new Set(transformed.map((item) => item.choices.length))].sort().map((count) => [count, transformed.filter((item) => item.choices.length === count).length])),
  notes: [...(source.notes || []), ...notes], collectionStatus: source.collection_status || null,
}, null, 2));
