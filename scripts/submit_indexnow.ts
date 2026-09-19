import {
  AGENTIC_DISCOVERY_ORIGIN,
  AGENTIC_DISCOVERY_UPDATED_AT,
  getAgenticPublicUrls,
  getIndexNowPayload,
} from "../shared/agenticDiscovery";

const submit = process.argv.includes("--submit");
const endpoint = "https://api.indexnow.org/indexnow";
const allUrls = getAgenticPublicUrls();
const chunks: string[][] = [];
for (let index = 0; index < allUrls.length; index += 10_000) chunks.push(allUrls.slice(index, index + 10_000));

const summary = {
  mode: submit ? "submit" : "dry-run",
  endpoint,
  canonicalOrigin: AGENTIC_DISCOVERY_ORIGIN,
  catalogueDate: AGENTIC_DISCOVERY_UPDATED_AT,
  urls: allUrls.length,
  batches: chunks.length,
};
console.log(JSON.stringify(summary, null, 2));

if (!submit) {
  console.log("Dry run only. Add --submit after the release is publicly available.");
  process.exit(0);
}

for (const [index, urlList] of chunks.entries()) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(getIndexNowPayload(urlList)),
    signal: AbortSignal.timeout(30_000),
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow batch ${index + 1}/${chunks.length}: HTTP ${response.status} ${await response.text()}`);
  }
  console.log(`IndexNow batch ${index + 1}/${chunks.length}: HTTP ${response.status}`);
}
