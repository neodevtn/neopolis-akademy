const endpoint = process.argv[2];

if (!endpoint) {
  throw new Error("Usage: node scripts/verify-developer3-cumulative-public.mjs <endpoint>");
}

const response = await fetch(endpoint, {
  headers: { "Cache-Control": "no-cache" },
});

if (!response.ok) {
  throw new Error(`La route publique a retourné HTTP ${response.status}`);
}

const payload = await response.json();
const raw = JSON.stringify(payload);
const expectedMarkers = [
  '"id":"S18_context"',
  '"id":"S19_context"',
  '"type":"cloud_exercise"',
  "Tâche d’intégration cumulative",
  "Assemblage correct",
];
const missingMarkers = expectedMarkers.filter((marker) => !raw.includes(marker));

if (missingMarkers.length > 0) {
  throw new Error(`Marqueurs cumulatifs absents : ${missingMarkers.join(", ")}`);
}

console.log("tRPC public OK : les tâches cumulatives S18/S19 et leur auto-évaluation sont présentes.");
