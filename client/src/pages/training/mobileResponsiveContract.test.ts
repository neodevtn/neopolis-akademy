import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const source = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("contrat responsive du lecteur de formation", () => {
  it("contraint la page de cours, l’en-tête et la carte de leçon à la largeur du viewport", () => {
    const coursePage = source("client/src/pages/TrainingCourse.tsx");

    expect(coursePage).toContain("training-course-shell min-h-screen max-w-full overflow-x-hidden");
    expect(coursePage).toContain("w-full min-w-0 max-w-7xl");
    expect(coursePage).toContain("hidden lg:inline");
    expect(coursePage).toContain("min-w-0 max-w-full p-4 sm:p-8");
  });

  it("empile l’instruction et l’action de navigation sur mobile", () => {
    const reader = source("client/src/pages/training/LessonViewer.tsx");

    expect(reader).toContain("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between");
    expect(reader).toContain("w-full max-w-none text-left text-xs leading-relaxed");
    expect(reader).toContain("w-full justify-center whitespace-normal text-center leading-snug");
  });

  it("garde les blocs interactifs et le panneau assistant à l’intérieur de leur carte", () => {
    const blocks = source("client/src/components/blocks/NovasavoLearningBlocks.tsx");

    expect(blocks).toContain("w-full min-w-0 max-w-full rounded-2xl");
    expect(blocks).toContain("w-full max-w-full break-words rounded-xl");
    expect(blocks).toContain("flex min-w-0 flex-col gap-2 sm:flex-row");
  });
});
