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
  const invalidMembership = data.courses.flatMap((course: any) => Array.isArray(course?.trainingMemberships) ? course.trainingMemberships.map((membership: any) => ({ course, membership })) : []).find(({ course, membership }: any) => {
    if (!membership || typeof membership.certificationId !== "string" || !certificationIds.includes(membership.certificationId)) return true;
    return membership.certificationId === course.certId || !Number.isFinite(Number(membership.order)) || Number(membership.order) < 1;
  });
  if (invalidMembership) return `Le cours ${invalidMembership.course.id} contient une affiliation de formation invalide.`;
  const duplicateMembership = data.courses.find((course: any) => {
    const ids = Array.isArray(course?.trainingMemberships) ? course.trainingMemberships.map((entry: any) => entry?.certificationId).filter(Boolean) : [];
    return new Set(ids).size !== ids.length;
  });
  if (duplicateMembership) return `Le cours ${duplicateMembership.id} contient des affiliations de formation dupliquées.`;
  const invalidTrainingManifest = data.certifications.find((training: any) => Array.isArray(training?.courses) && (new Set(training.courses).size !== training.courses.length || training.courses.some((courseId: string) => {
    const course = data.courses.find((candidate: any) => candidate.id === courseId);
    return !course || (course.certId !== training.id && !(course.trainingMemberships || []).some((entry: any) => entry?.certificationId === training.id));
  })));
  if (invalidTrainingManifest) return `La formation ${invalidTrainingManifest.id} contient un manifeste de cours invalide.`;
  const unknownCategory = data.certifications.find((certification: any) => certification?.group && categoryIds.length > 0 && !categoryIds.includes(certification.group));
  if (unknownCategory) return `La certification ${unknownCategory.id} référence une catégorie absente.`;
  const invalidVisual = data.certifications.find((certification: any) => {
    const visualAssets = certification?.visualAssets;
    if (!visualAssets) return false;
    return [visualAssets.cardPath, visualAssets.socialPath].some((value) => value !== undefined && (typeof value !== "string" || !value.startsWith("/")));
  });
  if (invalidVisual) return `La formation ${invalidVisual.id} contient une URL de visuel invalide. Utilisez un chemin interne commençant par /. `;
  return null;
}
