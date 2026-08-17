import { backfillCompetencies } from "../server/competencyBackfill.ts";

const result = await backfillCompetencies();
console.log(JSON.stringify(result, null, 2));
process.exit(0);
