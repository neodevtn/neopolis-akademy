import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = {
  "04": path.join(root, "client/public/data/courses/claude_certified_developer_foundations__04.json"),
  "05": path.join(root, "client/public/data/courses/claude_certified_developer_foundations__05.json"),
};

function load(id) { return JSON.parse(fs.readFileSync(files[id], "utf8")); }
function chapter(course, id) {
  const value = course.lessons?.[0]?.chapters?.find((item) => item.id === id);
  if (!value) throw new Error(`Chapter ${id} is missing.`);
  return value;
}
function pruneCards(target, fronts) {
  for (const block of target.blocks || []) {
    if (block.type !== "flip_cards") continue;
    block.cards = (block.cards || []).filter((card) => !fronts.has(card.front?.en || card.front));
  }
}

const course4 = load("04");
const security = chapter(course4, "chapter_11");
pruneCards(security, new Set(["Hook-based guardrails: enforcement, not convention", "Setup"]));
// The following two blocks are source-fragment duplicates of the standalone,
// assessed S17/S18 chapters. Retaining them produces three non-interactive
// copies of the same task, so remove the defective copies rather than invent
// a new reconstruction.
security.blocks = (security.blocks || []).filter((block, index) => !(index === 2 || index === 3));
fs.writeFileSync(files["04"], `${JSON.stringify(course4, null, 2)}\n`);

const course5 = load("05");
pruneCards(chapter(course5, "chapter_09"), new Set(["What to Watch Out for"]));
pruneCards(chapter(course5, "chapter_11"), new Set(["Compliance often determines the platform", "What happened", "Why it broke"]));
const trustBoundaries = chapter(course5, "chapter_13");
// This trailing card group only prefigures the assessed cumulative activity
// and includes truncated conclusion/reference cards. The explicit S17/S18
// activities immediately following this chapter remain the learner route.
trustBoundaries.blocks = (trustBoundaries.blocks || []).filter((block, index) => !(block.type === "flip_cards" && index === 2));
fs.writeFileSync(files["05"], `${JSON.stringify(course5, null, 2)}\n`);

console.log("Removed source-incomplete Developer Foundations cards and duplicate static activity blocks.");
