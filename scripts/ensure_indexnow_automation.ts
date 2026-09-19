import { ensureIndexNowRetryHeartbeat } from "../server/scheduledIndexNow";

const result = await ensureIndexNowRetryHeartbeat();
console.log(JSON.stringify({
  ok: true,
  retryHeartbeat: {
    created: result.created,
    taskUid: result.taskUid,
    cadence: "every 15 minutes",
  },
}, null, 2));
process.exit(0);
