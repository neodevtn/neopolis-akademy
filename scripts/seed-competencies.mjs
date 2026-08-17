import { ensureCompetencyFramework, getCompetencyFramework } from "../server/competencyService.ts";

await ensureCompetencyFramework();
const framework = await getCompetencyFramework();
console.log(JSON.stringify({ competencies: framework.definitions.length, rules: framework.rules.length }, null, 2));
process.exit(0);
