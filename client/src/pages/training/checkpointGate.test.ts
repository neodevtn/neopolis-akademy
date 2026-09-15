import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCheckpointGateState } from './checkpointGate';

const course = JSON.parse(readFileSync(resolve(process.cwd(), 'client/public/data/courses/claude_certified_associate_foundations__02.json'), 'utf8'));
const repairChapter = course.lessons[0].chapters.find((chapter: { id: string }) => chapter.id === 'chapter_08');
const checkpointId = 'ex_claude_certified_associate_foundations__02_002';
const lessonViewerSource = readFileSync(resolve(process.cwd(), 'client/src/pages/training/LessonViewer.tsx'), 'utf8');

describe('Associate 2 Repair the Prompt checkpoint gate', () => {
  it('blocks the actual chapter after an incorrect response and unlocks only after the required correct completion', () => {
    const initial = getCheckpointGateState({ blocks: repairChapter.blocks, completedExercises: new Set(), required: true });
    expect(initial.checkpointIds).toEqual([checkpointId]);
    expect(initial.locked).toBe(true);

    const completed = getCheckpointGateState({ blocks: repairChapter.blocks, completedExercises: new Set([checkpointId]), required: true });
    expect(completed.locked).toBe(false);
  });

  it('keeps review mode as the only explicit bypass', () => {
    expect(getCheckpointGateState({ blocks: repairChapter.blocks, completedExercises: new Set(), required: true, reviewMode: true }).locked).toBe(false);
  });

  it('wires the real checkpoint gate to the disabled Next control', () => {
    expect(lessonViewerSource).toContain('import { getCheckpointGateState } from "./checkpointGate"');
    expect(lessonViewerSource).toContain('checkpointGateState.locked');
    expect(lessonViewerSource).toContain('disabled={isGated}');
  });
});
