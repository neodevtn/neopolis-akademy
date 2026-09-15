import { describe, expect, it } from 'vitest';
import course4 from '../../public/data/courses/claude_certified_developer_foundations__04.json';
import course5 from '../../public/data/courses/claude_certified_developer_foundations__05.json';
import index from './trainingIndex.json';

const find = (node: unknown, id: string): any => {
  if (Array.isArray(node)) return node.map((value) => find(value, id)).find(Boolean);
  if (!node || typeof node !== 'object') return undefined;
  if ((node as { id?: string }).id === id) return node;
  return Object.values(node).map((value) => find(value, id)).find(Boolean);
};

describe('Developer official durations', () => {
  it('keeps Skilljar durations in course data and catalog', () => {
    for (const [courseId, course, minutes] of [
      ['claude_certified_developer_foundations__04', course4, 211],
      ['claude_certified_developer_foundations__05', course5, 155],
    ] as const) {
      expect(course.officialDurationMinutes).toBe(minutes);
      expect(course.durationMinutes).toBe(minutes);
      expect(find(index, courseId).officialDurationMinutes).toBe(minutes);
    }
  });
});
