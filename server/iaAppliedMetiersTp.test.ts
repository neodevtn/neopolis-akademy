import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getStandaloneTpCertificationIdForOrder } from "../client/src/lib/iaAppliedMetiersCatalog";

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

  it("conserve les parcours publiés, leurs sources et aucune activité pratique dépendant d’un actif absent", () => {
    const practicalTypes = new Set(["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"]);
    const completableTypes = new Set([
      "resource_review", "single_choice_exercise", "multi_choice_exercise", "bucket_sort",
      "matching", "ordering", "knowledge_check", "content", "learning_section", "sequence_visual", "comparison_panel", "callout",
    ]);
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
      expect(remainingPracticals.every((block: any) =>
        Array.isArray(block.resources) && block.resources.length > 0 &&
        block.resources.every((resource: any) => typeof resource.url === "string" && resource.url.trim().length > 0) &&
        typeof (block.solution || block.correction) === "string" && (block.solution || block.correction).trim().length > 80 &&
        typeof block.instructions === "string" && block.instructions.trim().length > 0,
      )).toBe(true);
      expect(chapters.filter((chapter: any) => chapter.requiredBeforeAdvance).every((chapter: any) =>
        chapter.blocks.some((block: any) => completableTypes.has(block.type)),
      )).toBe(true);
    });
  });

  it("propose des quiz finaux rendables avec correction, sans recréer les activités retirées", () => {
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const finalQuiz = course.lessons[0].chapters.at(-1);
      const questions = finalQuiz.blocks.filter((block: any) => block.type === "single_choice_exercise");
      expect(finalQuiz.type).toBe("quiz");
      expect(questions).toHaveLength(4);
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
      } else {
        expect(finalQuiz.requiredBeforeAdvance).toBe(false);
      }
    });
  });

  it("n’introduit ni XP externe, ni DataCamp, ni laboratoire inaccessible", () => {
    indexedCourses.forEach((entry: any) => {
      const raw = fs.readFileSync(path.join(coursesDirectory, `${entry.id}.json`), "utf8");
      expect(raw).not.toMatch(/\b(?:XP|DataCamp|DataLab)\b/i);
      expect(raw).toMatch(/sandbox personnelle|environnement local|démonstration/i);
      expect(raw).toMatch(/validation humaine/i);
    });
  });
});
