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

  it("fournit à chaque TP le parcours pratique standard, la ressource source et le support fictif", () => {
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const lesson = course.lessons[0];
      const chapters = lesson.chapters;
      const blocks = chapters.flatMap((chapter: any) => chapter.blocks);
      expect(lesson.competencyTags.length).toBeGreaterThan(0);
      expect(chapters).toHaveLength(6);
      expect(course.sourceReference.sourceUrl).toBe(tutorial.sourceUrl);
      expect(course.sourceReference.sourceUrl.startsWith("https://")).toBe(true);
      expect(blocks.some((block: any) => block.type === "resource_review" && block.resourceUrl === tutorial.sourceUrl)).toBe(true);
      const practical = blocks.find((block: any) => block.type === "cloud_exercise");
      expect(practical.assignment).toBe(tutorial.miniProject);
      expect(practical.resources[0].url.startsWith("/manus-storage/")).toBe(true);
      expect(blocks.some((block: any) => block.type === "knowledge_check" && block.required === true)).toBe(true);
    });
  });

  it("propose au moins cinq questions finales utilisables, avec correction post-tentative et ordre à reconstituer", () => {
    tutorials.forEach((tutorial) => {
      const course = JSON.parse(fs.readFileSync(path.join(coursesDirectory, `${courseId(tutorial.order)}.json`), "utf8"));
      const finalQuiz = course.lessons[0].chapters.at(-1);
      const questions = finalQuiz.blocks.filter((block: any) => block.type === "single_choice_exercise");
      expect(finalQuiz.type).toBe("quiz");
      expect(finalQuiz.blocks.length).toBeGreaterThanOrEqual(5);
      expect(questions).toHaveLength(4);
      questions.forEach((question: any) => {
        const optionIds = question.options.map((option: any) => option.id);
        const optionTexts = question.options.map((option: any) => text(option.text).toLocaleLowerCase());
        expect(optionIds).toContain(question.correctAnswer);
        expect(new Set(optionTexts).size).toBe(optionTexts.length);
        expect(text(question.explanation).length).toBeGreaterThan(20);
      });
      const ordering = finalQuiz.blocks.find((block: any) => block.type === "bucket_sort");
      expect(ordering.buckets).toHaveLength(4);
      expect(ordering.cards).toHaveLength(4);
      expect(new Set(ordering.cards.map((card: any) => card.correctBucket)).size).toBe(4);
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
