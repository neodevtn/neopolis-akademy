import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../client/public/data/courses');

function getAllCourseFiles(): string[] {
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.startsWith('claude_certified_') && f.endsWith('.json') && !f.includes('Index') && !f.includes('Quiz'));
}

describe('Course JSON Quality', () => {
  const courseFiles = getAllCourseFiles();

  it('should have at least 20 course files', () => {
    expect(courseFiles.length).toBeGreaterThanOrEqual(20);
  });

  it('should not contain "Flip" artifacts in any course', () => {
    for (const file of courseFiles) {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      expect(content).not.toContain('Flip ↻');
      expect(content).not.toContain('↻');
    }
  });

  it('should not contain mojibake characters (â, Ã) in any course', () => {
    for (const file of courseFiles) {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      expect(content).not.toMatch(/â€[™""\u0098\u0099\u009c\u009d]/);
      expect(content).not.toMatch(/Ã[©¨®´]/);
    }
  });

  it('should not contain raw HTML/CSS/JS artifacts (.ccc-, <script, <style)', () => {
    for (const file of courseFiles) {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      expect(content).not.toContain('.ccc-');
      expect(content).not.toMatch(/<script[\s>]/i);
      expect(content).not.toMatch(/<style[\s>]/i);
    }
  });

  it('every exercise should have interactionType field', () => {
    const validTypes = ['free_text', 'code', 'single_choice', 'multi_choice', 'checklist', 'scenario'];
    for (const file of courseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      if (data.exercises && Array.isArray(data.exercises)) {
        for (const ex of data.exercises) {
          expect(ex.interactionType).toBeDefined();
          expect(validTypes).toContain(ex.interactionType);
        }
      }
    }
  });

  it('every exercise should have prompt field with localized text', () => {
    for (const file of courseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      if (data.exercises && Array.isArray(data.exercises)) {
        for (const ex of data.exercises) {
          expect(ex.prompt).toBeDefined();
          expect(ex.prompt.en || ex.prompt.fr).toBeTruthy();
        }
      }
    }
  });

  it('every exercise should have correction field (can be empty for free_text self-assessment)', () => {
    for (const file of courseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      if (data.exercises && Array.isArray(data.exercises)) {
        for (const ex of data.exercises) {
          // correction field must exist (even if empty string for free_text exercises)
          expect('correction' in ex).toBe(true);
          // For non-free_text types, correction should have content
          if (ex.interactionType !== 'free_text') {
            expect(ex.correction).toBeTruthy();
          }
        }
      }
    }
  });

  it('choice-type exercises should have options array', () => {
    for (const file of courseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      if (data.exercises && Array.isArray(data.exercises)) {
        for (const ex of data.exercises) {
          if (['single_choice', 'multi_choice', 'checklist'].includes(ex.interactionType)) {
            expect(ex.options).toBeDefined();
            expect(Array.isArray(ex.options)).toBe(true);
            expect(ex.options.length).toBeGreaterThan(1);
          }
        }
      }
    }
  });
});
