import { backfillHistoricalAchievements } from "../server/achievementBackfill.ts";

const summary = await backfillHistoricalAchievements();
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
