import { describe, expect, it } from 'vitest';
import course from '../../public/data/courses/claude_certified_developer_foundations__05.json';

describe('Developer Foundations course 5 checkpoint integrity', () => {
  const lesson = course.lessons[0] as any;
  const chapter = (id: string) => lesson.chapters.find((item: any) => item.id === id);
  const exercise = (id: string) => (course.exercises as any[]).find((item) => item.id === id);
  it('uses the same-chapter Packaging exercise and exposes no missing trust-boundary exercise', () => {
    const packagingId = 'ex_claude_certified_developer_foundations__05_002';
    expect(chapter('chapter_02').blocks).toContainEqual({ type: 'checkpoint', exerciseId: packagingId });
    expect(exercise(packagingId)).toMatchObject({ chapterId: 'chapter_02', required: true, completionRequiresCorrectAnswer: false });
    expect(exercise(packagingId).inputSchema.minWords).toBeGreaterThanOrEqual(15);
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
    expect(packaging).toContain('Extrayez les valeurs spécifiques au domaine dans la configuration');
    expect(packaging).toContain('Paquet de serveur MCP');
    expect(packaging).toContain('le barème de notation');
    expect(packaging).not.toContain('Pull les valeurs spécifiques au domaine');
    expect(packaging).not.toContain('MCP Server Package');
    expect(deployment).toContain('| Plateforme | Identité et modèle de données |');
    expect(deployment).toContain('la frontière AWS du client');
    expect(deployment).toContain('Claude Platform on AWS');
    expect(deployment).toContain('First-party Claude API');
    expect(deployment).not.toContain('la boundary AWS du client');
    expect(deployment).not.toContain('processus de release');
  });
});
