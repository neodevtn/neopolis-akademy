export function validateCatalogIndex(data: any): string | null {
  if (!Array.isArray(data?.certifications) || !Array.isArray(data?.courses)) return "Le catalogue doit contenir les listes de certifications et de cours.";
  const certificationIds = data.certifications.map((certification: any) => certification?.id).filter(Boolean);
  if (new Set(certificationIds).size !== certificationIds.length) return "Chaque certification doit avoir un identifiant unique.";
  const courseIds = data.courses.map((course: any) => course?.id).filter(Boolean);
  if (new Set(courseIds).size !== courseIds.length) return "Chaque cours du catalogue doit avoir un identifiant unique.";
  const categoryIds = (data.categories || []).map((category: any) => category?.id).filter(Boolean);
  if (new Set(categoryIds).size !== categoryIds.length) return "Chaque catégorie doit avoir un identifiant unique.";
  const unknownCertification = data.courses.find((course: any) => course?.certId && !certificationIds.includes(course.certId));
  if (unknownCertification) return `Le cours ${unknownCertification.id} référence une certification absente.`;
  const unknownCategory = data.certifications.find((certification: any) => certification?.group && categoryIds.length > 0 && !categoryIds.includes(certification.group));
  if (unknownCategory) return `La certification ${unknownCategory.id} référence une catégorie absente.`;
  return null;
}
