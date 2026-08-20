import fs from 'node:fs';

const [sourcePath, outputPath] = process.argv.slice(2);

if (!sourcePath || !outputPath) {
  throw new Error('Usage: node scripts/extract_pagespeed_html_report.mjs <report.html> <summary.json>');
}

const source = fs.readFileSync(sourcePath, 'utf8');

function findBalancedObject(text, key) {
  const keyIndex = text.lastIndexOf(`"${key}":`);
  if (keyIndex < 0) return null;

  const start = text.indexOf('{', keyIndex + key.length + 3);
  if (start < 0) return null;

  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (let cursor = start; cursor < text.length; cursor += 1) {
    const char = text[cursor];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, cursor + 1);
    }
  }
  return null;
}

const lighthouseRaw = findBalancedObject(source, 'lighthouseResult');

function decodeHtml(value) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function extractRenderedAudits(html) {
  const groups = html.split('<div class="lh-audit ').slice(1);
  return groups.slice(0, 80).flatMap((group) => {
    const id = group.match(/id="([^"]+)"/)?.[1];
    const title = group.match(/lh-audit__title"><span>([\s\S]*?)<\/span>/)?.[1];
    const displayValue = group.match(/lh-audit__display-text">([\s\S]*?)<\/span>/)?.[1];
    if (!id || !title) return [];
    const urls = [...group.matchAll(/data-url="([^"]+)"/g)].slice(0, 8).map((match) => match[1]);
    return [{
      id,
      title: decodeHtml(title),
      displayValue: displayValue ? decodeHtml(displayValue) : null,
      urls,
    }];
  });
}

if (!lighthouseRaw) {
  const renderedAudits = extractRenderedAudits(source);
  const importantAuditIds = new Set([
    'render-blocking-resources',
    'render-blocking-insight',
    'unused-javascript',
    'bootup-time',
    'long-tasks',
    'image-delivery-insight',
    'image-size-responsive',
    'unsized-images',
    'uses-long-cache-ttl',
    'cache-insight',
    'lcp-lazy-loaded',
    'lcp-discovery-insight',
    'legacy-javascript-insight',
    'third-parties-insight',
  ]);
  const summary = {
    generatedFrom: sourcePath,
    extractionMode: 'rendered-lighthouse-html',
    importantAudits: renderedAudits.filter((audit) => importantAuditIds.has(audit.id)),
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const lighthouse = JSON.parse(lighthouseRaw);
const auditIds = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift',
  'interactive',
  'server-response-time',
  'render-blocking-resources',
  'render-blocking-insight',
  'unused-javascript',
  'bootup-time',
  'mainthread-work-breakdown',
  'long-tasks',
  'image-delivery-insight',
  'image-size-responsive',
  'uses-optimized-images',
  'uses-text-compression',
  'uses-long-cache-ttl',
  'cache-insight',
  'lcp-lazy-loaded',
  'lcp-discovery-insight',
  'legacy-javascript-insight',
  'third-parties-insight',
];

const summary = {
  generatedFrom: sourcePath,
  requestedUrl: lighthouse.requestedUrl,
  finalUrl: lighthouse.finalUrl,
  fetchTime: lighthouse.fetchTime,
  userAgent: lighthouse.userAgent,
  categories: Object.fromEntries(
    Object.entries(lighthouse.categories ?? {}).map(([id, category]) => [id, {
      score: category.score,
      title: category.title,
    }]),
  ),
  metrics: Object.fromEntries(
    auditIds
      .filter((id) => lighthouse.audits?.[id])
      .map((id) => {
        const audit = lighthouse.audits[id];
        return [id, {
          score: audit.score,
          displayValue: audit.displayValue,
          numericValue: audit.numericValue,
          title: audit.title,
          description: audit.description,
          details: audit.details?.items?.slice(0, 12) ?? [],
        }];
      }),
  ),
};

fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, categories: summary.categories }, null, 2));
