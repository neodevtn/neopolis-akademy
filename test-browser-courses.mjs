// Browser-based test: fetch each course page and check for errors
// This simulates what the React app does when loading a course

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://127.0.0.1:3000';
const coursesDir = './client/public/data/courses/';
const files = readdirSync(coursesDir).filter(f => f.endsWith('.json'));

// Get all unique certification IDs
const certIds = [...new Set(files.map(f => f.replace(/__\d+\.json$/, '')))];

console.log(`Testing ${files.length} courses across ${certIds.length} certifications...\n`);

let passed = 0;
let failed = 0;
const failures = [];

for (const file of files) {
  const courseId = file.replace('.json', '');
  const certId = courseId.replace(/__\d+$/, '');
  const url = `${BASE_URL}/training/${certId}/${courseId}`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      // Check if error boundary was triggered
      if (html.includes('An unexpected error occurred') || html.includes('TypeError')) {
        failures.push(`${courseId}: Error boundary triggered`);
        failed++;
      } else {
        passed++;
      }
    } else {
      failures.push(`${courseId}: HTTP ${response.status}`);
      failed++;
    }
  } catch (e) {
    failures.push(`${courseId}: ${e.message}`);
    failed++;
  }
}

console.log(`\n=== Browser Course Loading Test ===`);
console.log(`Passed: ${passed}/${files.length}`);
console.log(`Failed: ${failed}/${files.length}`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => console.log(`  ❌ ${f}`));
} else {
  console.log(`\n✅ All ${files.length} courses load without errors!`);
}
