#!/usr/bin/env node
/**
 * Lighthouse Performance Report Generator
 * 
 * Runs Lighthouse CI audits and generates a markdown report
 * with performance scores, Core Web Vitals, and recommendations.
 * 
 * Usage:
 *   node scripts/lighthouse-report.mjs [--url <url>] [--output <path>]
 * 
 * Options:
 *   --url     Target URL (default: https://akademy.neodev.click/)
 *   --output  Output report path (default: ./lighthouse-reports/report.md)
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const targetUrl = getArg('url') || 'https://akademy.neodev.click/';
const outputDir = resolve('./lighthouse-reports');
const outputPath = getArg('output') || join(outputDir, 'report.md');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`🔍 Running Lighthouse audit on: ${targetUrl}`);
console.log(`📊 Reports will be saved to: ${outputDir}\n`);

// Run LHCI collect
try {
  execSync(
    `npx lhci collect --url="${targetUrl}" --numberOfRuns=1 --settings.preset=desktop --settings.onlyCategories=performance,accessibility,best-practices,seo`,
    { stdio: 'inherit', cwd: resolve('.') }
  );
} catch (e) {
  console.error('⚠️  Lighthouse collect completed with warnings');
}

// Find the latest result JSON
const lhciDir = resolve('.lighthouseci');
if (!existsSync(lhciDir)) {
  console.error('❌ No Lighthouse results found. Make sure the target URL is accessible.');
  process.exit(1);
}

const jsonFiles = readdirSync(lhciDir).filter(f => f.endsWith('.json') && f.startsWith('lhr-'));
if (jsonFiles.length === 0) {
  console.error('❌ No Lighthouse result JSON files found.');
  process.exit(1);
}

// Parse the latest result
const latestFile = jsonFiles.sort().pop();
const result = JSON.parse(readFileSync(join(lhciDir, latestFile), 'utf-8'));

// Extract scores
const categories = result.categories;
const audits = result.audits;

const getScore = (cat) => categories[cat] ? Math.round(categories[cat].score * 100) : 'N/A';
const getScoreEmoji = (score) => {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
};

// Core Web Vitals
const fcp = audits['first-contentful-paint'];
const lcp = audits['largest-contentful-paint'];
const cls = audits['cumulative-layout-shift'];
const tbt = audits['total-blocking-time'];
const si = audits['speed-index'];
const tti = audits['interactive'];

const formatMs = (val) => val ? `${Math.round(val.numericValue)}ms` : 'N/A';
const formatCls = (val) => val ? val.numericValue.toFixed(3) : 'N/A';

// Generate markdown report
const perfScore = getScore('performance');
const a11yScore = getScore('accessibility');
const bpScore = getScore('best-practices');
const seoScore = getScore('seo');

const report = `# Rapport Lighthouse — Neopolis Akademy

**Date** : ${new Date().toISOString().split('T')[0]}  
**URL** : ${targetUrl}  
**Mode** : Desktop  
**Outil** : Lighthouse ${result.lighthouseVersion || 'latest'}

---

## Scores Globaux

| Catégorie | Score | Statut |
|-----------|-------|--------|
| Performance | ${perfScore}/100 | ${getScoreEmoji(perfScore)} |
| Accessibilité | ${a11yScore}/100 | ${getScoreEmoji(a11yScore)} |
| Bonnes Pratiques | ${bpScore}/100 | ${getScoreEmoji(bpScore)} |
| SEO | ${seoScore}/100 | ${getScoreEmoji(seoScore)} |

---

## Core Web Vitals

| Métrique | Valeur | Seuil recommandé | Statut |
|----------|--------|-------------------|--------|
| First Contentful Paint (FCP) | ${formatMs(fcp)} | < 1800ms | ${fcp && fcp.numericValue < 1800 ? '🟢' : fcp && fcp.numericValue < 3000 ? '🟡' : '🔴'} |
| Largest Contentful Paint (LCP) | ${formatMs(lcp)} | < 2500ms | ${lcp && lcp.numericValue < 2500 ? '🟢' : lcp && lcp.numericValue < 4000 ? '🟡' : '🔴'} |
| Cumulative Layout Shift (CLS) | ${formatCls(cls)} | < 0.1 | ${cls && cls.numericValue < 0.1 ? '🟢' : cls && cls.numericValue < 0.25 ? '🟡' : '🔴'} |
| Total Blocking Time (TBT) | ${formatMs(tbt)} | < 200ms | ${tbt && tbt.numericValue < 200 ? '🟢' : tbt && tbt.numericValue < 600 ? '🟡' : '🔴'} |
| Speed Index | ${formatMs(si)} | < 3400ms | ${si && si.numericValue < 3400 ? '🟢' : si && si.numericValue < 5800 ? '🟡' : '🔴'} |
| Time to Interactive (TTI) | ${formatMs(tti)} | < 3800ms | ${tti && tti.numericValue < 3800 ? '🟢' : tti && tti.numericValue < 7300 ? '🟡' : '🔴'} |

---

## Opportunités d'amélioration

${Object.values(audits)
  .filter(a => a.details && a.details.type === 'opportunity' && a.numericValue > 100)
  .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
  .slice(0, 10)
  .map(a => `- **${a.title}** — Gain potentiel : ${Math.round(a.numericValue)}ms`)
  .join('\n') || '- Aucune opportunité majeure détectée'}

---

## Diagnostics

${Object.values(audits)
  .filter(a => a.details && a.details.type === 'table' && a.score !== null && a.score < 1 && a.scoreDisplayMode === 'informative')
  .slice(0, 8)
  .map(a => `- **${a.title}** : ${a.displayValue || 'Attention requise'}`)
  .join('\n') || '- Aucun diagnostic critique'}

---

## Seuils de régression (CI)

Les seuils suivants sont configurés dans \`lighthouserc.js\` :

| Métrique | Seuil minimum | Action si violation |
|----------|---------------|---------------------|
| Performance | 70 | ⚠️ Warning |
| Accessibilité | 80 | ❌ Error (bloquant) |
| Bonnes Pratiques | 80 | ⚠️ Warning |
| SEO | 80 | ⚠️ Warning |
| FCP | < 2500ms | ⚠️ Warning |
| LCP | < 4000ms | ⚠️ Warning |
| CLS | < 0.1 | ❌ Error (bloquant) |
| TBT | < 300ms | ⚠️ Warning |

---

*Rapport généré automatiquement par \`scripts/lighthouse-report.mjs\`*
`;

writeFileSync(outputPath, report);
console.log(`\n✅ Rapport sauvegardé : ${outputPath}`);
console.log(`\n📊 Résumé rapide :`);
console.log(`   Performance: ${perfScore}/100 ${getScoreEmoji(perfScore)}`);
console.log(`   Accessibilité: ${a11yScore}/100 ${getScoreEmoji(a11yScore)}`);
console.log(`   Bonnes Pratiques: ${bpScore}/100 ${getScoreEmoji(bpScore)}`);
console.log(`   SEO: ${seoScore}/100 ${getScoreEmoji(seoScore)}`);
`;

