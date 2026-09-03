import { describe, expect, it } from "vitest";
import {
  getPublicTrainingCatalogMetrics,
  getPublicTrainingTheme,
  getPublicTrainingThemes,
} from "./publicTrainingThemes";

describe("thèmes publics de formation", () => {
  it("dérive uniquement des thèmes qui possèdent réellement des formations et des cours", () => {
    const themes = getPublicTrainingThemes();

    expect(themes.length).toBeGreaterThanOrEqual(8);
    expect(themes.every((theme) => theme.metrics.certificationCount > 0 && theme.metrics.courseCount > 0)).toBe(true);
    expect(themes.every((theme) => theme.certifications.length === theme.metrics.certificationCount)).toBe(true);
  });

  it("agrège les indicateurs du thème finance depuis le catalogue canonique", () => {
    const finance = getPublicTrainingTheme("finance-comptabilite-controle-gestion");

    expect(finance).not.toBeNull();
    expect(finance?.metrics.courseCount).toBeGreaterThan(1);
    expect(finance?.metrics.activityCount).toBeGreaterThan(0);
    expect(finance?.certifications.every((certification) => certification.metrics.activityCount > 0)).toBe(true);
  });

  it("conserve des totaux de catalogue cohérents", () => {
    const metrics = getPublicTrainingCatalogMetrics();

    expect(metrics.certificationCount).toBeGreaterThan(0);
    expect(metrics.courseCount).toBeGreaterThan(0);
    expect(metrics.activityCount).toBeGreaterThanOrEqual(metrics.courseCount);
  });
});
