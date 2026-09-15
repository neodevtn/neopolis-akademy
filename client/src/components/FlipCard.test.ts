import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'client/src/components/FlipCard.tsx'), 'utf8');

describe('FlipCard localisation and accessibility contract', () => {
  it('provides translated labels for English, French, and Arabic', () => {
    expect(source).toContain("fr: { card: 'Carte', flip: 'Retourner' }");
    expect(source).toContain("ar: { card: 'بطاقة', flip: 'اقلب' }");
    expect(source).toContain("en: { card: 'Card', flip: 'Flip' }");
  });

  it('keeps keyboard activation and an exposed button semantic', () => {
    expect(source).toContain("event.key === 'Enter' || event.key === ' '");
    expect(source).toContain('role="button"');
    expect(source).toContain('tabIndex={0}');
    expect(source).toContain('aria-pressed={isFlipped}');
  });

  it('sizes both faces from their content and keeps a one-column narrow layout without truncation utilities', () => {
    expect(source).toContain('const maxH = Math.max(frontH, backH, 140);');
    expect(source).toContain('setCardHeight(maxH + 40);');
    expect(source).toContain("height: `${cardHeight}px`");
    expect(source).toContain('overflow-y-auto');
    expect(source).toContain('grid-cols-1 sm:grid-cols-2');
    expect(source).not.toContain('truncate');
    expect(source).not.toContain('line-clamp');
  });
});
