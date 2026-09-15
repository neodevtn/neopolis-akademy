import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const durations = new Map([
  ['claude_certified_developer_foundations__04', 211],
  ['claude_certified_developer_foundations__05', 155],
]);
const indexPath = path.join(root, 'client/src/data/trainingIndex.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const [courseId, duration] of durations) {
  const coursePath = path.join(root, 'client/public/data/courses', `${courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
  course.officialDurationMinutes = duration;
  course.durationMinutes = duration;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
}
const update = (node) => {
  if (Array.isArray(node)) return node.forEach(update);
  if (!node || typeof node !== 'object') return;
  if (durations.has(node.id)) node.officialDurationMinutes = durations.get(node.id);
  Object.values(node).forEach(update);
};
update(index);
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log('Developer official durations synchronized.');
