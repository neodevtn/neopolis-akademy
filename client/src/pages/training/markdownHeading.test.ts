import { describe, expect, it } from 'vitest';
import { parseMarkdownHeading } from './markdownHeading';

describe('parseMarkdownHeading', () => {
  it('parses all supported Markdown heading levels without preserving literal hashes', () => {
    expect(parseMarkdownHeading('#### Source')).toEqual({ level: 4, text: 'Source' });
    expect(parseMarkdownHeading('###### Detail')).toEqual({ level: 6, text: 'Detail' });
    expect(parseMarkdownHeading('plain paragraph')).toBeNull();
  });
});
