import { describe, expect, it } from "vitest";
import { convertDataCampV1, htmlToText, inferCompetencyTags, parseUploadLog } from "../scripts/datacamp-importer-core.mjs";

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
          projectorSlides: [{ number: 1, title: "Slide pilote", type: "TitleSlide", script: "Bonjour", images: [], content: "", contentLeft: "", contentRight: "" }],
          projectorTimings: [{ time: 0, slideIndex: 0, fragment: -1 }],
          projectorTimingUnit: "fraction",
          projectorDuration: 300,
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
        type: "VisualExercise",
        title: "Ressource pilote",
        content: { assignment_html: "<p>Consultez le PDF avant de continuer.</p>" },
      },
      {
        chapter_number: 1,
        exercise_number: 5,
        exercise_id: 5,
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
      {
        chapter_number: 1,
        exercise_number: 6,
        exercise_id: 6,
        type: "ChatExercise",
        title: "Simulation conversationnelle pilote",
        content: {
          assignment_text: "L’agent FoodGPT est conçu pour proposer des recettes.\n\nVous testez les prompts suivants :\n\nUn message agressif\n\nUNE LISTE EN MAJUSCULES\n\nUne phrase absurde\n\nQuels types d’entrées font échouer l’agent ?",
          question: { solutionItems: [{ answer: "Insultes", correct: true, feedback: "À tester" }, { answer: "Majuscules", correct: false, feedback: "Fonctionne" }, { answer: "Phrases absurdes", correct: true, feedback: "À tester" }] },
        },
      },
      {
        chapter_number: 1,
        exercise_number: 7,
        exercise_id: 7,
        type: "CloudExercise",
        title: "TP cloud pilote",
        xp: 100,
        content: {
          assignment_html: "<p>Réalisez une analyse dans votre environnement autonome.</p>",
          instructions_markdown: "<ol><li>Préparez votre outil autorisé.</li><li>Rédigez une réponse justifiée.</li></ol>",
          hint_html: "<p>Ne partagez aucune donnée sensible.</p>",
          question: { prompt: "<exercise_objective>Cette balise interne ne doit pas être affichée.</exercise_objective>" },
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
    expect(course.lessons[0].chapters).toHaveLength(7);
    expect(course.lessons[0].chapters[0].blocks[0]).toMatchObject({
      type: "video",
      audioUrl: "/api/assets/video_hash.mp3",
      subtitleUrlFr: "/api/assets/video_fr_hash.vtt",
      projectorSlides: [{ title: "Slide pilote" }],
      projectorTimings: [{ time: 0, slideIndex: 0 }],
      projectorTimingUnit: "fraction",
    });
    expect(course.lessons[0].chapters[1].blocks[0]).toMatchObject({ type: "single_choice_exercise", correctAnswer: "b" });
    expect(course.lessons[0].chapters[2].blocks[0]).toMatchObject({ type: "multi_choice_exercise", correctAnswers: "a" });
    expect(course.lessons[0].chapters[3].blocks[0]).toMatchObject({ type: "resource_review", resourceUrl: "/api/assets/chapter_hash.pdf" });
    expect(course.lessons[0].chapters[4].blocks[0]).toMatchObject({ type: "cloud_exercise", environmentGuide: expect.any(Object), resources: [{ url: "/api/assets/chapter_hash.pdf" }] });
    expect(course.lessons[0].chapters[5].blocks[0]).toMatchObject({
      type: "multi_choice_exercise",
      correctAnswers: "a,c",
      chatScenario: { agentName: "FoodGPT", messages: [{ role: "user" }, { role: "user" }, { role: "user" }] },
    });
    expect(course.lessons[0].chapters[6].blocks[0]).toMatchObject({
      type: "cloud_exercise",
      assignment: "Réalisez une analyse dans votre environnement autonome.",
      steps: ["Préparez votre outil autorisé.", "Rédigez une réponse justifiée."],
    });
    expect(JSON.stringify(course.lessons[0].chapters[6].blocks[0])).not.toContain("exercise_objective");
    expect(course.lessons[0].chapters.every((chapter) => chapter.requiredBeforeAdvance)).toBe(true);
    expect(course.lessons[0].competencyTags).toEqual(["ai_solution_design"]);
    expect(course.datacampImport.competencyTagging).toBe("lesson_content_signals_v1");
  });

  it("nettoie le HTML de source sans injecter de balisage libre", () => {
    expect(htmlToText("<p>Texte&nbsp;<strong>important</strong></p><ul><li>Point</li></ul>")).toContain("**important**");
    expect(htmlToText("<p>Texte</p>")).not.toContain("<p>");
    expect(htmlToText('<p>Consultez <a href="https://assets.datacamp.com/path/source.pdf">le support local</a>.</p>')).toBe("Consultez le support local.");
  });

  it("transforme les chemins de stockage uploadés en références du proxy applicatif", () => {
    const map = parseUploadLog("Uploading file (webdev private): /tmp/media.mp3\nFile uploaded successfully!\nStorage Path: /manus-storage/media_abc12345.mp3");
    expect(map.get("/tmp/media.mp3")).toBe("/api/assets/media_abc12345.mp3");
    const compactMap = parseUploadLog("Uploading file (webdev private): /tmp/compact.mp3\nStorage Path: /manus-storage/compact_abc12345.mp3");
    expect(compactMap.get("/tmp/compact.mp3")).toBe("/api/assets/compact_abc12345.mp3");
  });

  it("associe les compétences aux leçons à partir du contenu canonique, avec un repli explicable", () => {
    expect(inferCompetencyTags({ title: "Créer des prompts avec Claude", activities: [] })).toContain("prompt_engineering");
    expect(inferCompetencyTags({ title: "Introduction to Google Workspace with Gemini", activities: [] })).toContain("ai_business");
    expect(inferCompetencyTags({ title: "Lesson neutral", activities: [] })).toEqual(["ai_solution_design"]);
  });
});
