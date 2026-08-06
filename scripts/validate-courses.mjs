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
 *   6. Quiz: duplicate or near-duplicate options (Levenshtein < 5)
 *   7. Quiz: correctId/correctChoiceIds pointing to non-existent option
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COURSES_DIR = join(__dirname, '../client/public/data/courses');
const DATA_DIR    = join(__dirname, '../client/public/data');

// ─── Levenshtein distance (for near-duplicate detection) ─────────────────────
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// ─── Extract plain text from a multilingual field ────────────────────────────
function getText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.en || val.fr || Object.values(val)[0] || '';
  return String(val);
}

// ─── Validate a single question object ───────────────────────────────────────
const LEVENSHTEIN_THRESHOLD = 5;

function validateQuestion(q, context) {
  const issues = [];
  const choices = q.choices || q.options || [];
  if (!Array.isArray(choices) || choices.length === 0) return issues;

  // Build map of id → text
  const choiceMap = new Map();
  const choiceTexts = [];
  for (const c of choices) {
    const id = c.id || '';
    const text = getText(c.text || c.label || c).trim(); // preserve case — "a, b, c, d" ≠ "A, B, C, D"
    choiceMap.set(id, text);
    choiceTexts.push({ id, text, raw: getText(c.text || c.label || c) });
  }

  // ── Check 1: Duplicate or near-duplicate options ──────────────────────────
  for (let i = 0; i < choiceTexts.length; i++) {
    for (let j = i + 1; j < choiceTexts.length; j++) {
      const a = choiceTexts[i];
      const b = choiceTexts[j];
      if (!a.text || !b.text) continue;
      const dist = levenshtein(a.text.toLowerCase(), b.text.toLowerCase());
      if (dist === 0) {
        // Only flag as error if the raw texts are also identical (same case)
        // Case-only differences (e.g. "a, b, c, d" vs "A, B, C, D") are intentional distractors
        if (a.text === b.text) {
        issues.push({
          level: 'error',
          type: 'duplicate_choice',
          msg: `${context}: options "${a.id}" and "${b.id}" are identical — "${a.raw.slice(0, 60)}"`,
        });
        } else {
          issues.push({
            level: 'warn',
            type: 'case_only_duplicate',
            msg: `${context}: options "${a.id}" and "${b.id}" differ only in case — "${a.raw.slice(0, 40)}" vs "${b.raw.slice(0, 40)}"`,
          });
        }
      } else if (dist < LEVENSHTEIN_THRESHOLD && a.text.length >= 10 && b.text.length >= 10) {
        // Only flag near-duplicates for options with meaningful length (≥10 chars)
        // Short options (HTTP codes, dates, numbers, single words) are intentionally similar
        issues.push({
          level: 'warn',
          type: 'near_duplicate_choice',
          msg: `${context}: options "${a.id}" and "${b.id}" are near-identical (dist=${dist}) — "${a.raw.slice(0, 50)}" vs "${b.raw.slice(0, 50)}"`,
        });
      }
    }
  }

  // ── Check 2: correctId / correctChoiceIds point to existing options ────────
  const validIds = new Set(choiceTexts.map(c => c.id));

  // Single correct answer (lessonQuizzes format)
  if ('correctId' in q) {
    const cid = q.correctId;
    if (cid && !validIds.has(cid)) {
      issues.push({
        level: 'error',
        type: 'invalid_correct_id',
        msg: `${context}: correctId "${cid}" does not match any choice id [${[...validIds].join(', ')}]`,
      });
    }
    if (!cid) {
      issues.push({
        level: 'error',
        type: 'missing_correct_id',
        msg: `${context}: correctId is empty or missing`,
      });
    }
  }

  // Multiple correct answers (mockExamQuestions format)
  if ('correctChoiceIds' in q) {
    const ids = Array.isArray(q.correctChoiceIds) ? q.correctChoiceIds : [q.correctChoiceIds];
    if (ids.length === 0) {
      issues.push({
        level: 'error',
        type: 'missing_correct_id',
        msg: `${context}: correctChoiceIds is empty`,
      });
    }
    for (const cid of ids) {
      if (cid && !validIds.has(cid)) {
        issues.push({
          level: 'error',
          type: 'invalid_correct_id',
          msg: `${context}: correctChoiceId "${cid}" does not match any choice id [${[...validIds].join(', ')}]`,
        });
      }
    }
  }

  // Legacy formats
  for (const key of ['answer', 'correctAnswer']) {
    if (key in q && q[key]) {
      const cid = String(q[key]);
      if (!validIds.has(cid)) {
        issues.push({
          level: 'error',
          type: 'invalid_correct_id',
          msg: `${context}: ${key} "${cid}" does not match any choice id [${[...validIds].join(', ')}]`,
        });
      }
    }
  }

  return issues;
}

// ─── Scan all questions in a JSON object recursively ─────────────────────────
function scanQuestionsInObject(obj, path = '') {
  const issues = [];
  if (!obj || typeof obj !== 'object') return issues;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      issues.push(...scanQuestionsInObject(obj[i], `${path}[${i}]`));
    }
    return issues;
  }

  // Detect question objects: must have 'question' + ('choices' or 'options')
  const hasQuestion = 'question' in obj;
  const hasChoices = Array.isArray(obj.choices) || Array.isArray(obj.options);
  if (hasQuestion && hasChoices) {
    const qText = getText(obj.question).slice(0, 80);
    const context = `Q "${qText}" at ${path}`;
    issues.push(...validateQuestion(obj, context));
  }

  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      issues.push(...scanQuestionsInObject(val, `${path}.${key}`));
    }
  }
  return issues;
}

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

  // ── 6 & 7. Quiz validation (questions embedded in course JSON) ────────────
  const courseQuizIssues = scanQuestionsInObject(data);
  for (const qi of courseQuizIssues) {
    fileIssues.push(qi);
    if (qi.level === 'error') totalErrors++;
    else totalWarnings++;
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

// ─── Scan lessonQuizzes.json ──────────────────────────────────────────────────
const lessonQuizzesPath = join(DATA_DIR, 'lessonQuizzes.json');
const mockExamPath      = join(DATA_DIR, 'mockExamQuestions.json');

let quizErrors = 0;
let quizWarnings = 0;
const quizReport = [];

function scanQuizFile(filePath, label) {
  if (!existsSync(filePath)) return;
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`❌ [PARSE ERROR] ${label}: ${e.message}`);
    quizErrors++;
    return;
  }
  const issues = scanQuestionsInObject(data);
  if (issues.length > 0) {
    quizReport.push({ file: label, issues });
    for (const i of issues) {
      if (i.level === 'error') quizErrors++;
      else quizWarnings++;
    }
  }
}

scanQuizFile(lessonQuizzesPath, 'lessonQuizzes.json');
scanQuizFile(mockExamPath, 'mockExamQuestions.json');

if (quizReport.length > 0) {
  console.log(`\n${BOLD}Quiz Validation${RESET}\n`);
  for (const { file, issues } of quizReport) {
    const hasErrors = issues.some(i => i.level === 'error');
    const icon = hasErrors ? `${RED}✗${RESET}` : `${YELLOW}⚠${RESET}`;
    console.log(`${icon} ${BOLD}${file}${RESET} (${issues.length} issues)`);
    for (const issue of issues) {
      const color = issue.level === 'error' ? RED : YELLOW;
      const tag = issue.level === 'error' ? 'ERROR' : 'WARN ';
      console.log(`  ${color}[${tag}]${RESET} ${DIM}${issue.type}${RESET} — ${issue.msg}`);
    }
    console.log('');
  }
  console.log(`${BOLD}Quiz Summary:${RESET} ${RED}${quizErrors} errors${RESET}, ${YELLOW}${quizWarnings} warnings${RESET}`);
} else {
  console.log(`\n${GREEN}✅ All quiz files are valid!${RESET}`);
}

// Exit with error code if there are any errors (useful for CI)
process.exit((totalErrors + quizErrors) > 0 ? 1 : 0);
