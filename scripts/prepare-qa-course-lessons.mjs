const baseUrl = (process.env.QA_COURSE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const certificationId = process.env.QA_COURSE_CERTIFICATION_ID;
const courseId = process.env.QA_COURSE_ID;
const targetLessonIndex = Number.parseInt(process.env.QA_COURSE_TARGET_LESSON_INDEX || "0", 10);
const email = process.env.QA_EMAIL;
const password = process.env.QA_PASSWORD;

if (!certificationId || !courseId || !email || !password || !Number.isInteger(targetLessonIndex) || targetLessonIndex < 0) {
  throw new Error("QA_COURSE_CERTIFICATION_ID, QA_COURSE_ID, QA_COURSE_TARGET_LESSON_INDEX, QA_EMAIL et QA_PASSWORD sont requis.");
}

const login = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-neopolis-qa-probe": "1" },
  body: JSON.stringify({ email, password }),
});
if (!login.ok) throw new Error(`Connexion QA refusée (${login.status}).`);
const cookie = login.headers.get("set-cookie")?.match(/app_session_id=([^;]+)/)?.[1];
if (!cookie) throw new Error("Cookie de session QA absent.");

for (let lessonIndex = 0; lessonIndex < targetLessonIndex; lessonIndex += 1) {
  const response = await fetch(`${baseUrl}/api/trpc/training.markLessonComplete?batch=1`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `app_session_id=${cookie}`,
      "x-neopolis-qa-probe": "1",
    },
    body: JSON.stringify({
      "0": { json: { certificationId, courseId, lessonIndex } },
    }),
  });
  if (!response.ok) throw new Error(`Préparation QA impossible pour l’unité ${lessonIndex + 1} (${response.status}).`);
}

console.log(JSON.stringify({ preparedLessons: targetLessonIndex, targetLessonIndex }, null, 2));
