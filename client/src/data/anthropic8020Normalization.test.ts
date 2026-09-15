import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const coursesDir = path.join(root, 'client/public/data/courses');
const excluded = new Set([
  ...Array.from({ length: 8 }, (_, index) => `claude_certified_associate_foundations__${String(index + 1).padStart(2, '0')}`),
  'claude_certified_developer_foundations__01',
  'claude_certified_developer_foundations__02',
  'claude_certified_architect_foundations__01',
]);
const targetFile = /^claude_certified_(developer_foundations|architect_foundations|architect_professional)__\d+\.json$/;
const residualEnglish = /\b(system prompt|output constraint|structured outputs|few[‑-]shot examples|few[‑-]shot pairs|Watch Out|What good looks like|workflows?)\b/i;
const frenchValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(frenchValues);
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  return [typeof record.fr === 'string' ? record.fr : '', ...Object.values(record).flatMap(frenchValues)].filter(Boolean);
};

describe('Anthropic 80/20 French normalization', () => {
  it('keeps generic English UI terminology out of the remaining certification course variants', () => {
    const targets = fs.readdirSync(coursesDir).filter((file) => targetFile.test(file)).map((file) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDir, file), 'utf8'));
      return { file, course };
    }).filter(({ course }) => !excluded.has(course.courseId));
    expect(targets).toHaveLength(14);
    for (const { file, course } of targets) {
      const matches = frenchValues(course).filter((text) => residualEnglish.test(text));
      expect(matches, file).toEqual([]);
    }
  });
});
