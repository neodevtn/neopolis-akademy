import { describe, expect, it } from "vitest";
import {
  getStandaloneTpCertificationId,
  getStandaloneTpCertificationIdForOrder,
  IA_APPLIQUEE_METIERS_COLLECTION_ID,
  isStandaloneTpCertification,
} from "./iaAppliedMetiersCatalog";

describe("catalogue des TP IA appliquée aux métiers", () => {
  it("construit une formation indépendante par position canonique", () => {
    expect(getStandaloneTpCertificationIdForOrder(1)).toBe("ia_appliquee_metiers_tp__formation_01");
    expect(getStandaloneTpCertificationIdForOrder(40)).toBe("ia_appliquee_metiers_tp__formation_40");
  });

  it("redirige uniquement les anciennes URL de la rubrique vers la formation TP autonome", () => {
    const course = { id: "ia_appliquee_metiers_tp__01", certId: "ia_appliquee_metiers_tp__formation_01" };
    expect(getStandaloneTpCertificationId(course, IA_APPLIQUEE_METIERS_COLLECTION_ID)).toBe(course.certId);
    expect(getStandaloneTpCertificationId(course, course.certId)).toBeNull();
    expect(getStandaloneTpCertificationId({ id: "ai_for_sales__01", certId: "datacamp_ai_for_sales" }, IA_APPLIQUEE_METIERS_COLLECTION_ID)).toBeNull();
  });

  it("reconnaît les formations TP mono-cours qui ne proposent pas d’examen blanc", () => {
    expect(isStandaloneTpCertification({ group: IA_APPLIQUEE_METIERS_COLLECTION_ID, isStandaloneTP: true })).toBe(true);
    expect(isStandaloneTpCertification({ group: IA_APPLIQUEE_METIERS_COLLECTION_ID })).toBe(false);
    expect(isStandaloneTpCertification({ group: "divers", isStandaloneTP: true })).toBe(false);
  });
});
