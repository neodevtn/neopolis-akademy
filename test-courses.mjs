// Test all course JSON files for data issues that could cause crashes
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const coursesDir = './client/public/data/courses/';
const files = readdirSync(coursesDir).filter(f => f.endsWith('.json'));

let totalIssues = 0;
const issues = [];

for (const file of files) {
  const filePath = join(coursesDir, file);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (e) {
    issues.push(`${file}: PARSE ERROR - ${e.message}`);
    totalIssues++;
    continue;
  }

  // Check sections.lessons for undefined/null entries
  if (data.sections) {
    for (let si = 0; si < data.sections.length; si++) {
      const section = data.sections[si];
      if (section.lessons) {
        for (let li = 0; li < section.lessons.length; li++) {
          const lesson = section.lessons[li];
          if (!lesson || typeof lesson !== 'string') {
            issues.push(`${file}: sections[${si}].lessons[${li}] is ${JSON.stringify(lesson)} (not a string)`);
            totalIssues++;
          }
        }
      }
    }
  }

  // Check lessons for missing/invalid title
  const lessons = data.lessons || [];
  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li];
    if (!lesson.title) {
      issues.push(`${file}: lessons[${li}].title is missing/falsy`);
      totalIssues++;
    } else if (typeof lesson.title === 'object' && !lesson.title.en && !lesson.title.fr) {
      issues.push(`${file}: lessons[${li}].title is an object but has no en/fr: ${JSON.stringify(lesson.title)}`);
      totalIssues++;
    }

    // Check chapters within lessons
    const chapters = lesson.chapters || [];
    for (let ci = 0; ci < chapters.length; ci++) {
      const ch = chapters[ci];
      // Check blocks for body field being non-string
      const blocks = ch.blocks || ch.block || [];
      const blockArr = Array.isArray(blocks) ? blocks : [blocks];
      for (let bi = 0; bi < blockArr.length; bi++) {
        const block = blockArr[bi];
        if (block && block.body && typeof block.body !== 'string' && typeof block.body !== 'object') {
          issues.push(`${file}: lessons[${li}].chapters[${ci}].blocks[${bi}].body is type ${typeof block.body}`);
          totalIssues++;
        }
        if (block && block.body && typeof block.body === 'object' && block.body !== null) {
          // i18n object - check it has en or fr
          if (!block.body.en && !block.body.fr && !Array.isArray(block.body)) {
            issues.push(`${file}: lessons[${li}].chapters[${ci}].blocks[${bi}].body is object without en/fr`);
            totalIssues++;
          }
        }
      }
    }
  }

  // Check videos for missing/invalid title
  const videos = data.videos || [];
  for (let vi = 0; vi < videos.length; vi++) {
    const v = videos[vi];
    if (!v.title) {
      issues.push(`${file}: videos[${vi}].title is missing/falsy`);
      totalIssues++;
    } else if (typeof v.title === 'object' && !v.title.en && !v.title.fr) {
      issues.push(`${file}: videos[${vi}].title is object without en/fr: ${JSON.stringify(v.title)}`);
      totalIssues++;
    }
  }
}

console.log(`\n=== Course Data Validation ===`);
console.log(`Files tested: ${files.length}`);
console.log(`Total issues: ${totalIssues}`);
if (issues.length > 0) {
  console.log(`\nIssues found:`);
  issues.forEach(i => console.log(`  ⚠️  ${i}`));
} else {
  console.log(`\n✅ All course files pass validation - no crash-prone data found.`);
}
