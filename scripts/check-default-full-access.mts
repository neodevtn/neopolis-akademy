import { userCanAccessCourse } from "../server/db";

const userId = Number(process.env.FULL_ACCESS_QA_USER_ID);
const courseId = process.env.FULL_ACCESS_QA_COURSE_ID || "automatisation_comptable_ia__01";
if (!Number.isInteger(userId) || userId <= 0) throw new Error("FULL_ACCESS_QA_USER_ID est requis.");

const allowed = await userCanAccessCourse(userId, courseId);
if (!allowed) throw new Error(`Accès refusé au cours ${courseId} pour le compte ${userId}.`);
console.log(JSON.stringify({ userId, courseId, allowed }, null, 2));
