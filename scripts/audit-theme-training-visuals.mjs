import { getPublicTrainingThemes } from "../shared/publicTrainingThemes.ts";
import { getTrainingVisualAsset } from "../shared/trainingVisualAssets.ts";

const rows = getPublicTrainingThemes("fr").flatMap((theme) => theme.certifications.map((training) => ({
  theme: theme.slug,
  id: training.id,
  title: training.title,
  hasVisual: Boolean(getTrainingVisualAsset(training.id)),
})));

const missing = rows.filter((row) => !row.hasVisual);
console.log(JSON.stringify({ total: rows.length, covered: rows.length - missing.length, missing }, null, 2));

if (missing.length > 0) process.exitCode = 1;
