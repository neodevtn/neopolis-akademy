import fs from "node:fs/promises";
import transitModule from "transit-js";

const transit = transitModule?.default || transitModule;

function decodeEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toPlain(value) {
  if (transit.isMap?.(value)) {
    const normalized = {};
    value.forEach((item, key) => {
      normalized[String(key)] = toPlain(item);
    });
    return normalized;
  }
  if (value instanceof Map) {
    return Object.fromEntries([...value.entries()].map(([key, item]) => [String(key), toPlain(item)]));
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toPlain(item)]));
  }
  return value;
}

export function decodePreloadedState(source) {
  const raw = String(source);
  const prefix = 'window.PRELOADED_STATE = "';
  const start = raw.indexOf(prefix);
  const end = raw.lastIndexOf('";');
  if (start < 0 || end <= start + prefix.length) throw new Error("window.PRELOADED_STATE introuvable dans le fichier préchargé.");
  const serialized = decodeEntities(raw.slice(start + prefix.length, end));
  if (serialized.includes("[Truncated]")) {
    throw new Error("État préchargé DataCamp tronqué : les données de correction ne peuvent pas être reconstruites fidèlement.");
  }
  return toPlain(transit.reader("json").read(serialized));
}

function valueFor(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

const inputPath = valueFor("--input");
const outputPath = valueFor("--output");
if (inputPath || outputPath) {
  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/datacamp-preloaded-decoder.mjs --input <preloaded.js> --output <decoded.json>");
    process.exit(1);
  }
  const decoded = decodePreloadedState(await fs.readFile(inputPath, "utf8"));
  await fs.writeFile(outputPath, `${JSON.stringify(decoded, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ input: inputPath, output: outputPath, topLevelKeys: Object.keys(decoded) }, null, 2));
}
