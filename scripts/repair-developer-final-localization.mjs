import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursesDir = path.join(root, 'client/public/data/courses');
const auditPath = path.join(root, 'docs/anthropic-developer-final-localization-audit.json');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

function occurrenceCount(value, needle) {
  return value.split(needle).length - 1;
}

function applyPatchToFrenchValues(value, patch) {
  let oldCount = 0;
  let newCount = 0;

  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, child] of Object.entries(node)) {
      if (key === 'fr' && typeof child === 'string') {
        oldCount += occurrenceCount(child, patch.oldText);
        newCount += occurrenceCount(child, patch.newText);
        if (child.includes(patch.oldText)) node[key] = child.replace(patch.oldText, patch.newText);
      } else {
        visit(child);
      }
    }
  }

  visit(value);
  if (oldCount === 1 && newCount === 0) return 'applied';
  if (oldCount === 0 && newCount === 1) return 'already-applied';
  if (oldCount === 0) return 'skipped-no-exact-source';
  return 'skipped-non-unique';
}

const fileByCourseId = new Map([
  ['claude_certified_developer_foundations__03', 'claude_certified_developer_foundations__03.json'],
  ['claude_certified_developer_foundations__04', 'claude_certified_developer_foundations__04.json'],
  ['claude_certified_developer_foundations__05', 'claude_certified_developer_foundations__05.json'],
]);

const groupedPatches = new Map();
for (const patch of audit.patches) {
  if (!fileByCourseId.has(patch.courseId)) throw new Error(`Unexpected course ID in localization audit: ${patch.courseId}`);
  const patches = groupedPatches.get(patch.courseId) ?? [];
  patches.push(patch);
  groupedPatches.set(patch.courseId, patches);
}

const results = [];
for (const [courseId, patches] of groupedPatches) {
  const filePath = path.join(coursesDir, fileByCourseId.get(courseId));
  const course = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const patch of patches) results.push({ courseId, status: applyPatchToFrenchValues(course, patch), oldText: patch.oldText });
  fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
}

console.log(`Validated ${results.length} localization patches: ${results.map((result) => `${result.courseId}:${result.status}`).join(', ')}`);
