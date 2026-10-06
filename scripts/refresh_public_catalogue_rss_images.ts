import { writeFile } from "node:fs/promises";
import { getPublicCatalogueTrainings } from "../shared/publicTrainingCatalog";

/** Crée un instantané des tailles réelles, jamais estimées, des cartes PNG canoniques. */
async function main() {
  const paths = Array.from(new Set(getPublicCatalogueTrainings("fr").map((training) => training.visual.cardPath)));
  const result: Record<string, number> = {};
  let next = 0;
  const failures: string[] = [];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < paths.length) {
      const path = paths[next++]!;
      try {
        if (!/^\/api\/assets\/[A-Za-z0-9_.-]+\.png$/.test(path)) throw new Error("chemin d'image non conforme");
        const response = await fetch(`https://akademy.neodev.click${path}`, { method: "HEAD", signal: AbortSignal.timeout(20_000) });
        const bytes = Number(response.headers.get("content-length"));
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png") || !Number.isSafeInteger(bytes) || bytes < 1_000) {
          throw new Error(`HTTP ${response.status}, type ${response.headers.get("content-type")}, octets ${bytes}`);
        }
        result[path] = bytes;
      } catch (error) {
        failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }));
  if (failures.length) throw new Error(`Images RSS non servies : ${failures.join("; ")}`);
  const output = new URL("../shared/publicCatalogueRssImageBytes.generated.json", import.meta.url);
  await writeFile(output, JSON.stringify(Object.fromEntries(Object.entries(result).sort()), null, 2) + "\n");
  console.log(`Images vérifiées : ${paths.length}; tailles réelles enregistrées : ${Object.keys(result).length}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
