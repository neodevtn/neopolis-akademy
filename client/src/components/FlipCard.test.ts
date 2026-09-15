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
});
