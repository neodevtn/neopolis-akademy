import fs from "node:fs";
import path from "node:path";
import { invokeLLM } from "../server/_core/llm";

const root = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(root, ".work", "datacamp-audit-2026-09-17", "verified-n8n-practical-guides.json");

type SourceExercise = { blockId: string; sourceUrl: string; title: string; sourceBrief: string };

const exercises: SourceExercise[] = [
  { blockId: "dc_1_act_04_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=4", title: "Extract and transform nested webhook data", sourceBrief: "Import the starter workflow, add an Edit Fields node that flattens nested fields using dot notation, and return the cleaned payload with Respond to Webhook." },
  { blockId: "dc_1_act_06_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=6", title: "Building a producer-consumer workflow", sourceBrief: "Activate Workflow B, then build a producer workflow that constructs an order payload and POSTs it to Workflow B using an HTTP Request node." },
  { blockId: "dc_1_act_07_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=7", title: "Handle the response from a downstream workflow", sourceBrief: "Add an If node that inspects the response status from Workflow B, then route to Edit Fields nodes that produce a clear success or failure summary on each branch." },
  { blockId: "dc_1_act_09_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=9", title: "Configure a scheduled workflow", sourceBrief: "Build a scheduled workflow with a Schedule Trigger that runs every 30 minutes, stamps each run with execution context, and uses an If node to gate on business hours." },
  { blockId: "dc_1_act_10_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=10", title: "Modify a scheduled workflow to POST downstream", sourceBrief: "Build an order payload using Edit Fields and POST it to Workflow B with an HTTP Request node, completing a full schedule-to-consumer pipeline." },
  { blockId: "dc_2_act_02_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=2", title: "Fetch weather data from an API", sourceBrief: "From a Manual Trigger, use HTTP Request to pull Stockholm weather, then an Edit Fields node to flatten nested JSON into a handful of clear top-level fields." },
  { blockId: "dc_2_act_03_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=3", title: "Filter API results with query parameters", sourceBrief: "Switch HTTP Request to Berlin, move format and lang into Query Parameters, and add a localized description field to Edit Fields alongside existing flat fields." },
  { blockId: "dc_2_act_05_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=5", title: "Run and read a JavaScript Code node", sourceBrief: "Import the starter, run it, and compare the Code node input and output to see how pinned Stockholm data becomes flat fields; the exercise is about reading the transform, not writing it." },
  { blockId: "dc_2_act_06_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=6", title: "Run and read a Python Code node", sourceBrief: "Import the starter with pinned city data, execute it, trace how the Python Code node tags each row, then see Is Valid? route good records to True and broken records to False." },
  { blockId: "dc_2_act_07_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=7", title: "Modify an existing Code node", sourceBrief: "Tighten the Python Code node so humidity must be numeric, re-run the flow, and let Is Valid? show which rows go to the stricter branch." },
  { blockId: "dc_2_act_09_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=9", title: "Write and read workflow data", sourceBrief: "Create an n8n data table, wire Data Table for insert and get, and finish with an If that reacts to the rows just persisted." },
  { blockId: "dc_2_act_10_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/working-with-apis-code-and-data-tables?ex=10", title: "Process only new records", sourceBrief: "Add a Data Table Get row(s) node before insert, then a Code filter that compares city and date so only new pairs reach the writer." },
  { blockId: "dc_3_act_02_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=2", title: "Process data in batches", sourceBrief: "Import the starter workflow, add Loop Over Items in batches and an Edit Fields node that stamps processed and batch_label, then close the loop so every row gets tagged." },
  { blockId: "dc_3_act_03_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=3", title: "Handle rate limits with delays", sourceBrief: "Import the finished workflow and add a Wait node on the loop-back path into Loop Over Items so each batch pauses before the next one fires." },
  { blockId: "dc_3_act_05_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=5", title: "Split nested data into individual items", sourceBrief: "Import starter orders, add Split Out on the items array, and turn parent orders into individual line rows that still carry order fields." },
  { blockId: "dc_3_act_06_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=6", title: "Compute grouped summaries", sourceBrief: "Import pre-split items and add a Summarize node to compute average price and total quantity, grouped by category." },
  { blockId: "dc_3_act_07_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=7", title: "Split, process, and reassemble", sourceBrief: "Import nested orders, use Split Out to flatten, Edit Fields to calculate line_total, then Aggregate to collect enriched items back together." },
  { blockId: "dc_3_act_09_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=9", title: "Wire up a sub-workflow", sourceBrief: "Import the main and sub-workflow starters, then wire an Execute Sub-workflow node on each If branch so both paths call one shared workflow instead of duplicating nodes." },
  { blockId: "dc_3_act_10_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/advanced-data-processing-and-workflow-patterns?ex=10", title: "Route orders to different sub-workflows", sourceBrief: "Save both calculator workflows, start a parent with Manual Trigger and pinned orders, then use If plus two Execute Sub-workflow calls to send each order to the right specialist." },
  { blockId: "dc_4_act_02_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=2", title: "Enforce validation checkpoints", sourceBrief: "Place two If gates before Process Order: one catches a missing order_id and one catches an amount equal to zero. Route invalid rows to Stop and Error with a clear message so they never reach Process Order." },
  { blockId: "dc_4_act_03_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=3", title: "Build an error monitor workflow", sourceBrief: "Create a separate Error Monitor workflow with an Error Trigger, Edit Fields to shape the payload, and a Data Table insert into error_log. Set it as a fragile workflow's Error Workflow and activate it to confirm failures land in the table." },
  { blockId: "dc_4_act_04_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=4", title: "Route HTTP errors instead of stopping", sourceBrief: "Use an HTTP Request that reaches https://httpstat.us/500. Set the node to Continue Using Error Output, then route its error path into Edit Fields so a failure is logged without stopping the execution." },
  { blockId: "dc_4_act_06_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=6", title: "Add logging checkpoints with Data Tables", sourceBrief: "Create an execution_log table and add Data Table insert nodes as side branches off HTTP Request, Transform Data, and Format Output. Finish with Get row(s) to verify three checkpoint rows land in the table." },
  { blockId: "dc_4_act_07_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=7", title: "Build an output evaluation quality gate", sourceBrief: "Use the logging workflow, add Code as Evaluate Output, split with If on pass, and wire Edit Fields on each branch so the evaluation totals and issues appear in the summaries." },
  { blockId: "dc_4_act_09_tp", sourceUrl: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/reliability-and-production-readiness?ex=9", title: "Assemble the end-to-end capstone pipeline", sourceBrief: "Build from scratch with a Schedule Trigger every 1 hour and HTTP Request GET to https://wttr.in/London?format=j1 with JSON response. Then use Code nodes for transforms and deduplication, Loop Over Items for batching, and an If evaluation gate to split pass and fail outcomes." },
];

const schema = {
  type: "object",
  properties: {
    guides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          blockId: { type: "string" },
          assignmentFr: { type: "string" },
          setupFr: { type: "string" },
          stepsFr: { type: "array", items: { type: "string" } },
          proofFr: { type: "array", items: { type: "string" } },
          hintFr: { type: "string" },
          sourceSummaryFr: { type: "string" },
          requiresUnavailableStarter: { type: "boolean" },
          assessmentTerms: { type: "array", items: { type: "string" } },
        },
        required: ["blockId", "assignmentFr", "setupFr", "stepsFr", "proofFr", "hintFr", "sourceSummaryFr", "requiresUnavailableStarter", "assessmentTerms"],
        additionalProperties: false,
      },
    },
  },
  required: ["guides"],
  additionalProperties: false,
};

const response = await invokeLLM({
  model: "claude-sonnet-4-6",
  maxTokens: 9000,
  thinking: { type: "enabled", budget_tokens: 2048 },
  messages: [
    { role: "system", content: "You are a precise French instructional designer. Produce JSON only. You must never add a tool, configuration value, source file, external service, credential, output requirement, or workflow node that is not plainly supported by the supplied source brief. Do not copy the source wording verbatim: paraphrase it concisely. Do not mention DataCamp. Every unavailable source starter or pinned dataset is replaced by a clearly-labelled Neopolis synthetic data pack that the learner downloads from the TP. Therefore set requiresUnavailableStarter=false for every guide, explain that the learner downloads the synthetic pack where appropriate, and provide 3 to 5 practical steps using only source-named nodes and synthetic data. Never claim that a source starter was imported or that a proprietary environment exists. assessmentTerms must be 2 to 5 distinct French or n8n terms explicitly present in the source brief and useful for recognizing a substantive learner proof. Keep every instructional field learner-friendly and concise." },
    { role: "user", content: `Create concise French guides for these n8n exercises. Preserve blockId exactly. The source URL is attribution metadata and does not need to appear in learner text.\n\n${JSON.stringify(exercises)}` },
  ],
  response_format: { type: "json_schema", json_schema: { name: "n8n_practical_guides", strict: true, schema } },
});
const content = response.choices?.[0]?.message?.content;
if (!content || typeof content !== "string") throw new Error("Claude did not return practical guides.");
const parsed = JSON.parse(content);
if (parsed.guides.length !== exercises.length) throw new Error(`Expected ${exercises.length} guides, received ${parsed.guides.length}.`);
const expectedIds = new Set(exercises.map((exercise) => exercise.blockId));
for (const guide of parsed.guides) {
  if (!expectedIds.has(guide.blockId) || !Array.isArray(guide.stepsFr) || guide.stepsFr.length < 2 || !Array.isArray(guide.proofFr) || guide.proofFr.length < 2 || !Array.isArray(guide.assessmentTerms) || guide.assessmentTerms.length < 2) {
    throw new Error(`Invalid guide payload for ${guide.blockId}.`);
  }
}
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), model: "claude-sonnet-4-6", sources: exercises, guides: parsed.guides }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, guideCount: parsed.guides.length, model: "claude-sonnet-4-6" }, null, 2));
