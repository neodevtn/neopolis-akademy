import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "docs/training-visual-manifest.json");
const uploadLogPath = "/tmp/neopolis-rendered-training-visuals-upload.txt";
const outputPath = path.join(root, "shared/trainingVisualAssets.generated.ts");
const assetPrefix = "/home/ubuntu/webdev-static-assets/training-cards/rendered/";

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const log = fs.readFileSync(uploadLogPath, "utf8");
const uploaded = new Map();

for (const line of log.split("\n")) {
  const match = line.match(/^\[SUCCESS\] (.+) -> (\/manus-storage\/.+)$/);
  if (match) uploaded.set(match[1], match[2]);
}

const entries = manifest.trainings.map((training) => {
  const socialSource = `${assetPrefix}${training.id}-social.png`;
  const cardSource = `${assetPrefix}${training.id}-card.png`;
  const socialPath = uploaded.get(socialSource);
  const cardStoragePath = uploaded.get(cardSource);
  if (!socialPath || !cardStoragePath) {
    throw new Error(`Visual assets missing for ${training.id}`);
  }
  const title = JSON.stringify(training.title);
  return `  ${JSON.stringify(training.id)}: {
    socialPath: ${JSON.stringify(socialPath)},
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: ${JSON.stringify(cardStoragePath.replace("/manus-storage/", "/api/assets/"))},
    cardWidth: 1200,
    cardHeight: 900,
    alt: { fr: ${title}, en: ${title}, ar: ${title} },
  },`;
});

const source = `import type { TrainingVisualAsset } from "./trainingVisualAssets";\n\n/** Assets générés à partir du template de marque pour chaque formation. */\nexport const GENERATED_TRAINING_VISUAL_ASSETS: Record<string, TrainingVisualAsset> = {\n${entries.join("\n")}\n};\n`;
fs.writeFileSync(outputPath, source);
console.log(`generated_visual_registry=${entries.length}`);
