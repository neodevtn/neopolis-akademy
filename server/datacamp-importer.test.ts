import { describe, expect, it } from "vitest";
import { convertDataCampV1, htmlToText, parseUploadLog } from "../scripts/datacamp-importer-core.mjs";

const manifest = {
  schema_version: "neopolis.datacamp_course.v1",
  source: { provider: "DataCamp", extraction_language: "fr-FR" },
  course: { slug: "pilot-course", title: "Cours pilote" },
  completeness: { activities_extracted: 3, videos_extracted: 1 },
  chapters: [{
    number: 1,
    title: "Chapitre pilote",
    description: "Description",
    slides_pdf_local: "downloads/slides/chapter.pdf",
    activities: [
      {
        chapter_number: 1,
        exercise_number: 1,
        exercise_id: 1,
        type: "VideoExercise",
        title: "Vidéo pilote",
        video: {
          audio_local: "downloads/projector_assets/video.mp3",
          subtitles: { fr_local: "downloads/projector_assets/video_fr.vtt" },
          transcript_segments: [{ heading: "Introduction", text: "Texte transcrit" }],
        },
      },
      {
        chapter_number: 1,
        exercise_number: 2,
        exercise_id: 2,
        type: "PureMultipleChoiceExercise",
        title: "Question pilote",
        content: {
          assignment_html: "<p>Quelle réponse est correcte&nbsp;?</p>",
          question: { possible_answers: ["Incorrecte", "[Correcte]"], feedback: ["Non", "Oui"] },
          hint_html: "<p>Indice utile</p>",
        },
      },
      {
        chapter_number: 1,
        exercise_number: 3,
        exercise_id: 3,
        type: "PureMultipleChoiceExercise",
        title: "QCM multiple pilote",
        content: {
          assignment_html: "<p>Sélectionnez toutes les réponses justes.</p>",
          question: { solutionItems: [{ answer: "Réponse juste", correct: true, feedback: "Bien vu" }, { answer: "Réponse fausse", correct: false, feedback: "À revoir" }] },
        },
      },
      {
        chapter_number: 1,
        exercise_number: 4,
        exercise_id: 4,
        type: "NormalExercise",
        title: "TP pilote",
        xp: 100,
        content: {
          assignment_html: "<p>Réalisez le TP.</p>",
          instructions_markdown: "<ul><li>Écrivez du code.</li></ul>",
          sample_code: 'client = Anthropic(api_key="datacamp-token", base_url=url)',
          solution: 'client = Anthropic(api_key="datacamp-token", base_url=url)',
          hint_html: "<p>Utilisez le SDK.</p>",
        },
      },
    ],
  }],
};

describe("convertDataCampV1", () => {
  it("préserve l’ordre, les QCM interactifs, le TP et les médias locaux via le proxy", () => {
    const assets = new Map([
      ["downloads/slides/chapter.pdf", "/api/assets/chapter_hash.pdf"],
      ["downloads/projector_assets/video.mp3", "/api/assets/video_hash.mp3"],
      ["downloads/projector_assets/video_fr.vtt", "/api/assets/video_fr_hash.vtt"],
    ]);
    const course = convertDataCampV1(manifest, assets);
    expect(course.courseId).toBe("pilot_course__01");
    expect(course.lessons[0].chapters).toHaveLength(4);
    expect(course.lessons[0].chapters[0].blocks[0]).toMatchObject({ type: "video", audioUrl: "/api/assets/video_hash.mp3", subtitleUrlFr: "/api/assets/video_fr_hash.vtt" });
    expect(course.lessons[0].chapters[1].blocks[0]).toMatchObject({ type: "single_choice_exercise", correctAnswer: "b" });
    expect(course.lessons[0].chapters[2].blocks[0]).toMatchObject({ type: "multi_choice_exercise", correctAnswers: "a" });
    expect(course.lessons[0].chapters[3].blocks[0]).toMatchObject({ type: "cloud_exercise" });
    expect(course.lessons[0].chapters.every((chapter) => chapter.requiredBeforeAdvance)).toBe(true);
  });

  it("nettoie le HTML de source sans injecter de balisage libre", () => {
    expect(htmlToText("<p>Texte&nbsp;<strong>important</strong></p><ul><li>Point</li></ul>")).toContain("**important**");
    expect(htmlToText("<p>Texte</p>")).not.toContain("<p>");
  });

  it("transforme les chemins de stockage uploadés en références du proxy applicatif", () => {
    const map = parseUploadLog("Uploading file (webdev private): /tmp/media.mp3\nFile uploaded successfully!\nStorage Path: /manus-storage/media_abc12345.mp3");
    expect(map.get("/tmp/media.mp3")).toBe("/api/assets/media_abc12345.mp3");
  });
});
