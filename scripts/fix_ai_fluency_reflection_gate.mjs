import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "client/public/data/courses/claude_certified_architect_foundations__01.json");
const course = JSON.parse(fs.readFileSync(filePath, "utf8"));
const lesson = (course.lessons || []).find((item) => {
  const title = typeof item.title === "object" ? item.title.en || item.title.fr : item.title;
  return title === "Introduction to AI Fluency" || title === "Introduction à la maîtrise de l'IA";
});
const chapter = lesson?.chapters?.find((item) => item.id === "chapter_02");

if (!chapter) throw new Error("Le chapitre AI Fluency lesson_01/chapter_02 est introuvable.");

const exerciseId = "ex_ai_fluency_intro_reflection";
course.exercises ||= [];

if (!course.exercises.some((exercise) => exercise.id === exerciseId)) {
  course.exercises.push({
    id: exerciseId,
    courseId: "claude_certified_architect_foundations__01",
    lessonId: "lesson_01",
    chapterId: "chapter_02",
    position: "after_content",
    interactionType: "free_text",
    title: {
      en: "Reflection: Introduction to AI Fluency",
      fr: "Réflexion : introduction à l’AI Fluency",
    },
    prompt: {
      en: "Before moving on, reflect on your own experiences of collaborating with AI. Address all three questions: 1. What challenges have you encountered when working with AI to achieve specific outcomes? 2. What possibilities for AI collaboration excite you most? 3. What do you hope to gain from this course?",
      fr: "Avant de poursuivre, réfléchissez à vos propres expériences de collaboration avec l’IA. Répondez aux trois questions : 1. Quels défis avez-vous rencontrés en travaillant avec l’IA pour atteindre des résultats précis ? 2. Quelles possibilités de collaboration avec l’IA vous enthousiasment le plus ? 3. Qu’espérez-vous retirer de ce cours ?",
    },
    instructions: {
      en: "There is no single correct response. Be specific and use examples from your work, studies, or daily life.",
      fr: "Il n’y a pas une réponse unique correcte. Soyez précis et appuyez-vous sur des exemples issus de votre travail, de vos études ou de votre quotidien.",
    },
    correction: {
      en: "Your reflection is complete once you have addressed the three questions with specific examples.",
      fr: "Votre réflexion est terminée lorsque vous avez répondu aux trois questions avec des exemples précis.",
    },
    rubric: "",
    required: true,
    difficulty: "foundation",
    skillTags: ["AI Fluency", "Responsible AI"],
    inputSchema: { minWords: 50 },
  });
}

chapter.type = "checkpoint";
chapter.blocks ||= [];
for (const courseLesson of course.lessons || []) {
  for (const courseChapter of courseLesson.chapters || []) {
    if (courseChapter !== chapter) {
      courseChapter.blocks = (courseChapter.blocks || []).filter((block) => block.id !== "checkpoint_ai_fluency_intro_reflection");
    }
  }
}
if (!chapter.blocks.some((block) => block.type === "checkpoint" && block.exerciseId === exerciseId)) {
  chapter.blocks.push({ type: "checkpoint", id: "checkpoint_ai_fluency_intro_reflection", exerciseId });
}
chapter.completionRule = { requires: ["requiredExercisesPassed"] };

fs.writeFileSync(filePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(`Checkpoint ${exerciseId} ajouté au chapitre ${chapter.id}.`);
