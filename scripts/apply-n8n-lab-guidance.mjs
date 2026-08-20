import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursePath = path.join(root, 'client/public/data/courses/initiation_automatisation_workflows_n8n__01.json');
const course = JSON.parse(await readFile(coursePath, 'utf8'));
const chapterResources = {
  lesson_ch01: '/api/assets/chapter_01_slides_15e52a7d.pdf',
  lesson_ch02: '/api/assets/chapter_02_slides_61e9272e.pdf',
  lesson_ch03: '/api/assets/chapter_03_slides_f51ea469.pdf',
};
const environmentGuide = {
  fr: 'Avant de commencer, choisissez l’une des deux options : **n8n Cloud** avec un workspace personnel, ou **n8n local avec Docker**. Créez un workflow vide, préparez les identifiants nécessaires si le TP utilise un service externe, puis suivez les étapes. Les fichiers de VM DataCamp non téléchargeables sont signalés ci-dessous : reconstruisez-les à partir des consignes, des indices et de la correction.',
  en: 'Before you start, choose one of two options: **n8n Cloud** with a personal workspace, or **local n8n with Docker**. Create an empty workflow, prepare any credentials required by external services, then follow the steps. Unavailable DataCamp VM files are listed below: rebuild them from the instructions, hints, and solution.',
};

let updated = 0;
for (const lesson of course.lessons ?? []) {
  const resourceUrl = chapterResources[lesson.id];
  for (const chapter of lesson.chapters ?? []) {
    for (const block of chapter.blocks ?? []) {
      if (block.type !== 'cloud_exercise') continue;
      block.environmentGuide = environmentGuide;
      block.resources = resourceUrl ? [{
        title: { fr: 'Supports du chapitre (PDF)', en: 'Chapter slides (PDF)' },
        description: { fr: 'Téléchargez les diapositives locales pour refaire le TP dans votre environnement n8n.', en: 'Download the local slides to reproduce this exercise in your n8n environment.' },
        url: resourceUrl,
      }] : [];
      const referenced = Array.isArray(block.referencedFiles) ? block.referencedFiles : [];
      block.nonDownloadableFiles = [...new Set(referenced.filter((file) => !file?.local_path && file?.filename).map((file) => file.filename))];
      updated += 1;
    }
  }
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(`Applied autonomous environment guidance and local PDF resources to ${updated} n8n lab(s).`);
