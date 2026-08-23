import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("discoverability des fonctionnalités", () => {
  it("expose les feedbacks de formation dans la navigation administrateur et accepte le lien profond", () => {
    const navbar = projectFile("client/src/components/AdminNavbar.tsx");
    const adminTraining = projectFile("client/src/pages/AdminTraining.tsx");

    expect(navbar).toContain('label: "Feedback formations"');
    expect(navbar).toContain('href: "/admin/training?tab=feedback"');
    expect(adminTraining).toContain('"analytics", "feedback"');
  });

  it("expose un accès apprenant au feedback depuis l’en-tête du cours", () => {
    const trainingCourse = projectFile("client/src/pages/TrainingCourse.tsx");

    expect(trainingCourse).toContain("Votre avis et vos suggestions");
    expect(trainingCourse).toContain("setFeedbackOpen(true)");
    expect(trainingCourse).toContain("<CourseFeedbackPanel certificationId={certId} courseId={courseId} />");
  });
});
