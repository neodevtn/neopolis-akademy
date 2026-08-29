import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const catalogPath = path.resolve(root, "../ia_appliquee_metiers_tp_bundle/catalogue_ia_appliquee_metiers_tp.json");
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? Number(args[index + 1]) : fallback;
};
const from = value("--from", 1);
const to = value("--to", 5);

if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 40 || from > to || to - from >= 5) {
  throw new Error("Vérifiez au plus cinq URL à la fois, par exemple --from 1 --to 5.");
}

const tutorials = JSON.parse(fs.readFileSync(catalogPath, "utf8")).tutorials
  .filter((tutorial) => tutorial.order >= from && tutorial.order <= to)
  .sort((a, b) => a.order - b.order);

const results = [];
for (const tutorial of tutorials) {
  let response;
  try {
    response = await fetch(tutorial.sourceUrl, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(tutorial.sourceUrl, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000), headers: { Range: "bytes=0-0" } });
    }
    results.push({ order: tutorial.order, url: tutorial.sourceUrl, status: response.status, reachable: response.ok || response.status === 403, finalUrl: response.url });
  } catch (error) {
    results.push({ order: tutorial.order, url: tutorial.sourceUrl, status: "network_error", reachable: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

console.table(results.map(({ order, status, reachable }) => ({ tp: order, status, reachable })));
const failures = results.filter((result) => !result.reachable);
const reportPath = path.join(root, "tmp", `ia-appliquee-metiers-source-urls-${from}-${to}.json`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
console.log(`Rapport écrit : ${path.relative(root, reportPath)}`);
if (failures.length) process.exitCode = 1;
