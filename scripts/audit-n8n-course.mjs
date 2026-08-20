import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursePath = path.join(root, 'client/public/data/courses/initiation_automatisation_workflows_n8n__01.json');
const reportPath = path.join(root, 'docs/n8n_course_audit_local_2026-08-20.json');
const shouldCheckProduction = process.argv.includes('--production');
const productionBaseUrl = 'https://akademy.neodev.click';

const course = JSON.parse(await readFile(coursePath, 'utf8'));
const activities = course.lessons.flatMap((lesson) => lesson.chapters.map((chapter) => ({
  lessonId: lesson.id,
  lessonTitle: lesson.title?.fr ?? lesson.title,
  chapterId: chapter.id,
  chapterTitle: chapter.title?.fr ?? chapter.title,
  blocks: chapter.blocks ?? [],
})));

const byBlockType = {};
const media = [];
const activityRows = activities.map((activity) => {
  const types = activity.blocks.map((block) => block.type);
  for (const type of types) byBlockType[type] = (byBlockType[type] ?? 0) + 1;
  for (const block of activity.blocks) {
    for (const key of ['mp4Url', 'audioUrl', 'slidesPdf', 'download_url', 'url']) {
      if (typeof block[key] === 'string' && block[key]) media.push({ activityId: activity.chapterId, blockId: block.id ?? null, key, url: block[key] });
    }
    for (const image of block.projectorSlides?.flatMap((slide) => slide.images ?? []) ?? []) {
      if (image.url) media.push({ activityId: activity.chapterId, blockId: block.id ?? null, key: 'projectorImage', url: image.url });
    }
  }
  return {
    id: activity.chapterId,
    title: activity.chapterTitle,
    lessonId: activity.lessonId,
    blockTypes: types,
    isVideo: types.includes('video'),
    isLab: types.includes('cloud_exercise'),
    isBucketSort: types.includes('bucket_sort'),
    isQcm: types.includes('single_choice_exercise') || types.includes('multi_choice_exercise'),
  };
});

const report = {
  courseId: course.courseId,
  sourceCourseTitle: course.sourceCourseTitle,
  lessons: course.lessons.length,
  activities: activityRows.length,
  byBlockType,
  videos: activityRows.filter((row) => row.isVideo).length,
  labs: activityRows.filter((row) => row.isLab).length,
  bucketSorts: activityRows.filter((row) => row.isBucketSort).length,
  qcm: activityRows.filter((row) => row.isQcm).length,
  downloadBlocks: byBlockType.download ?? 0,
  pdfSupports: new Set(media.filter((asset) => asset.key === 'slidesPdf').map((asset) => asset.url)).size,
  mediaReferences: media.length,
  invalidLocalReferences: media.filter((asset) => !asset.url.startsWith('/api/assets/')),
  activities: activityRows,
};

if (shouldCheckProduction) {
  const uniqueMedia = [...new Map(media.map((asset) => [asset.url, asset])).values()];
  const productionResults = await mapWithConcurrency(uniqueMedia, 6, async (asset) => {
    const url = new URL(asset.url, productionBaseUrl).toString();
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) });
      return {
        ...asset,
        status: response.status,
        contentType: response.headers.get('content-type') || '',
        ok: response.status >= 200 && response.status < 400,
      };
    } catch (error) {
      return { ...asset, status: 0, contentType: '', ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  report.productionMedia = {
    checked: productionResults.length,
    passed: productionResults.filter((result) => result.ok).length,
    failed: productionResults.filter((result) => !result.ok),
  };
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }));
  return results;
}
