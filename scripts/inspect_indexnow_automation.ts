import { getIndexNowAutomationStatus } from "../server/indexNowAutomation";

const submissions = await getIndexNowAutomationStatus();
console.log(JSON.stringify({
  ok: true,
  submissions,
}, null, 2));
process.exit(0);
