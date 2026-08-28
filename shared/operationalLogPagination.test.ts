import { describe, expect, it } from "vitest";
import { normalizeOperationalLogPage, paginateOperationalLogs } from "./operationalLogPagination";

const logs = Array.from({ length: 53 }, (_, index) => ({ timestamp: 53 - index, type: index % 2 ? "learning_time" : "boundary", category: index % 2 ? "learning" : "incident", courseId: `course-${index}`, details: { message: `événement ${index}` } }));

describe("paginateOperationalLogs", () => {
  it("retourne des pages stables avec le total exact", () => {
    const result = paginateOperationalLogs(logs, 2, 25);
    expect(result.total).toBe(53);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(25);
  });

  it("filtre sur le cours et borne une page devenue invalide", () => {
    const result = paginateOperationalLogs(logs, 9, 25, "course-4");
    expect(result.total).toBe(11);
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(11);
  });

  it("borne la taille de page et calcule un offset serveur stable", () => {
    expect(normalizeOperationalLogPage(3, 500)).toEqual({ page: 3, pageSize: 100, offset: 200 });
  });
});
