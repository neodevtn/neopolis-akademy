import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getStandaloneTpCertificationIdForOrder } from "../client/src/lib/iaAppliedMetiersCatalog";
import { getSensitiveExerciseAnswerKey } from "./sensitiveExerciseAnswerKeys";

const root = path.resolve(import.meta.dirname, "..");
const source = JSON.parse(fs.readFileSync(path.resolve(root, "../ia_appliquee_metiers_tp_bundle/catalogue_ia_appliquee_metiers_tp.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));
const publicTitleOverrides = JSON.parse(fs.readFileSync(path.join(root, "shared/trainingDisplayTitleOverrides.json"), "utf8"));
const coursesDirectory = path.join(root, "client/public/data/courses");
const certificationId = "ia_appliquee_metiers_tp";

const expectedSubcategories = [
  [1, 6, "Ventes, CRM & Prospection"],
  [7, 10, "Marketing & Contenu"],
  [11, 16, "Support client & E-commerce"],
  [17, 21, "Finance, Comptabilité & Contrôle de gestion"],
  [22, 26, "RH & Recrutement"],
  [27, 31, "Productivité, secrétariat & opérations"],
  [32, 36, "Data, BI & Recherche"],
  [37, 40, "Juridique, contrats & conformité"],
] as const;

const courseId = (order: number) => `${certificationId}__${String(order).padStart(2, "0")}`;
const text = (value: unknown) => typeof value === "string" ? value : (value as { fr?: string })?.fr || "";
const displayTitle = (id: string, sourceTitle: string) => publicTitleOverrides[id]?.fr || sourceTitle;
const localizedText = (value: unknown, locale: "fr" | "en") => typeof value === "string"
  ? value
  : (value as { fr?: string; en?: string } | undefined)?.[locale] || "";

function expectServerCorrectedLocalizedQuestion(question: any) {
  expect(question.type).toBe("single_choice_exercise");
  expect(question.serverValidated).toBe(true);
  expect(question.options).toHaveLength(4);
  expect(question.options.map((option: any) => option.id)).toContain(question.correctAnswer);
  for (const locale of ["fr", "en"] as const) {
    expect(localizedText(question.question, locale).trim().length).toBeGreaterThan(20);
    expect(localizedText(question.explanation, locale).trim().length).toBeGreaterThan(80);
    const optionTexts = question.options.map((option: any) => localizedText(option.text, locale).trim());
    expect(optionTexts.every(Boolean)).toBe(true);
    expect(new Set(optionTexts).size).toBe(optionTexts.length);
  }
}

describe("rubrique IA appliquée aux métiers - TP", () => {
  const tutorials = source.tutorials as any[];
  const category = catalog.categories.find((entry: any) => entry.id === certificationId);
  const indexedCourses = catalog.courses.filter((entry: any) => entry.certId?.startsWith(`${certificationId}__formation_`));
  const independentCertifications = catalog.certifications.filter((entry: any) => entry.group === certificationId);

  it("préserve les quarante identifiants, titres et positions canoniques", () => {
    expect(tutorials).toHaveLength(40);
    expect(new Set(tutorials.map((tutorial) => tutorial.id)).size).toBe(40);
    expect(tutorials.map((tutorial) => tutorial.order).sort((a, b) => a - b)).toEqual(Array.from({ length: 40 }, (_, index) => index + 1));
    expect(indexedCourses).toHaveLength(40);
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const indexed = indexedCourses.find((entry: any) => entry.id === courseId(tutorial.order));
      expect(text(course.title)).toBe(displayTitle(courseId(tutorial.order), tutorial.title));
      expect(course.metadata.canonicalTutorialId).toBe(tutorial.id);
      expect(course.metadata.canonicalOrder).toBe(tutorial.order);
      expect(text(indexed.title)).toBe(displayTitle(courseId(tutorial.order), tutorial.title));
      expect(indexed.targetJob).toBe(tutorial.targetJob);
      expect(indexed.tools).toEqual(tutorial.tools);
      expect(indexed.acquiredSkills).toEqual(tutorial.acquiredSkills);
    });
  });

  it("crée la rubrique, les huit sous-catégories et quarante formations métier autonomes", () => {
    expect(category?.title?.fr).toBe("IA appliquée aux métiers - TP");
    expect(category?.subcategories).toHaveLength(8);
    expect(catalog.certifications.find((entry: any) => entry.id === certificationId)).toBeUndefined();
    expect(independentCertifications).toHaveLength(40);
    expectedSubcategories.forEach(([from, to, title]) => {
      const matching = tutorials.filter((tutorial) => tutorial.order >= from && tutorial.order <= to);
      expect(matching).toHaveLength(to - from + 1);
      expect(matching.every((tutorial) => tutorial.category === title)).toBe(true);
      expect(indexedCourses.filter((course: any) => course.subCategory?.fr === title)).toHaveLength(to - from + 1);
      matching.forEach((tutorial) => {
        const certification = independentCertifications.find((entry: any) => entry.id === getStandaloneTpCertificationIdForOrder(tutorial.order));
        expect(certification?.title?.fr).toBe(displayTitle(getStandaloneTpCertificationIdForOrder(tutorial.order), tutorial.title));
        expect(certification?.courses).toEqual([courseId(tutorial.order)]);
        expect(certification?.subCategory?.fr).toBe(title);
        expect(certification?.isStandaloneTP).toBe(true);
        expect(indexedCourses.find((entry: any) => entry.id === courseId(tutorial.order))?.certId).toBe(certification?.id);
      });
    });
  });

  it("distingue un parcours conceptuel autonome d’un TP qui exige réellement un environnement", () => {
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const lesson = course.lessons[0];
      const chapters = lesson.chapters;
      const blocks = chapters.flatMap((chapter: any) => chapter.blocks);
      expect(lesson.competencyTags.length).toBeGreaterThan(0);
      expect(chapters.length).toBeGreaterThanOrEqual(4);
      expect(chapters.length).toBeLessThanOrEqual(6);
      expect(chapters.every((chapter: any) => chapter.blocks?.length > 0)).toBe(true);
      expect(course.sourceReference.sourceUrl).toBe(tutorial.sourceUrl);
      expect(course.sourceReference.sourceUrl.startsWith("https://")).toBe(true);
      const sourceReviews = blocks.filter((block: any) => block.type === "resource_review");
      expect(sourceReviews.every((block: any) => typeof block.resourceUrl === "string" && block.resourceUrl.startsWith("https://"))).toBe(true);
      expect(sourceReviews.every((block: any) => block.resourceUrl === tutorial.sourceUrl)).toBe(true);
      const remainingPracticals = blocks.filter((block: any) => practicalTypes.has(block.type));
      if (remainingPracticals.length === 0) {
        // An autonomous conceptual route must be substantive; it is not a blank TP instruction.
        expect(blocks.some((block: any) => ["learning_section", "content", "sequence_visual", "comparison_panel"].includes(block.type))).toBe(true);
      } else {
        // A real TP, conversely, must expose a usable environment and every required asset.
        remainingPracticals.forEach((block: any) => {
          expect(localizedText(block.environmentGuide, "fr").trim().length).toBeGreaterThan(40);
          expect(localizedText(block.instructions, "fr").trim().length).toBeGreaterThan(20);
          expect(Array.isArray(block.resources) && block.resources.length > 0).toBe(true);
          expect(block.resources.every((resource: any) => typeof resource.url === "string" && resource.url.trim().length > 0)).toBe(true);
          expect(typeof (block.solution || block.correction) === "string" && (block.solution || block.correction).trim().length > 80).toBe(true);
        });
      }
    });
  });

  it("propose des quiz finaux de quatre questions et autorise un gate QCM sans bucket sort", () => {
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const finalQuiz = course.lessons[0].chapters.at(-1);
      const questions = finalQuiz.blocks.filter((block: any) => block.type === "single_choice_exercise");
      expect(finalQuiz.type).toBe("quiz");
      expect(questions).toHaveLength(4);
      expect(finalQuiz.passThreshold).toBe(4);
      questions.forEach((question: any) => {
        const optionIds = question.options.map((option: any) => option.id);
        const optionTexts = question.options.map((option: any) => text(option.text).toLocaleLowerCase());
        expect(optionIds).toContain(question.correctAnswer);
        expect(new Set(optionTexts).size).toBe(optionTexts.length);
        expect(text(question.explanation).length).toBeGreaterThan(20);
      });
      const ordering = finalQuiz.blocks.find((block: any) => block.type === "bucket_sort");
      if (ordering) {
        expect(ordering.buckets.length).toBeGreaterThanOrEqual(2);
        expect(ordering.cards.length).toBeGreaterThanOrEqual(ordering.buckets.length);
        expect(ordering.cards.every((card: any) => ordering.buckets.some((bucket: any) => bucket.id === card.correctBucket))).toBe(true);
      }
    });

    const bucketlessGatedFinals = tutorials.filter((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const finalQuiz = course.lessons[0].chapters.at(-1);
      return finalQuiz.requiredBeforeAdvance === true && !finalQuiz.blocks.some((block: any) => block.type === "bucket_sort");
    });
    expect(bucketlessGatedFinals.map((tutorial) => tutorial.order)).toEqual([35]);
  });

  it("remplace le TP 12 non corrigeable et protège les corrections locales des QCM 32 et 35", () => {
    const load = (order: number) => JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(order)}.json`), "utf8"));
    const allBlocks = (course: any) => course.lessons[0].chapters.flatMap((chapter: any) => chapter.blocks);

    const course12 = load(12);
    const blocks12 = allBlocks(course12);
    expect(blocks12.some((block: any) => block.id === "ia_appliquee_metiers_tp__12-mini-project-proof")).toBe(false);
    expect(blocks12.some((block: any) => block.id === "ia_appliquee_metiers_tp__12-source-review")).toBe(false);
    expect(blocks12.find((block: any) => block.id === "ia_appliquee_metiers_tp__12-case-study")?.type).toBe("content");
    const caseStudyQuestion = blocks12.find((block: any) => block.id === "ia_appliquee_metiers_tp__12-case-study-quiz");
    expectServerCorrectedLocalizedQuestion(caseStudyQuestion);

    const course32 = load(32);
    const final32 = course32.lessons[0].chapters.at(-1);
    const questions32 = final32.blocks.filter((block: any) => block.type === "single_choice_exercise");
    expect(questions32.map((block: any) => block.id)).toEqual([
      "ia_appliquee_metiers_tp__32-quiz-01", "ia_appliquee_metiers_tp__32-quiz-02",
      "ia_appliquee_metiers_tp__32-quiz-03", "ia_appliquee_metiers_tp__32-quiz-04",
    ]);
    questions32.forEach(expectServerCorrectedLocalizedQuestion);

    const course35 = load(35);
    const final35 = course35.lessons[0].chapters.at(-1);
    expect(final35.requiredBeforeAdvance).toBe(true);
    expect(final35.passThreshold).toBe(4);
    expect(final35.blocks.some((block: any) => block.type === "bucket_sort")).toBe(false);
    const questions35 = final35.blocks.filter((block: any) => block.type === "single_choice_exercise");
    expect(questions35.map((block: any) => block.id)).toEqual([
      "ia_appliquee_metiers_tp__35-quiz-01", "ia_appliquee_metiers_tp__35-quiz-02",
      "ia_appliquee_metiers_tp__35-quiz-03", "ia_appliquee_metiers_tp__35-quiz-04",
    ]);
    questions35.forEach(expectServerCorrectedLocalizedQuestion);

    [course12, course32, course35].forEach((course: any) => {
      allBlocks(course).filter((block: any) => block.serverValidated === true).forEach((block: any) => {
        expect(getSensitiveExerciseAnswerKey(course.courseId, block.id)).toEqual({
          correctAnswer: block.correctAnswer,
          explanation: block.explanation,
        });
      });
    });
  });
});
