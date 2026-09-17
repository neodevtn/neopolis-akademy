import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const libraryPath = path.join(root, "client", "public", "data", "mediaLibrary.json");
const library = JSON.parse(fs.readFileSync(libraryPath, "utf8"));
const privateAsset = /\/api\/assets\/claude-science-v2\/03_claude_science_travaux_pratiques\/(?:solutions\/|downloads\/expected\/|downloads\/scripts\/solution_)/;
const removed = Object.keys(library).filter((url) => privateAsset.test(url));
for (const url of removed) delete library[url];
fs.writeFileSync(libraryPath, `${JSON.stringify(library, null, 2)}\n`);
console.log(JSON.stringify({ removed, remaining: Object.keys(library).length }, null, 2));
