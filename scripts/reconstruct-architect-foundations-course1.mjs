import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__01.json");
const assetReportPath = resolve(process.cwd(), "docs/architect-foundations-course1-assets.json");
const course = JSON.parse(await readFile(coursePath, "utf8"));
const assetReport = JSON.parse(await readFile(assetReportPath, "utf8"));

const officialSourceUrl = "https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations/291863";
const officialVideoIds = new Set(assetReport.videos.filter((video) => video.official).map((video) => video.videoId));
const downloadsByUrl = new Map(assetReport.downloads.map((asset) => [asset.url, asset]));

function invariant(condition, message) {
  if (!condition) throw new Error(`Précondition non satisfaite : ${message}`);
}

function localized(value) {
  if (typeof value === "string") return value;
  return value?.en || value?.fr || "";
}

invariant(course.courseId === "claude_certified_architect_foundations__01", "courseId Architect Foundations 01");
invariant(Array.isArray(course.lessons), "liste de leçons");
invariant(course.lessons.length === 14 || course.lessons.length === 15, "14 leçons avant correction ou 15 après correction");

const introduction = course.lessons.find((lesson) => localized(lesson.title) === "Introduction to AI Fluency");
invariant(introduction, "leçon officielle d’introduction");
const introChapter = introduction.chapters?.find((chapter) => chapter.id === "chapter_01");
invariant(introChapter?.blocks?.some((block) => block.type === "video" && block.videoId === "JpGtOfSgR-c"), "vidéo officielle d’introduction");

for (const lesson of course.lessons) {
  for (const chapter of lesson.chapters || []) {
    for (const block of chapter.blocks || []) {
      if (block.type === "video") {
        const official = officialVideoIds.has(block.videoId);
        block.mediaMeta = {
          origin: official ? "anthropic" : "neopolis",
          official,
          sourceUrl: official ? officialSourceUrl : (block.watchUrl || null),
          localAssetId: block.videoId || null,
          language: "en",
          captions: false,
          transcriptId: official ? `transcript_${block.videoId}` : null,
          duration: null,
          durationStatus: "not_available_from_public_metadata",
          checksum: `sha256:${assetReport.videos.find((video) => video.videoId === block.videoId)?.referenceChecksum || "unavailable"}`,
          checksumScope: "canonical_video_reference",
          testedAt: assetReport.videos.find((video) => video.videoId === block.videoId)?.testedAt || null,
          label: official
            ? { en: "Official Anthropic resource", fr: "Ressource officielle Anthropic" }
            : { en: "Neopolis supplement", fr: "Complément Neopolis" },
        };
      }
      if (block.type === "download") {
        const asset = downloadsByUrl.get(block.download_url || block.url);
        invariant(asset?.passed, `téléchargement vérifié : ${block.filename || block.download_url}`);
        block.assetMeta = {
          origin: "anthropic",
          official: true,
          sourceUrl: block.source_page || officialSourceUrl,
          localAssetId: block.asset_path || block.filename || null,
          mimeType: asset.contentType,
          bytes: asset.bytes,
          checksum: `sha256:${asset.checksum}`,
          testedAt: asset.testedAt,
          label: { en: "Official Anthropic resource", fr: "Ressource officielle Anthropic" },
        };
      }
    }
  }
}

const originalIntroText = introChapter.blocks.find((block) => block.type === "content")?.body;
invariant(originalIntroText?.en?.includes("Estimated time for this module: 10-15 minutes") || originalIntroText?.en?.includes("Indicative duration for this screen: 10–15 minutes"), "libellé de durée anglais connu");
invariant(originalIntroText?.fr?.includes("Temps estimé pour ce module : 10-15 minutes") || originalIntroText?.fr?.includes("Durée indicative de cet écran : 10–15 minutes"), "libellé de durée français connu");
originalIntroText.en = originalIntroText.en.replace("Estimated time for this module: 10-15 minutes", "Indicative duration for this screen: 10–15 minutes");
originalIntroText.fr = originalIntroText.fr.replace("Temps estimé pour ce module : 10-15 minutes", "Durée indicative de cet écran : 10–15 minutes");

const certificateId = "lesson_ai_fluency_certificate";
const existingCertificate = course.lessons.find((lesson) => lesson.id === certificateId);
if (!existingCertificate) {
  const certificateLesson = {
    id: certificateId,
    title: {
      en: "Certificate of completion",
      fr: "Attestation de fin de cours",
    },
    chapters: [
      {
        id: "chapter_certificate_completion",
        title: {
          en: "Certificate of completion",
          fr: "Attestation de fin de cours",
        },
        type: "teaching",
        blocks: [
          {
            type: "callout",
            variant: "info",
            title: {
              en: "Completion milestone",
              fr: "Jalon de complétion",
            },
            body: {
              en: "The official course includes a **Certificate of completion** milestone. Neopolis records the completion of this course in your learning progress and skills. This course milestone is not presented as an Anthropic professional certification; the CCAR-F mock exam stays available only after the full preparation pathway is completed.",
              fr: "Le cours officiel inclut un jalon **Certificate of completion**. Neopolis enregistre la complétion de ce cours dans votre progression et vos compétences. Ce jalon de cours ne constitue pas une certification professionnelle Anthropic ; l’examen blanc CCAR-F reste accessible uniquement après la complétion de tout le parcours de préparation.",
            },
          },
          {
            type: "content",
            body: {
              en: "## Completion recorded\n\nYou have reached the completion milestone for **AI Fluency: Framework & Foundations**. Continue to the additional activities to extend your practice with the 4D Framework.",
              fr: "## Complétion enregistrée\n\nVous avez atteint le jalon de complétion de **AI Fluency: Framework & Foundations**. Poursuivez avec les activités supplémentaires pour approfondir votre pratique du cadre des 4D.",
            },
          },
        ],
        completionRule: { requires: ["contentViewed"] },
      },
    ],
    completionRule: { requires: ["allChaptersComplete"] },
    competencyTags: ["ai_governance", "ai_business"],
    recommendedVideosManaged: false,
  };
  const additionalIndex = course.lessons.findIndex((lesson) => localized(lesson.title) === "Additional activities");
  invariant(additionalIndex >= 0, "leçon Additional activities");
  course.lessons.splice(additionalIndex, 0, certificateLesson);
}

const certificateLesson = course.lessons.find((lesson) => lesson.id === certificateId);
certificateLesson.recommendedVideosManaged = false;
const certificateChapter = certificateLesson?.chapters?.find((chapter) => chapter.id === "chapter_certificate_completion");
invariant(certificateChapter, "sous-écran Certificate of completion");
if (!certificateChapter.blocks.some((block) => block.type === "checkpoint" && block.exerciseId === "ex_ai_fluency_certificate_completion")) {
  certificateChapter.blocks.push({ type: "checkpoint", id: "checkpoint_ai_fluency_certificate_completion", exerciseId: "ex_ai_fluency_certificate_completion" });
}
certificateChapter.completionRule = { requires: ["requiredExercisesPassed"] };

if (!course.exercises.some((exercise) => exercise.id === "ex_ai_fluency_certificate_completion")) {
  course.exercises.push({
    id: "ex_ai_fluency_certificate_completion",
    courseId: course.courseId,
    lessonId: certificateId,
    chapterId: "chapter_certificate_completion",
    position: "after_content",
    interactionType: "single_choice",
    title: {
      en: "AI Fluency completion check",
      fr: "Vérification de complétion AI Fluency",
    },
    prompt: {
      en: "A project lead has drafted a short plan with Claude. What is the most appropriate next step under the AI Fluency Framework before the plan is used?",
      fr: "Une responsable de projet a rédigé un plan court avec Claude. Quelle est l’étape la plus appropriée du cadre AI Fluency avant d’utiliser ce plan ?",
    },
    instructions: {
      en: "Choose one answer, then read the feedback before continuing.",
      fr: "Sélectionnez une réponse, puis lisez la correction avant de poursuivre.",
    },
    options: [
      { id: "a", text: { en: "Use the plan immediately because Claude has already produced a complete answer.", fr: "Utiliser immédiatement le plan car Claude a déjà fourni une réponse complète." }, correct: false },
      { id: "b", text: { en: "Evaluate the plan against the objective and constraints, verify important claims, then document the human decision and any AI contribution.", fr: "Évaluer le plan au regard de l’objectif et des contraintes, vérifier les affirmations importantes, puis documenter la décision humaine et la contribution de l’IA." }, correct: true },
      { id: "c", text: { en: "Ask Claude to make the final decision so the workflow is fully automated.", fr: "Demander à Claude de prendre la décision finale afin d’automatiser entièrement le workflow." }, correct: false },
      { id: "d", text: { en: "Remove all context and examples so the plan remains general enough for every project.", fr: "Supprimer tout contexte et tout exemple afin que le plan reste suffisamment général pour chaque projet." }, correct: false },
    ],
    correction: {
      en: "**Correct answer: b.** It combines Discernment (checking the result against the goal and evidence) with Diligence (accountability and transparent attribution). **a** treats generated text as self-validating. **c** removes the human judgment that remains necessary for responsible delegation. **d** weakens Description because useful AI collaboration depends on relevant context and constraints.",
      fr: "**Bonne réponse : b.** Elle associe le Discernment (vérifier le résultat au regard de l’objectif et des éléments probants) et la Diligence (responsabilité et attribution transparente). **a** traite un texte généré comme auto-validant. **c** retire le jugement humain nécessaire à une délégation responsable. **d** affaiblit la Description, car une collaboration utile avec l’IA dépend d’un contexte et de contraintes pertinents.",
    },
    rubric: null,
    required: true,
    difficulty: "intermediate",
    skillTags: ["ai_governance", "ai_solution_design", "evaluation"],
    sourcePedagogique: "AI Fluency: Framework & Foundations — 4D framework and conclusion",
    version: "neopolis-original-2026-09-14",
  });
}

invariant(course.lessons.length === 15, "15 leçons après insertion du jalon officiel");
const allChapters = course.lessons.flatMap((lesson) => lesson.chapters || []);
invariant(allChapters.length === 34, "34 sous-écrans après insertion du jalon officiel");
invariant(course.lessons.at(-2)?.id === certificateId, "certificat placé avant Additional activities");

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  courseId: course.courseId,
  lessons: course.lessons.length,
  chapters: allChapters.length,
  videos: course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "video").length,
  downloads: course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "download").length,
}, null, 2));
