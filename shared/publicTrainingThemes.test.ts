import { describe, expect, it } from "vitest";
import {
  getPublicTrainingCatalogMetrics,
  getPublicTrainingTheme,
  getPublicTrainingThemeAlias,
  getPublicTrainingThemes,
} from "./publicTrainingThemes";

describe("thèmes publics de formation", () => {
  it("dérive uniquement des grands domaines qui possèdent réellement des formations et des cours", () => {
    const themes = getPublicTrainingThemes();

    expect(themes).toHaveLength(7);
    expect(themes.every((theme) => theme.metrics.certificationCount > 0 && theme.metrics.courseCount > 0)).toBe(true);
    expect(themes.every((theme) => theme.certifications.length === theme.metrics.certificationCount)).toBe(true);
    expect(themes.every((theme) => theme.useCases.length > 0)).toBe(true);
  });

  it("agrège les indicateurs du grand domaine finance depuis le catalogue canonique et expose ses cas d’usage", () => {
    const finance = getPublicTrainingTheme("comptabilite-finance");

    expect(finance).not.toBeNull();
    expect(finance?.metrics.courseCount).toBeGreaterThan(1);
    expect(finance?.metrics.activityCount).toBeGreaterThan(0);
    expect(finance?.certifications.every((certification) => certification.metrics.activityCount > 0)).toBe(true);
    expect(finance?.useCases.map((item) => item.courseId)).toContain("ia_appliquee_metiers_tp__17");
    expect(finance?.useCases.every((item) => finance.certifications.some((certification) => certification.id === item.certificationId))).toBe(true);
  });

  it("couvre chaque formation avec au moins un grand domaine et rend visibles les liaisons croisées justifiées", () => {
    const themes = getPublicTrainingThemes();
    const certificationIds = new Set(themes.flatMap((theme) => theme.certifications.map((certification) => certification.id)));
    const finance = getPublicTrainingTheme("comptabilite-finance");

    expect(certificationIds.size).toBe(getPublicTrainingCatalogMetrics().certificationCount);
    expect(finance?.certifications.find((certification) => certification.id === "datacamp_ai_for_finance")?.relatedDomains).toContain("Data, BI & Recherche");
    expect(getPublicTrainingThemeAlias("finance-comptabilite-controle-gestion")).toBe("comptabilite-finance");
  });

  it("localise les contenus et métadonnées de chaque grand domaine dans les trois langues", () => {
    (['fr', 'en', 'ar'] as const).forEach((locale) => {
      getPublicTrainingThemes(locale).forEach((theme) => {
        const keywords = theme.seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean);
        expect(theme.title).toBeTruthy();
        expect(theme.introduction).toBeTruthy();
        expect(theme.seo.title).toBeTruthy();
        expect(theme.seo.description).toBeTruthy();
        expect(keywords.length).toBeGreaterThanOrEqual(3);
        expect(keywords.length).toBeLessThanOrEqual(8);
      });
    });
  });

  it("localise les cas d’usage issus des cours même lorsque les données historiques du catalogue dupliquent le français dans en", () => {
    const financeEnglish = getPublicTrainingTheme("comptabilite-finance", "en");
    const financeArabic = getPublicTrainingTheme("comptabilite-finance", "ar");

    expect(financeEnglish?.useCases.find((item) => item.courseId === "ia_appliquee_metiers_tp__17")?.title).toBe("Build a bookkeeping agent");
    expect(financeEnglish?.useCases.find((item) => item.courseId === "ia_appliquee_metiers_tp__20")?.title).toBe("Automated invoicing and reminders for unpaid invoices");
    expect(financeArabic?.useCases.find((item) => item.courseId === "ia_appliquee_metiers_tp__17")?.title).toBe("بناء وكيل لمسك الدفاتر المحاسبية");
    expect(financeArabic?.useCases.find((item) => item.courseId === "ia_appliquee_metiers_tp__20")?.title).toBe("الفوترة والمتابعات الآلية للمدفوعات المتأخرة");

    const developmentArabic = getPublicTrainingTheme("informatique-developpement", "ar");
    const transformationArabic = getPublicTrainingTheme("strategie-transformation-ia", "ar");
    expect(developmentArabic?.useCases.find((item) => item.courseId === "advanced_rag_evaluation_specialist__01")?.title).toBe("أنماط فشل أنظمة RAG");
    expect(transformationArabic?.useCases.find((item) => item.courseId === "ai_governance_compliance_responsible_ai_leader__01")?.title).toBe("أسس الذكاء الاصطناعي المسؤول");
  });

  it("conserve des totaux de catalogue cohérents", () => {
    const metrics = getPublicTrainingCatalogMetrics();

    expect(metrics.certificationCount).toBeGreaterThan(0);
    expect(metrics.courseCount).toBeGreaterThan(0);
    expect(metrics.activityCount).toBeGreaterThanOrEqual(metrics.courseCount);
  });
});
