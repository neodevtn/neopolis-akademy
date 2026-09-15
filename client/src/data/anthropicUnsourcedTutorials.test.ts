import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const directory = path.join(process.cwd(), 'client/public/data/courses');
const handled = new Set([
  'claude_certified_developer_foundations__01.json',
  'claude_certified_developer_foundations__02.json',
  'claude_certified_developer_foundations__03.json',
  'claude_certified_architect_foundations__01.json',
]);
const filenames = fs.readdirSync(directory).filter((filename) => /^claude_certified_(developer_foundations|architect_foundations|architect_professional)__\d+\.json$/.test(filename) && !handled.has(filename));

describe('Anthropic unsourced tutorial policy', () => {
  it('does not present unqualified tutorial videos as course resources', () => {
    for (const filename of filenames) {
      const course = JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8'));
      for (const lesson of course.lessons || []) {
        for (const chapter of lesson.chapters || []) {
          const title = `${chapter.title?.en || ''} ${chapter.title?.fr || ''}`;
          const videos = (chapter.blocks || []).filter((block: any) => block.type === 'video');
          const hasVerifiedProvenance = videos.some((block: any) => block.mediaMeta?.source || block.mediaMeta?.creator || block.mediaMeta?.provenance);
          expect(/tutorial|tutoriel/i.test(title) && videos.length > 0 && !hasVerifiedProvenance, `${filename}:${chapter.id}`).toBe(false);
        }
      }
    }
  });
});
