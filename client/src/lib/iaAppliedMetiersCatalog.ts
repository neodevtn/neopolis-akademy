export const IA_APPLIQUEE_METIERS_COLLECTION_ID = "ia_appliquee_metiers_tp";
const standaloneCertificationPrefix = `${IA_APPLIQUEE_METIERS_COLLECTION_ID}__formation_`;

type CourseReference = {
  id?: string;
  certId?: string;
};

type CertificationReference = {
  group?: string;
  isStandaloneTP?: boolean;
};

export function getStandaloneTpCertificationId(course: CourseReference | undefined, routeCertificationId: string | undefined) {
  if (!course || routeCertificationId !== IA_APPLIQUEE_METIERS_COLLECTION_ID) return null;
  return course.certId?.startsWith(standaloneCertificationPrefix) ? course.certId : null;
}

export function getStandaloneTpCertificationIdForOrder(order: number) {
  return `${standaloneCertificationPrefix}${String(order).padStart(2, "0")}`;
}

export function isStandaloneTpCertification(certification: CertificationReference | undefined) {
  return certification?.group === IA_APPLIQUEE_METIERS_COLLECTION_ID && certification.isStandaloneTP === true;
}
