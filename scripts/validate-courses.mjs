#!/usr/bin/env node
/**
 * validate-courses.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Pipeline validation script for course JSON files.
 * Run: node scripts/validate-courses.mjs [--fix] [--file <filename>]
 *
 * Checks performed:
 *   1. Duplicate chapter IDs within a lesson
 *   2. Duplicate lesson IDs within a course
 *   3. Skilljar navigation artifacts in text fields
 *   4. Missing required fields (id, title, lessons)
 *   5. Empty chapter blocks arrays
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COURSES_DIR = join(__dirname, '../client/public/data/courses');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const FILE_FILTER = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

// ─── Patterns Skilljar à détecter ────────────────────────────────────────────
const SKILLJAR_PATTERNS = [
  { name: 'compare_with_model_answer', pattern: /Compare with model answer/i },
  { name: 'broken_code_label',         pattern: /Broken code shown to the learner/i },
  { name: 'reveal_model_answers',      pattern: /Reveal model answers/i },
  { name: 'module_complete_nav',       pattern: /Module Complete\w*\s*[\w\s]*Path·\d+ min/i },
  { name: 'skilljar_skip_nav',         pattern: /Skip: Move on if you need to/i },
  { name: 'mark_complete_nav',         pattern: /Mark this complete when you are satisfied/i },
  { name: 'skilljar_skipped',          pattern: /\nSkipped\n/ },
  { name: 'checkpoint_header',         pattern: /Checkpoint \d+.*·.*\d+ min/ },
  { name: 'flat_grading_table',        pattern: /Task typeGrading|What it catchesWhere/ },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scanTextForSkilljar(text) {
  return SKILLJAR_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ name }) => name);
}

function scanObjectForSkilljar(obj, path = '') {
  const issues = [];
  if (typeof obj === 'string') {
    const found = scanTextForSkilljar(obj);
    if (found.length > 0) {
      issues.push({ path, patterns: found, preview: obj.slice(0, 100).replace(/\n/g, ' ') });
    }
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      issues.push(...scanObjectForSkilljar(val, `${path}.${key}`));
    }
  }
  return issues;
}

function fixDuplicateChapterIds(lessons) {
  let fixCount = 0;
  for (const lesson of lessons) {
    const chapters = lesson.chapters || [];
    const seen = new Map();
    for (let idx = 0; idx < chapters.length; idx++) {
      const ch = chapters[idx];
      const cid = ch.id || '';
      if (seen.has(cid)) {
        const newId = `chapter_${String(idx).padStart(2, '0')}`;
        ch.id = newId;
        fixCount++;
      } else {
        seen.set(cid, idx);
      }
    }
  }
  return fixCount;
}

// ─── Main validation ──────────────────────────────────────────────────────────
let totalErrors = 0;
let totalWarnings = 0;
let totalFixed = 0;
const report = [];

const files = readdirSync(COURSES_DIR)
  .filter(f => f.endsWith('.json'))
  .filter(f => !FILE_FILTER || f === FILE_FILTER)
  .sort();

for (const fname of files) {
  const fpath = join(COURSES_DIR, fname);
  let data;
  try {
    data = JSON.parse(readFileSync(fpath, 'utf-8'));
  } catch (e) {
    console.error(`❌ [PARSE ERROR] ${fname}: ${e.message}`);
    totalErrors++;
    continue;
  }

  const fileIssues = [];
  let fileFixed = 0;

  // ── 1. Required fields ────────────────────────────────────────────────────
  // Accept both formats: { id, title, lessons } and { courseId, sourceCourseTitle, lessons }
  const courseId = data.id || data.courseId;
  const courseTitle = data.title || data.sourceCourseTitle;
  if (!courseId) fileIssues.push({ level: 'warn', type: 'missing_field', msg: 'Missing "id" or "courseId" field' });
  if (!courseTitle) fileIssues.push({ level: 'warn', type: 'missing_field', msg: 'Missing "title" or "sourceCourseTitle" field' });
  if (!Array.isArray(data.lessons)) {
    fileIssues.push({ level: 'error', type: 'missing_field', msg: 'Missing or invalid "lessons" array' });
  }

  // ── 2. Duplicate lesson IDs ───────────────────────────────────────────────
  if (Array.isArray(data.lessons)) {
    const lessonIds = new Map();
    for (const [li, lesson] of data.lessons.entries()) {
      const lid = lesson.id || `lesson_${li}`;
      if (lessonIds.has(lid)) {
        fileIssues.push({
          level: 'error',
          type: 'duplicate_lesson_id',
          msg: `Duplicate lesson ID "${lid}" at positions ${lessonIds.get(lid)} and ${li}`,
        });
        totalErrors++;
      } else {
        lessonIds.set(lid, li);
      }

      // ── 3. Duplicate chapter IDs ─────────────────────────────────────────
      const chapters = lesson.chapters || [];
      const chapterIds = new Map();
      for (const [ci, ch] of chapters.entries()) {
        const cid = ch.id || `chapter_${ci}`;
        if (chapterIds.has(cid)) {
          fileIssues.push({
            level: 'error',
            type: 'duplicate_chapter_id',
            msg: `Lesson "${lid}": duplicate chapter ID "${cid}" at positions ${chapterIds.get(cid)} and ${ci}`,
          });
          totalErrors++;
        } else {
          chapterIds.set(cid, ci);
        }
      }

      // ── 4. Empty chapters ─────────────────────────────────────────────────
      if (chapters.length === 0) {
        fileIssues.push({ level: 'warn', type: 'empty_lesson', msg: `Lesson "${lid}" has no chapters` });
        totalWarnings++;
      }
    }
  }

  // ── 5. Skilljar artifacts ─────────────────────────────────────────────────
  const skilljarIssues = scanObjectForSkilljar(data);
  for (const si of skilljarIssues) {
    fileIssues.push({
      level: 'warn',
      type: 'skilljar_artifact',
      msg: `Skilljar artifact [${si.patterns.join(', ')}] at ${si.path}: "${si.preview}"`,
    });
    totalWarnings++;
  }

  // ── Auto-fix if --fix flag ────────────────────────────────────────────────
  if (FIX_MODE && Array.isArray(data.lessons)) {
    const fixed = fixDuplicateChapterIds(data.lessons);
    if (fixed > 0) {
      writeFileSync(fpath, JSON.stringify(data, null, 2), 'utf-8');
      fileFixed = fixed;
      totalFixed += fixed;
    }
  }

  if (fileIssues.length > 0 || fileFixed > 0) {
    report.push({ file: fname, issues: fileIssues, fixed: fileFixed });
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const RED   = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';

console.log(`\n${BOLD}Course JSON Validation${RESET} — ${files.length} files scanned\n`);

if (report.length === 0) {
  console.log(`${GREEN}✅ All course files are valid!${RESET}\n`);
} else {
  for (const { file, issues, fixed } of report) {
    const hasErrors = issues.some(i => i.level === 'error');
    const icon = hasErrors ? `${RED}✗${RESET}` : `${YELLOW}⚠${RESET}`;
    console.log(`${icon} ${BOLD}${file}${RESET}${fixed > 0 ? ` ${GREEN}(${fixed} auto-fixed)${RESET}` : ''}`);
    for (const issue of issues) {
      const color = issue.level === 'error' ? RED : YELLOW;
      const tag = issue.level === 'error' ? 'ERROR' : 'WARN ';
      console.log(`  ${color}[${tag}]${RESET} ${DIM}${issue.type}${RESET} — ${issue.msg}`);
    }
    console.log('');
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`${BOLD}Summary:${RESET} ${RED}${totalErrors} errors${RESET}, ${YELLOW}${totalWarnings} warnings${RESET}${totalFixed > 0 ? `, ${GREEN}${totalFixed} auto-fixed${RESET}` : ''}`);

if (FIX_MODE && totalFixed > 0) {
  console.log(`\n${GREEN}✅ Auto-fix applied. Re-run without --fix to verify.${RESET}`);
}

// Exit with error code if there are errors (useful for CI)
process.exit(totalErrors > 0 ? 1 : 0);
