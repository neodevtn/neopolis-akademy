import fs from "node:fs";
import path from "node:path";
import { getAgenticDiscoveryDocuments, getAgenticDiscoverySummary } from "../shared/agenticDiscovery";

const root = path.resolve(import.meta.dirname, "..");
const publicDirectory = path.join(root, "client", "public");

function writeIfChanged(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (previous === content) return false;
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

const results = getAgenticDiscoveryDocuments().map((document) => ({
  path: document.path,
  changed: writeIfChanged(path.join(publicDirectory, document.path.replace(/^\//, "")), document.body),
  bytes: Buffer.byteLength(document.body, "utf8"),
}));

console.log(JSON.stringify({
  generated: results.length,
  changed: results.filter((result) => result.changed).length,
  summary: getAgenticDiscoverySummary(),
  files: results,
}, null, 2));
