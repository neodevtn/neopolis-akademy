import fs from "fs/promises";
import path from "path";
import type { User } from "../drizzle/schema";
import { credentialCode, certificationTitle, isCourseCompleted } from "../shared/achievementRules";
import { getUserProgress, issueAchievement, markAchievementEmailed } from "./db";
import { generateAchievementPdf } from "./achievementPdf";
import { sendAchievementEmail } from "./email";

function getDataDir() {
  const devPath = path.resolve(import.meta.dirname, "..", "client", "public", "data");
  const prodPath = path.resolve(import.meta.dirname, "..", "dist", "public", "data");
  return process.env.NODE_ENV === "production" ? prodPath : devPath;
}

async function readCourse(courseId: string) {
  const safeId = path.basename(courseId).replace(/[^a-zA-Z0-9_-]/g, "");
  const file = path.join(getDataDir(), "courses", `${safeId}.json`);
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

function titleOf(value: any, fallback: string) {
  return typeof value === "string" ? value : value?.fr || value?.en || fallback;
}

async function notifyNewAchievement(user: User, achievement: any) {
  if (!user.email) return;
  try {
    const pdf = await generateAchievementPdf({ userName: user.name || "Apprenant", achievement });
    const sent = await sendAchievementEmail({
      to: user.email,
      name: user.name || "Apprenant",
      achievement,
      pdf,
    });
    if (sent) await markAchievementEmailed(achievement.id);
  } catch (error) {
    console.error("[Achievement] Email delivery failed after issuing credential:", error);
  }
}

export async function awardCourseCompletionBadge(user: User, certificationId: string, courseId: string) {
  let course: any;
  try {
    course = await readCourse(courseId);
  } catch {
    return null;
  }
  const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;
  const progress = await getUserProgress(user.id, certificationId);
  const completedIndexes = progress.filter((entry) => entry.courseId === courseId).map((entry) => entry.lessonIndex);
  if (!isCourseCompleted(completedIndexes, totalLessons)) return null;

  const title = titleOf(course.sourceCourseTitle || course.title, courseId);
  const issued = await issueAchievement({
    userId: user.id,
    kind: "skill_badge",
    achievementKey: `course-completion:${courseId}`,
    certificationId,
    courseId,
    title: `Compétence acquise : ${title}`,
    description: `Parcours complété : ${totalLessons} leçon${totalLessons > 1 ? "s" : ""} validée${totalLessons > 1 ? "s" : ""}.`,
    icon: "sparkles",
    credentialCode: credentialCode("skill_badge", user.id, `course-${courseId}`),
    evidence: { totalLessons, completedLessons: totalLessons },
  });
  if (issued.created) await notifyNewAchievement(user, issued.achievement);
  return issued.created ? issued.achievement : null;
}

export async function awardCertification(user: User, certificationId: string, score: number, attemptId: number) {
  const title = certificationTitle(certificationId);
  const issued = await issueAchievement({
    userId: user.id,
    kind: "certification",
    achievementKey: `certification:${certificationId}`,
    certificationId,
    title: `Certification obtenue : ${title}`,
    description: `Certification validée avec un score de ${score}/1000.`,
    icon: "graduation-cap",
    credentialCode: credentialCode("certification", user.id, certificationId),
    evidence: { score, attemptId },
  });
  if (issued.created) await notifyNewAchievement(user, issued.achievement);
  return issued.created ? issued.achievement : null;
}
