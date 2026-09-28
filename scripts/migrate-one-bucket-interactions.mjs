#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courseDir = path.join(root, "client/public/data/courses");
const dryRun = process.argv.includes("--dry-run");
const changes = [];

function isOrderingInstruction(block) {
  const values = Object.values(block.instructions || {}).filter((value) => typeof value === "string");
  return values.some((value) => /\b(order|ordered|reorder|arrange|sequence|steps|first|last|ordre|ordonner|réordonner|classer|étapes|séquence)\b/i.test(value));
}

for (const filename of fs.readdirSync(courseDir).filter((name) => name.endsWith(".json")).sort()) {
  const absolute = path.join(courseDir, filename);
  const course = JSON.parse(fs.readFileSync(absolute, "utf8"));
  let changed = false;

  for (const [lessonIndex, lesson] of (course.lessons || []).entries()) {
    for (const [chapterIndex, chapter] of (lesson.chapters || []).entries()) {
      for (const [blockIndex, block] of (chapter.blocks || []).entries()) {
        const trace = `lessons[${lessonIndex}].chapters[${chapterIndex}].blocks[${blockIndex}]`;

        if (filename === "introduction_to_ai_for_work__01.json" && block.id === "dc_3_act_04_bucket_sort" && ["bucket_sort", "ordering"].includes(block.type)) {
          const categories = [
            { id: "request", label: { en: "Request", fr: "Demande", ar: "الطلب" } },
            { id: "requirements", label: { en: "Requirements", fr: "Exigences", ar: "المتطلبات" } },
            { id: "context", label: { en: "Context", fr: "Contexte", ar: "السياق" } },
            { id: "examples", label: { en: "Examples", fr: "Exemples", ar: "الأمثلة" } },
          ];
          const expectedTargets = categories.map((category) => category.id);
          const currentTargets = Array.isArray(block.cards) ? block.cards.map((card) => card.correctBucket) : [];
          const alreadyValid = block.type === "bucket_sort"
            && Array.isArray(block.buckets)
            && block.buckets.map((bucket) => bucket.id).join("|") === expectedTargets.join("|")
            && currentTargets.join("|") === expectedTargets.join("|");
          if (alreadyValid) continue;
          const sourceCards = Array.isArray(block.cards) ? block.cards : block.items;
          if (!Array.isArray(sourceCards) || sourceCards.length !== 4) throw new Error(`Invalid prompt-framework activity: ${filename} ${trace}`);
          block.type = "bucket_sort";
          block.buckets = categories;
          block.cards = sourceCards.map((card, index) => ({ id: card.id, text: card.text, correctBucket: categories[index].id }));
          delete block.items;
          changes.push({ file: filename, trace, migration: "restore_four_prompt_categories", itemCount: block.cards.length });
          changed = true;
          continue;
        }

        if (block.type !== "bucket_sort" || !Array.isArray(block.buckets) || block.buckets.length !== 1) continue;

        if (isOrderingInstruction(block)) {
          block.type = "ordering";
          block.items = (block.cards || []).map(({ id, text }) => ({ id, text }));
          delete block.cards;
          delete block.buckets;
          changes.push({ file: filename, trace, migration: "bucket_sort_to_ordering", itemCount: block.items.length });
          changed = true;
          continue;
        }

        throw new Error(`Unclassified one-bucket interaction: ${filename} ${trace}`);
      }
    }
  }

  if (changed && !dryRun) fs.writeFileSync(absolute, `${JSON.stringify(course, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ dryRun, changedInteractions: changes.length, changes }, null, 2));
