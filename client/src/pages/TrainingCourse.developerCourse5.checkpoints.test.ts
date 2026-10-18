import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_developer_foundations__05.json';

describe('Developer Foundations course 5 checkpoint integrity', () => {
  const lesson = course.lessons[0] as any;
  const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
  const exercise = (id: string) => (course.exercises as any[]).find((item) => item.id === id);
  it('keeps the Packaging explanation without an unverifiable written checkpoint or phantom gate', () => {
    const packagingId = 'ex_claude_certified_developer_foundations__05_002';
    expect(chapter('chapter_02').blocks.some((block: any) => block.type === 'checkpoint')).toBe(false);
    expect(exercise(packagingId)).toBeUndefined();
    expect(chapter('chapter_02').blocks.find((block: any) => block.type === 'content').body.en).toContain('Fix the broken accelerator template');
    expect(chapter('chapter_02').completionRule).toEqual({ requires: ['contentViewed'] });
    expect(chapter('chapter_13').blocks).not.toContainEqual({ type: 'checkpoint', exerciseId: 'ex_claude_certified_developer_foundations__05_007' });
    expect(chapter('chapter_13').completionRule).toEqual({ requires: ['contentViewed'] });
  });

  it('restores critical lifecycle cards and localizes the learner-facing lifecycle', () => {
    const lifecycle = chapter('chapter_05');
    const text = lifecycle.blocks.map((block: any) => `${block.body?.en ?? ''}\n${block.body?.fr ?? ''}`).join('\n');
    const cards = lifecycle.blocks.filter((block: any) => block.type === 'flip_cards').flatMap((block: any) => block.cards);
    expect(text).toContain('1 — Exigences');
    expect(text).toContain('7 — Itération');
    expect(cards.map((card: any) => card.back.fr).join('\n')).toContain('Un jalon est une décision de passer d’une phase à la suivante');
    expect(cards.map((card: any) => card.back.fr).join('\n')).not.toMatch(/(?:après un diff\.|Le modèle)$/m);
  });

  it('renders the repaired packaging, contribution and platform references as Markdown tables', () => {
    const tableChecks = [
      ['chapter_01', '| Asset type | What it bundles | What correct packaging requires |', '| Type d’asset | Ce qu’il regroupe | Ce que nécessite un emballage correct |', 'Asset typeWhat it bundlesWhat correct packaging requires'],
      ['chapter_01', '| Asset type | What to parameterize | What to document | What to bundle for audit |', '| Type d’asset | Ce qui doit être paramétré | Ce qui doit être documenté | Ce qui doit être inclus pour l’audit |', 'Asset typeWhat to parameterizeWhat to documentWhat to bundle for audit'],
      ['chapter_03', '| Channel | What a maintainer checks | Licensing and attribution | The example and test bar to clear |', '| Canal | Ce que vérifie un mainteneur | Licences et attribution |', 'ChannelWhat a maintainer checksLicensing and attributionThe example and test bar to clear'],
      ['chapter_09', '| Platform | Identity and data model | When to choose it | How versioning is pinned |', '| Plateforme | Identité et modèle de données | Quand le choisir | Comment le versionnage est épinglé |', 'PlatformIdentity and data modelWhen to choose itHow versioning is pinned'],
    ] as const;

    for (const [chapterId, enHeader, frHeader, legacyHeader] of tableChecks) {
      const content = chapter(chapterId).blocks.find((block: any) => block.type === 'content').body;
      expect(content.en).toContain(enHeader);
      expect(content.fr).toContain(frHeader);
      expect(content.en).not.toContain(legacyHeader);
      expect(content.fr).not.toContain(legacyHeader);
    }
  });

  it('restores all additional cards without clipped endings', () => {
    const cards = ['chapter_01', 'chapter_03', 'chapter_13'].flatMap((chapterId) =>
      chapter(chapterId).blocks.filter((block: any) => block.type === 'flip_cards').flatMap((block: any) => block.cards),
    );
    const text = cards.map((card: any) => `${card.back.en}\n${card.back.fr}`).join('\n');
    expect(text).toContain('They had to rewrite it from scratch.');
    expect(text).toContain('Ils ont dû le réécrire à zéro.');
    expect(text).toContain('requires an explicit boundary control');
    expect(text).not.toMatch(/(?:The templa|Le modèle|the reb|le reb|fast re)$/m);
  });

  it('localizes the selected learner-facing labels while preserving provider and API names', () => {
    const packaging = chapter('chapter_01').blocks.find((block: any) => block.type === 'content').body.fr;
    const deployment = chapter('chapter_09').blocks.find((block: any) => block.type === 'content').body.fr;
    const courseText = JSON.stringify(course);
    expect(packaging).toContain('Extrayez les valeurs spécifiques au domaine dans la configuration');
    expect(packaging).toContain('Paquet de serveur MCP');
    expect(packaging).toContain('le barème de notation');
    expect(courseText).toContain('Point de contrôle 2 : Choisissez le canal de contribution et le prérequis manquant');
    expect(courseText).toContain('Phase de déploiement — Choix de plateforme guidé par les exigences de conformité');
    expect(courseText).toContain('Point de contrôle 5 : Associer la plateforme de déploiement et la version épinglée');
    expect(courseText).toContain("Point de contrôle 1 : Corriger le modèle d'accélérateur cassé");
    expect(courseText).toContain('Point de contrôle 3 : extraire les exigences');
    expect(courseText).toContain('Point de contrôle 4 : placer le travail dans la bonne phase');
    expect(packaging).not.toContain('Pull les valeurs spécifiques au domaine');
    expect(packaging).not.toContain('MCP Server Package');
    expect(deployment).toContain('| Plateforme | Identité et modèle de données |');
    expect(deployment).toContain('la frontière AWS du client');
    expect(deployment).toContain('Claude Platform on AWS');
    expect(deployment).toContain('First-party Claude API');
    expect(deployment).not.toContain('la boundary AWS du client');
    expect(deployment).not.toContain('processus de release');
  });

  it('replaces the unsourced lifecycle sorts with the mandatory Skilljar S07B and S07D checkpoints', () => {
    const lifecycle = chapter('chapter_05');
    const questionOne = lifecycle.blocks.find((block: any) => block.id === 'skilljar_s07b_q1');
    const questionTwo = lifecycle.blocks.find((block: any) => block.id === 'skilljar_s07b_q2');
    const matching = lifecycle.blocks.find((block: any) => block.id === 'skilljar_s07d');

    expect(lifecycle.completionRule).toEqual({ requires: ['contentViewed', 'requiredExercisesPassed'] });
    for (const question of [questionOne, questionTwo]) {
      expect(question).toMatchObject({ type: 'single_choice_exercise', sourceScreenId: 'S07B', serverValidated: true });
      expect(question.options).toHaveLength(4);
      expect(JSON.stringify(question)).not.toContain('correctAnswer');
    }
    expect(matching).toMatchObject({ type: 'matching', sourceScreenId: 'S07D' });
    expect(matching.pairs).toHaveLength(5);
    expect(matching.feedback.fr).toContain('résidence des données');
    expect(lifecycle.blocks).not.toContainEqual(expect.objectContaining({ type: 'bucket_sort', title: { en: 'Checkpoint 3: extract requirements — Try now' } }));
    expect(lifecycle.blocks).not.toContainEqual(expect.objectContaining({ type: 'bucket_sort', title: { en: 'Checkpoint 4: place work in the correct phase — Try now' } }));
    expect(exercise('ex_claude_certified_developer_foundations__05_012')).toBeUndefined();
  });

  it('removes the two unverifiable Skilljar cumulative deployment tasks without leaving a phantom gate', () => {
    const ids = ['chapter_skilljar_05_s17', 'chapter_skilljar_05_s18'];
    const recapIndex = lesson.chapters.findIndex((item: any) => item.id === 'chapter_10_1');
    const retiredScreens = ids.map(chapter).filter(Boolean);
    expect(recapIndex).toBeGreaterThan(-1);
    expect(retiredScreens.every((screen: any) =>
      screen.requiredBeforeAdvance !== true &&
      !screen.completionRule?.requires?.includes('cloudExerciseCompleted') &&
      screen.blocks.every((block: any) => block.type !== 'cloud_exercise'),
    )).toBe(true);
    expect(retiredScreens.every((screen: any) => screen.blocks.length > 0 && screen.blocks.some((block: any) => block.type === 'content'))).toBe(true);
    expect(lesson.chapters.filter((item: any) => item.completionRule?.requires?.includes('cloudExerciseCompleted')).every((item: any) =>
      item.blocks.some((block: any) => block.type === 'cloud_exercise'),
    )).toBe(true);
  });
});
