import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const directory = path.join(root, 'client/public/data/courses');
const excluded = new Set([
  ...Array.from({ length: 8 }, (_, index) => `claude_certified_associate_foundations__${String(index + 1).padStart(2, '0')}`),
  'claude_certified_developer_foundations__01',
  'claude_certified_developer_foundations__02',
  'claude_certified_architect_foundations__01',
]);
const targetFile = /^claude_certified_(developer_foundations|architect_foundations|architect_professional)__\d+\.json$/;
const replacements = [
  [/\bSystem prompt\b/g, 'Prompt système'],
  [/\bsystem prompt\b/g, 'prompt système'],
  [/\bSystem Prompt\b/g, 'Prompt système'],
  [/\bSystem Prompts\b/g, 'Prompts système'],
  [/\boutput constraints\b/gi, 'contraintes de sortie'],
  [/\boutput constraint\b/gi, 'contrainte de sortie'],
  [/\bstructured outputs\b/gi, 'sorties structurées'],
  [/\bfew[‑-]shot examples\b/gi, 'exemples few-shot'],
  [/\bfew[‑-]shot pairs\b/gi, 'paires few-shot'],
  [/\bWhat good looks like\b/gi, 'Résultat attendu'],
  [/\bWatch Out\b/gi, 'À surveiller'],
  [/\bworkflows\b/gi, 'flux de travail'],
  [/\bworkflow\b/gi, 'flux de travail'],
];

const normalize = (value, stats) => {
  if (Array.isArray(value)) {
    value.forEach((item) => normalize(item, stats));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value;
  if (typeof record.fr === 'string') {
    let next = record.fr;
    for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
    if (next !== record.fr) {
      stats.replacements += 1;
      record.fr = next;
    }
  }
  Object.values(record).forEach((item) => normalize(item, stats));
};

const reports = [];
for (const file of fs.readdirSync(directory).filter((name) => targetFile.test(name)).sort()) {
  const filePath = path.join(directory, file);
  const course = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (excluded.has(course.courseId)) continue;
  const stats = { courseId: course.courseId, file, replacements: 0 };
  normalize(course, stats);
  fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
  reports.push(stats);
}
const reportPath = path.join(root, 'docs/anthropic-8020-normalization-report.json');
fs.writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), protectedNames: ['Claude', 'Claude Code', 'Projects', 'Skills', 'Memory', 'MCP', 'Extended Thinking', 'Tool Use'], reports }, null, 2)}\n`);
console.log(JSON.stringify({ courses: reports.length, replacements: reports.reduce((total, item) => total + item.replacements, 0) }, null, 2));
