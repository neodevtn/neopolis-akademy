import { BLOCK_REGISTRY } from "../shared/blockRegistry.ts";

const technicalPatterns = /\b(id|ids|exercise|bucket|answer)\b/i;
const report = BLOCK_REGISTRY.map((block) => {
  const technicalFields = block.schema.filter((field) => technicalPatterns.test(field.key) || technicalPatterns.test(field.label.en) || technicalPatterns.test(field.label.fr));
  return {
    type: block.type,
    category: block.category,
    schemaFields: block.schema.length,
    technicalFields: technicalFields.map((field) => ({ key: field.key, type: field.type, label: field.label.fr })),
    needsSpecializedEditor: ["checkpoint", "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "fill_blank"].includes(block.type),
  };
});

const needsSpecializedEditor = report.filter((block) => block.needsSpecializedEditor);
console.log(JSON.stringify({ totalBlockModels: report.length, needsSpecializedEditor, report }, null, 2));
