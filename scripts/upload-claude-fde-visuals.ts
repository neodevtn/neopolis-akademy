import fs from "node:fs";
import path from "node:path";
import { storagePut } from "../server/storage";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = "/home/ubuntu/webdev-static-assets/claude-fde";
const output = path.join(root, ".work", "claude-fde-visual-assets.json");
const inputs = [
  ["claude-forward-deployed-engineer-card.png", "claude-forward-deployed-engineer-card.png", "cardPath"],
  ["claude-forward-deployed-engineer-social.png", "claude-forward-deployed-engineer-social.png", "socialPath"],
] as const;

const result: Record<string, string> = {};
for (const [filename, storageKey, field] of inputs) {
  const source = path.join(sourceRoot, filename);
  if (!fs.existsSync(source)) throw new Error(`Visuel FDE introuvable: ${source}`);
  const uploaded = await storagePut(storageKey, fs.readFileSync(source), "image/png");
  result[field] = uploaded.url;
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
