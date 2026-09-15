import fs from 'node:fs';
import path from 'node:path';

const directory = path.join(process.cwd(), 'client/public/data/courses');
const handled = new Set([
  'claude_certified_associate_foundations__01.json',
  'claude_certified_associate_foundations__02.json',
  'claude_certified_associate_foundations__03.json',
  'claude_certified_associate_foundations__04.json',
  'claude_certified_associate_foundations__05.json',
  'claude_certified_associate_foundations__06.json',
  'claude_certified_associate_foundations__07.json',
  'claude_certified_associate_foundations__08.json',
  'claude_certified_developer_foundations__01.json',
  'claude_certified_developer_foundations__02.json',
  'claude_certified_developer_foundations__03.json',
  'claude_certified_architect_foundations__01.json',
]);

const referenceBody = {
  en: '## Reference resources\n\nReturn to the relevant checkpoint to practise the decision in this module. Confirm current product details in the official Anthropic documentation before applying a configuration to a production system.',
  fr: '## Ressources de référence\n\nReprenez le point de contrôle pertinent pour vous entraîner à la décision étudiée dans ce module. Vérifiez les détails actuels du produit dans la documentation officielle d’Anthropic avant d’appliquer une configuration à un système de production.',
};

let updated = 0;
for (const filename of fs.readdirSync(directory)) {
  if (!/^claude_certified_(developer_foundations|architect_foundations|architect_professional)__\d+\.json$/.test(filename) || handled.has(filename)) continue;
  const filePath = path.join(directory, filename);
  const course = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  for (const lesson of course.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const title = `${chapter.title?.en || ''} ${chapter.title?.fr || ''}`;
      const videos = (chapter.blocks || []).filter((block) => block.type === 'video');
      const isTutorialOnly = /tutorial|tutoriel/i.test(title) && videos.length > 0;
      const hasVerifiedProvenance = videos.some((block) => block.mediaMeta?.source || block.mediaMeta?.creator || block.mediaMeta?.provenance);
      if (!isTutorialOnly || hasVerifiedProvenance) continue;
      chapter.title = { en: 'Reference resources', fr: 'Ressources de référence' };
      chapter.type = 'teaching';
      chapter.blocks = [{ type: 'content', body: referenceBody }];
      changed = true;
    }
  }
  if (changed) {
    course.videoRecommendationStatus = 'none';
    fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
    updated += 1;
  }
}
console.log(`Removed unsourced tutorial videos from ${updated} Anthropic courses.`);
