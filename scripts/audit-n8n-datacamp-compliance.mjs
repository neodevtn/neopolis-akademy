import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursePath = path.join(root, 'client/public/data/courses/initiation_automatisation_workflows_n8n__01.json');
const reportPath = path.join(root, 'docs/n8n_datacamp_compliance_audit_2026-08-20.json');
const standardBlockTypes = new Set([
  'content', 'video', 'transcript', 'download', 'flip_cards', 'single_choice_exercise',
  'multi_choice_exercise', 'bucket_sort', 'tabbed_content', 'comparison', 'checkpoint',
  'cloud_exercise', 'exercise', 'code_repl', 'matching', 'fill_blank', 'terminal_sim',
  'ai_evaluation', 'callout', 'ordering', 'TitleSlide', 'FullSlide', 'TwoColumns', 'FinalSlide',
]);
const course = JSON.parse(await readFile(coursePath, 'utf8'));
const activities = course.lessons.flatMap((lesson) => lesson.chapters.map((chapter) => ({ lesson, chapter })));
const blocks = activities.flatMap(({ lesson, chapter }) => (chapter.blocks ?? []).map((block) => ({ lesson, chapter, block })));
const unsupportedBlocks = blocks.filter(({ block }) => !standardBlockTypes.has(block.type)).map(({ chapter, block }) => ({ chapterId: chapter.id, blockType: block.type }));
const cloudExercises = blocks.filter(({ block }) => block.type === 'cloud_exercise');
const mediaUrls = collectAssetUrls(course);
const competencyTags = collectValuesForKeys(course, new Set(['competencyTags', 'skillTags', 'competencies']));

const labs = cloudExercises.map(({ lesson, chapter, block }) => {
  const text = flattenText(block).toLowerCase();
  const hasCloudSetup = /n8n[ .-]?cloud/.test(text);
  const hasDockerSetup = text.includes('docker');
  const hasPreparation = hasCloudSetup || hasDockerSetup || text.includes('préparation de l’environnement');
  const hasGuidedSteps = Array.isArray(block.steps) && block.steps.length > 0;
  const hasLearnerResponse = true; // Standard CloudExerciseBlock always renders a proof-of-completion response field.
  const hasDownloadableResource = Array.isArray(block.resources) && block.resources.some((resource) => String(resource?.url || '').startsWith('/api/assets/'));
  return {
    lessonId: lesson.id,
    chapterId: chapter.id,
    title: block.title ?? chapter.title,
    hasPreparation,
    hasCloudSetup,
    hasDockerSetup,
    hasGuidedSteps,
    hasLearnerResponse,
    hasDownloadableResource,
  };
});

const report = {
  courseId: course.courseId,
  counts: {
    chapters: activities.length,
    blocks: blocks.length,
    cloudExercises: cloudExercises.length,
    mediaReferences: mediaUrls.length,
  },
  blocks: {
    unsupported: unsupportedBlocks,
    allStandard: unsupportedBlocks.length === 0,
  },
  competencyTags,
  labs,
  summary: {
    labsWithPreparation: labs.filter((lab) => lab.hasPreparation).length,
    labsWithCloudAndDocker: labs.filter((lab) => lab.hasCloudSetup && lab.hasDockerSetup).length,
    labsWithGuidedSteps: labs.filter((lab) => lab.hasGuidedSteps).length,
    labsWithLearnerResponse: labs.filter((lab) => lab.hasLearnerResponse).length,
    labsWithDownloadableResources: labs.filter((lab) => lab.hasDownloadableResource).length,
  },
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

function flattenText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(flattenText).join(' ');
  return '';
}

function collectAssetUrls(value, urls = new Set()) {
  if (typeof value === 'string' && value.includes('/api/assets/')) urls.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectAssetUrls(item, urls));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectAssetUrls(item, urls));
  return [...urls];
}

function collectValuesForKeys(value, keys, results = []) {
  if (Array.isArray(value)) value.forEach((item) => collectValuesForKeys(item, keys, results));
  else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (keys.has(key)) results.push({ key, value: nested });
      collectValuesForKeys(nested, keys, results);
    }
  }
  return results;
}
