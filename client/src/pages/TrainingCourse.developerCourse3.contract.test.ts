import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const course = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'client/public/data/courses/claude_certified_developer_foundations__03.json'), 'utf8'));
const trainingIndex = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'client/src/data/trainingIndex.json'), 'utf8'));
const lesson = course.lessons[0];
const findCatalogEntry = (node: unknown): any => {
  if (Array.isArray(node)) return node.map(findCatalogEntry).find(Boolean);
  if (!node || typeof node !== 'object') return undefined;
  if ((node as { id?: string }).id === course.id) return node;
  return Object.values(node).map(findCatalogEntry).find(Boolean);
};
const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
const content = (id: string) => chapter(id).blocks.find((item: any) => item.type === 'content').body;
const card = (chapterId: string, title: string) => chapter(chapterId).blocks.filter((item: any) => item.type === 'flip_cards').flatMap((item: any) => item.cards || []).find((item: any) => item.front.en === title);

describe('Developer Foundations course 3 critical content contract', () => {
  it('uses the official 142-minute duration and exposes no unsourced catalog videos', () => {
    const entry = findCatalogEntry(trainingIndex);
    expect(course.officialDurationMinutes).toBe(142);
    expect(course.durationMinutes).toBe(142);
    expect(entry).toBeDefined();
    expect(entry.officialDurationMinutes).toBe(142);
    expect(entry.videoCount).toBe(0);
    expect(entry.videos).toEqual([]);
  });
  it('restores the four critical card backs without truncated endings', () => {
    for (const [chapterId, title] of [['chapter_01', 'What to Watch Out for'], ['chapter_03', 'What to Watch Out for'], ['chapter_05', 'Setup'], ['chapter_05', 'What to Watch Out for']]) {
      const target = card(chapterId, title);
      expect(target.back.en.length).toBeGreaterThan(180);
      expect(target.back.fr.length).toBeGreaterThan(180);
      expect(target.back.en).toMatch(/[.!?]$/);
      expect(target.back.fr).toMatch(/[.!?]$/);
    }
  });

  it('uses structured source sections and localized generic French terms', () => {
    expect(content('chapter_01').fr).toContain('## Modes d’autorisation et portes humaines');
    expect(content('chapter_03').fr).toContain('| Mécanisme |');
    expect(content('chapter_05').fr).toContain('| Couche |');
    expect(JSON.stringify(course)).toContain('Point de contrôle 1 : assembler le fichier settings et placer le contrôle humain');
    expect(JSON.stringify(course)).toContain('Point de contrôle 3 : placez la skill dans le runtime approprié — Essayez maintenant…');
    expect(content('chapter_01').fr).not.toContain('working directory');
    expect(content('chapter_03').fr).not.toContain('managed settings');
  });

  it('uses the official duration in the introduction and separates the watch-out card metadata', () => {
    expect(content('chapter_01_1').en).toContain('**Official course duration:** 142 minutes');
    expect(content('chapter_01_1').fr).toContain('**Durée officielle du cours :** 142 minutes');
    expect(content('chapter_01_1').en).not.toContain('**Estimated time:** 15-25 minutes');
    expect(content('chapter_01_1').fr).not.toContain('**Durée estimée :** 15-25 minutes');
    expect(card('chapter_03', 'Watch Out · Durable Project Context · 4 min').front.fr).toBe('À surveiller · Contexte de projet durable · 4 min');
    expect(card('chapter_05', 'Watch Out · Packaging Workflows · 3 min').front.fr).toBe('À surveiller · Flux de travail d’empaquetage · 3 min');
  });

  it('removes unsourced video recommendations and keeps the source Key Takeaways recap', () => {
    expect(chapter('chapter_06').blocks.some((item: any) => item.type === 'video')).toBe(false);
    expect(chapter('chapter_06').title.fr).toBe('Points clés à retenir');
    expect(content('chapter_06').fr).toContain('## Sept points clés à retenir');
    expect(content('chapter_06').fr).toContain('Le transport et la portée sont des décisions indépendantes');
    expect(course.videoRecommendationStatus).toBe('none');
  });

  it('exposes the sole Claude-validated written checkpoint as a required standard gate', () => {
    const exercise = course.exercises.find((item: any) => item.id === 'ex_claude_certified_developer_foundations__03_001');
    expect(exercise).toMatchObject({ chapterId: 'chapter_01', required: true, completionRequiresCorrectAnswer: false });
    expect(exercise.inputSchema.minWords).toBeGreaterThanOrEqual(15);
    expect(chapter('chapter_01').blocks).toContainEqual({ type: 'checkpoint', exerciseId: exercise.id });
    expect(chapter('chapter_01').completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });

  it('restores checkpoint 4 with the standard server-validated choice interaction', () => {
    const checkpoint = chapter('chapter_05');
    const prompt = checkpoint.blocks.find((item: any) => item.type === 'content' && item.body.en.includes('name: deploy-validate'));
    const exercise = checkpoint.blocks.find((item: any) => item.id === 'checkpoint4_fix_plugin_definition');
    expect(prompt.body.en).toContain('/Users/author/work/deploy-plugin/scripts/validate.sh');
    expect(prompt.body.fr).toContain('/Users/author/work/deploy-plugin/scripts/validate.sh');
    expect(exercise).toMatchObject({ type: 'single_choice_exercise', serverValidated: true });
    expect(exercise).not.toHaveProperty('correctAnswer');
    expect(exercise).not.toHaveProperty('explanation');
    expect(exercise.options).toHaveLength(4);
    expect(checkpoint.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });

  it('restores the Skilljar Durable Context and MCP transport checkpoints with standard matching gates', () => {
    const durable = chapter('chapter_03');
    const mcp = chapter('chapter_skilljar_mcp_servers');
    const durableCheckpoint = durable.blocks.find((item: any) => item.id === 'checkpoint_s07_durable_project_context');
    const mcpCheckpoint = mcp.blocks.find((item: any) => item.id === 'checkpoint_s14_mcp_servers');

    expect(durableCheckpoint).toMatchObject({ type: 'matching', pairs: expect.any(Array) });
    expect(durableCheckpoint.pairs).toHaveLength(2);
    expect(JSON.stringify(durableCheckpoint)).toContain('PreToolUse');
    expect(JSON.stringify(durableCheckpoint)).toContain('.env.production');
    expect(mcpCheckpoint).toMatchObject({ type: 'matching', pairs: expect.any(Array) });
    expect(mcpCheckpoint.pairs).toHaveLength(4);
    expect(JSON.stringify(mcpCheckpoint)).toContain('HTTP + Enterprise');
    expect(durable.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    expect(mcp.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });

  it('restores MCP and Enterprise teaching from the Skilljar source with standard content and cards', () => {
    const mcp = chapter('chapter_skilljar_mcp_servers');
    const enterprise = chapter('chapter_skilljar_enterprise_integration');
    expect(mcp.title.fr).toBe('Serveurs MCP');
    expect(content('chapter_skilljar_mcp_servers').fr).toContain('## Modèle de serveur');
    expect(content('chapter_skilljar_mcp_servers').fr).toContain('`stdio`');
    expect(content('chapter_skilljar_mcp_servers').fr).toContain('`cache_control`');
    expect(enterprise.title.fr).toBe('Intégration enterprise');
    expect(content('chapter_skilljar_enterprise_integration').fr).toContain('redirect URIs OAuth');
    expect(enterprise.blocks.find((item: any) => item.type === 'flip_cards').cards).toHaveLength(3);
  });

  it('uses a server-validated standard choice for the Enterprise authentication checkpoint without a public answer key', () => {
    const enterprise = chapter('chapter_skilljar_enterprise_integration');
    const checkpoint = enterprise.blocks.find((item: any) => item.id === 'checkpoint_s17_enterprise_integration');
    const context = enterprise.blocks.find((item: any) => item.id === 'checkpoint_s17_enterprise_integration_context');
    expect(checkpoint).toMatchObject({ type: 'single_choice_exercise', serverValidated: true });
    expect(checkpoint.options).toHaveLength(3);
    expect(context.body.en).toContain('401 Unauthorized');
    expect(checkpoint).not.toHaveProperty('correctAnswer');
    expect(checkpoint).not.toHaveProperty('explanation');
    expect(enterprise.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
  });

  it('restores the two Skilljar cumulative tasks with a standard answer-first, reflection-gated sequence', () => {
    for (const sourceScreenId of ['S18', 'S19']) {
      const cumulative = chapter(`chapter_skilljar_cumulative_${sourceScreenId.toLowerCase()}`);
      const exercise = cumulative.blocks.find((item: any) => item.type === 'cloud_exercise');
      expect(cumulative).toMatchObject({ sourceScreenId, type: 'exercise', durationMinutes: 6 });
      expect(cumulative.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
      expect(exercise).toMatchObject({ minimumAnswerLength: 10, requirePostRevealReflection: true });
      expect(exercise.postRevealReflectionOptions).toHaveLength(4);
      expect(exercise.postRevealReflectionOptions.filter((item: any) => item.passes)).toHaveLength(1);
      if (sourceScreenId === 'S18') expect(exercise.solution.fr).toContain('`bypassPermissions`');
      else expect(exercise.solution.fr).toContain('```');
      expect(exercise.postRevealReflectionTitle.fr.length).toBeGreaterThan(8);
    }
    expect(JSON.stringify(course)).not.toContain('sk-prod-warehouse-abc123');
  });
});
