import arabicTranslations from "./publicTrainingArabicTranslations.json";
import englishTranslations from "./publicTrainingEnglishTranslations.json";

export const publicTrainingLocales = ["fr", "en", "ar"] as const;
export type PublicTrainingLocale = (typeof publicTrainingLocales)[number];

export const publicTrainingLocaleMeta: Record<PublicTrainingLocale, { languageTag: string; ogLocale: string; direction: "ltr" | "rtl"; numberLocale: string; pathPrefix: string }> = {
  fr: { languageTag: "fr-FR", ogLocale: "fr_FR", direction: "ltr", numberLocale: "fr-FR", pathPrefix: "/formations-ia" },
  en: { languageTag: "en", ogLocale: "en_US", direction: "ltr", numberLocale: "en", pathPrefix: "/en/ai-training" },
  ar: { languageTag: "ar", ogLocale: "ar_AR", direction: "rtl", numberLocale: "ar", pathPrefix: "/ar/ai-training" },
};

const translate = (value: string, locale: PublicTrainingLocale) => {
  if (locale === "fr") return value;
  const translations = locale === "ar" ? arabicTranslations : englishTranslations;
  return translations[value as keyof typeof translations] || value;
};

export function localizePublicTrainingText(value: string | { fr?: string; en?: string; ar?: string } | undefined, locale: PublicTrainingLocale, fallback = "AI training") {
  if (!value) return fallback;
  if (typeof value === "string") return translate(value, locale);
  if (locale === "ar") return value.ar || translate(value.fr || value.en || fallback, locale);
  if (locale === "en") return value.en || translate(value.fr || fallback, locale);
  return value.fr || value.en || fallback;
}

export const publicTrainingCopy = {
  fr: {
    languageLabel: "FR",
    languageName: "Français",
    navTraining: "Formations IA",
    navNews: "AI News",
    navCatalogue: "Catalogue",
    navSignIn: "Se connecter",
    freeTraining: "Formations IA gratuites",
    viewCatalogue: "Voir le catalogue",
    discoverAccess: "Découvrir l’accès",
    paths: "parcours",
    courses: "cours",
    activities: "activités",
    exercises: "exercices",
    videos: "vidéos",
    indexTitle: "Formations IA gratuites par métier",
    indexLead: "Explorez l’offre Neopolis Akademy par domaine d’activité : compétences, exercices, vidéos et formations disponibles sur la plateforme.",
    offerTitle: "Une offre structurée autour des usages professionnels",
    offerText: "Choisissez un thème correspondant à votre métier ou à l’objectif que vous souhaitez développer. Les volumes ci-dessous décrivent l’offre déclarée dans le catalogue Neopolis Akademy.",
    themesTitle: "Choisir une formation IA par métier",
    themesText: "Chaque page rassemble les formations et parcours rattachés à un thème précis, avec leurs indicateurs réels et les métiers visés.",
    contextTitle: "Pourquoi développer des compétences IA ?",
    contextText: "L’OCDE indique que son enquête 2024 auprès de plus de 5 000 PME a observé un usage de l’IA générative dans 31 % des entreprises interrogées ; 65 % des PME utilisatrices rapportaient une amélioration de la performance des salariés. Ce contexte ne constitue pas une promesse de résultat : il souligne l’intérêt d’un apprentissage structuré, adapté au métier et à l’organisation.",
    contextLink: "Consulter la publication de l’OCDE",
    themeOverview: "Développer les compétences utiles pour ce domaine",
    volumeTitle: "Répartition des activités par formation",
    volumeText: "La visualisation représente les activités déclarées dans l’offre Neopolis Akademy de ce thème.",
    rolesTitle: "Métiers et compétences associés",
    rolesText: "Les termes ci-dessous sont dérivés des données pédagogiques du catalogue.",
    targetRoles: "Métiers cibles",
    skills: "Compétences abordées",
    transversal: "Parcours transversal",
    appliedSkills: "Compétences IA appliquées",
    availableTraining: "Formations disponibles dans ce thème",
    availableTrainingText: "Accédez au catalogue pour consulter le détail des cours, les conditions d’accès et votre progression personnelle.",
    otherJobs: "Explorer d’autres métiers",
    otherJobsText: "Comparez ce thème avec les autres parcours publics et choisissez le domaine qui correspond le mieux à votre objectif professionnel.",
    allThemes: "Voir toutes les pages thématiques",
    notFoundTitle: "Thème de formation introuvable",
    notFoundText: "La page demandée n’existe pas ou n’est plus disponible.",
    notFoundLink: "Voir les formations IA par métier",
    footer: "Neopolis Akademy · Parcours et travaux pratiques IA. Les contenus affichés proviennent du catalogue de formation de la plateforme.",
    menaDescription: "Formations IA gratuites par métier pour les professionnels de la zone MENA : data, finance, marketing, RH, support client, opérations, juridique et ingénierie IA.",
  },
  en: {
    languageLabel: "EN",
    languageName: "English",
    navTraining: "AI Training",
    navNews: "AI News",
    navCatalogue: "Catalogue",
    navSignIn: "Sign in",
    freeTraining: "Free AI training",
    viewCatalogue: "View the catalogue",
    discoverAccess: "Explore access",
    paths: "learning paths",
    courses: "courses",
    activities: "activities",
    exercises: "exercises",
    videos: "videos",
    indexTitle: "Free AI training by profession",
    indexLead: "Explore Neopolis Akademy’s learning offer by professional domain: skills, exercises, videos, and training available on the platform.",
    offerTitle: "A learning offer structured around professional use cases",
    offerText: "Choose a topic that matches your profession or the objective you want to develop. The figures below describe the offer listed in the Neopolis Akademy catalogue.",
    themesTitle: "Choose AI training by profession",
    themesText: "Each page gathers training and learning paths linked to a specific topic, with their actual indicators and target occupations.",
    contextTitle: "Why develop AI skills?",
    contextText: "The OECD reports that its 2024 survey of more than 5,000 SMEs observed generative AI use in 31% of surveyed companies; 65% of SME users reported improved employee performance. This context is not a promise of results: it highlights the value of structured learning tailored to a profession and organisation.",
    contextLink: "Read the OECD publication",
    themeOverview: "Develop the skills useful for this field",
    volumeTitle: "Activities by training programme",
    volumeText: "The visualisation represents the activities listed in Neopolis Akademy’s offer for this topic.",
    rolesTitle: "Related occupations and skills",
    rolesText: "The terms below are derived from the catalogue’s learning data.",
    targetRoles: "Target occupations",
    skills: "Skills covered",
    transversal: "Cross-functional path",
    appliedSkills: "Applied AI skills",
    availableTraining: "Training available in this topic",
    availableTrainingText: "Open the catalogue to review course details, access conditions, and your personal progress.",
    otherJobs: "Explore other professions",
    otherJobsText: "Compare this topic with other public learning paths and choose the field that best matches your professional objective.",
    allThemes: "View all topic pages",
    notFoundTitle: "Training topic not found",
    notFoundText: "The page you requested does not exist or is no longer available.",
    notFoundLink: "View AI training by profession",
    footer: "Neopolis Akademy · AI learning paths and practical work. The displayed content comes from the platform training catalogue.",
    menaDescription: "Free AI training by profession for professionals across the MENA region: data, finance, marketing, HR, customer support, operations, legal work, and AI engineering.",
  },
  ar: {
    languageLabel: "AR",
    languageName: "العربية",
    navTraining: "تدريب الذكاء الاصطناعي",
    navNews: "أخبار الذكاء الاصطناعي",
    navCatalogue: "الكتالوج",
    navSignIn: "تسجيل الدخول",
    freeTraining: "تدريب مجاني في الذكاء الاصطناعي",
    viewCatalogue: "عرض الكتالوج",
    discoverAccess: "اكتشف الوصول",
    paths: "مسارات تعليمية",
    courses: "دورات",
    activities: "أنشطة",
    exercises: "تمارين",
    videos: "فيديوهات",
    indexTitle: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة",
    indexLead: "استكشف عروض Neopolis Akademy التعليمية حسب المجال المهني: مهارات وتمارين وفيديوهات ودورات متاحة على المنصة.",
    offerTitle: "عرض تعليمي منظّم حول الاستخدامات المهنية",
    offerText: "اختر موضوعاً يناسب مهنتك أو الهدف الذي تريد تطويره. تصف المؤشرات أدناه العرض المعلن في كتالوج Neopolis Akademy.",
    themesTitle: "اختر تدريب الذكاء الاصطناعي حسب المهنة",
    themesText: "تجمع كل صفحة الدورات والمسارات المرتبطة بموضوع محدد، مع مؤشرات فعلية والمهن المستهدفة.",
    contextTitle: "لماذا تطوّر مهارات الذكاء الاصطناعي؟",
    contextText: "تشير منظمة التعاون الاقتصادي والتنمية إلى أن استطلاعها لعام 2024 لأكثر من 5,000 شركة صغيرة ومتوسطة رصد استخدام الذكاء الاصطناعي التوليدي لدى 31% من الشركات التي شملها الاستطلاع؛ وأفادت 65% من الشركات المستخدمة بتحسن أداء الموظفين. لا يمثل هذا السياق وعداً بالنتائج، بل يبرز قيمة التعلم المنظم الملائم للمهنة والمؤسسة.",
    contextLink: "اطّلع على منشور منظمة التعاون الاقتصادي والتنمية",
    themeOverview: "طوّر المهارات المفيدة لهذا المجال",
    volumeTitle: "توزيع الأنشطة حسب البرنامج التدريبي",
    volumeText: "يمثل التصور الأنشطة المعلنة في عرض Neopolis Akademy لهذا الموضوع.",
    rolesTitle: "المهن والمهارات المرتبطة",
    rolesText: "المصطلحات أدناه مستمدة من البيانات التعليمية في الكتالوج.",
    targetRoles: "المهن المستهدفة",
    skills: "المهارات التي يغطيها التدريب",
    transversal: "مسار متعدد التخصصات",
    appliedSkills: "مهارات الذكاء الاصطناعي التطبيقية",
    availableTraining: "الدورات المتاحة ضمن هذا الموضوع",
    availableTrainingText: "افتح الكتالوج للاطلاع على تفاصيل الدورات وشروط الوصول وتقدمك الشخصي.",
    otherJobs: "استكشف مهنًا أخرى",
    otherJobsText: "قارن هذا الموضوع بالمسارات العامة الأخرى واختر المجال الأنسب لهدفك المهني.",
    allThemes: "عرض كل صفحات الموضوعات",
    notFoundTitle: "موضوع التدريب غير موجود",
    notFoundText: "الصفحة المطلوبة غير موجودة أو لم تعد متاحة.",
    notFoundLink: "عرض تدريب الذكاء الاصطناعي حسب المهنة",
    footer: "Neopolis Akademy · مسارات تعلم الذكاء الاصطناعي وأعمال تطبيقية. يأتي المحتوى المعروض من كتالوج التدريب على المنصة.",
    menaDescription: "تدريب مجاني في الذكاء الاصطناعي حسب المهنة للمهنيين في منطقة الشرق الأوسط وشمال أفريقيا: البيانات والمالية والتسويق والموارد البشرية ودعم العملاء والعمليات والقانون وهندسة الذكاء الاصطناعي.",
  },
} as const;

export function publicTrainingPath(locale: PublicTrainingLocale, themeSlug?: string) {
  const root = publicTrainingLocaleMeta[locale].pathPrefix;
  return themeSlug ? `${root}/${encodeURIComponent(themeSlug)}` : root;
}

export function publicTrainingHrefAlternates(themeSlug?: string) {
  return publicTrainingLocales.map((locale) => ({ locale, href: publicTrainingPath(locale, themeSlug) }));
}
