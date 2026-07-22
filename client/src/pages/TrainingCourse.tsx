import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import trainingIndex from "@/data/trainingIndex.json";
import { ArrowLeft, CheckCircle2, PlayCircle, ChevronDown, ChevronUp, BookOpen, Brain, Award } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Quiz component for interactive exercises
function QuizSection({ certId, lang, t }: { certId: string; lang: string; t: (obj: { en: string; fr: string }) => string }) {
  const [allQs, setAllQs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/data/mockExamQuestions.json")
      .then(res => res.json())
      .then(data => setAllQs(data))
      .catch(() => {});
  }, []);
  const questions = useMemo(
    () => allQs.filter((q) => q.certificationId === certId),
    [certId, allQs]
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const isCorrect = selectedAnswer !== null && q.correctChoiceIds.includes(selectedAnswer);

  const handleAnswer = (choiceId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(choiceId);
    setShowExplanation(true);
    setAnswered((a) => a + 1);
    if (q.correctChoiceIds.includes(choiceId)) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          {t({ en: "Practice Questions", fr: "Questions pratiques" })}
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">
            {currentQ + 1}/{questions.length}
          </span>
          {answered > 0 && (
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {score}/{answered} {t({ en: "correct", fr: "correct" })}
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-slate-800 font-medium text-base leading-relaxed">
          {lang === "fr" ? q.question.fr : q.question.en}
        </p>
        {q.domain && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {typeof q.domain === 'string' ? q.domain : (lang === 'fr' ? q.domain.fr : q.domain.en)}
          </span>
        )}
      </div>

      {/* Choices */}
      <div className="space-y-2 mb-4">
        {q.choices.map((choice: any) => {
          const isSelected = selectedAnswer === choice.id;
          const isCorrectChoice = q.correctChoiceIds.includes(choice.id);
          let borderClass = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30";
          if (showExplanation) {
            if (isCorrectChoice) borderClass = "border-emerald-500 bg-emerald-50";
            else if (isSelected && !isCorrectChoice) borderClass = "border-red-400 bg-red-50";
            else borderClass = "border-slate-200 opacity-60";
          } else if (isSelected) {
            borderClass = "border-emerald-400 bg-emerald-50";
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleAnswer(choice.id)}
              disabled={showExplanation}
              className={`w-full text-left p-3 rounded-lg border transition-all ${borderClass}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold shrink-0 mt-0.5">
                  {choice.id}
                </span>
                <span className="text-sm text-slate-700">
                  {lang === "fr" ? choice.text.fr : choice.text.en}
                </span>
                {showExplanation && isCorrectChoice && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-auto mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`p-4 rounded-lg mb-4 ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
          <p className="text-sm font-medium mb-1">
            {isCorrect
              ? t({ en: "✓ Correct!", fr: "✓ Correct !" })
              : t({ en: "✗ Incorrect", fr: "✗ Incorrect" })}
          </p>
          <p className="text-sm text-slate-700">
            {lang === "fr" ? q.explanation.fr : q.explanation.en}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={resetQuiz} className="text-sm text-slate-400 hover:text-slate-600">
          {t({ en: "Reset quiz", fr: "Recommencer" })}
        </button>
        {showExplanation && currentQ < questions.length - 1 && (
          <Button onClick={nextQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
            {t({ en: "Next question →", fr: "Question suivante →" })}
          </Button>
        )}
        {showExplanation && currentQ === questions.length - 1 && (
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">
              {t({ en: `Final score: ${score}/${questions.length}`, fr: `Score final : ${score}/${questions.length}` })}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3 italic">
        {t({
          en: "These are practice questions generated from course material. They are not official Anthropic exam questions.",
          fr: "Ce sont des questions pratiques générées à partir du matériel de cours. Ce ne sont pas des questions officielles de l'examen Anthropic.",
        })}
      </p>
    </div>
  );
}

// Lesson content renderer
function LessonContent({ lesson, lang, t, isExpanded, onToggle }: {
  lesson: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const content = lang === "fr" ? lesson.content.fr : lesson.content.en;
  // Format content: split by ### or ## headings and render as sections
  const sections = content.split(/(?=^#{1,3}\s)/m).filter(Boolean);

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-slate-800 text-sm">{t(lesson.title)}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {/* Videos are displayed at course level above */}
          {/* Content */}
          <div className="prose prose-sm prose-slate max-w-none mt-3">
            {sections.map((section: string, i: number) => (
              <div key={i} className="mb-3">
                {section.split("\n").map((line: string, li: number) => {
                  if (line.startsWith("### ")) {
                    return <h4 key={li} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{line.replace("### ", "")}</h4>;
                  }
                  if (line.startsWith("## ")) {
                    return <h3 key={li} className="text-base font-semibold text-slate-900 mt-4 mb-2">{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("# ")) {
                    return <h2 key={li} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace("# ", "")}</h2>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={li} className="text-sm text-slate-600 ml-4">{line.replace("- ", "")}</li>;
                  }
                  if (line.startsWith("```")) {
                    return <code key={li} className="block bg-slate-100 p-2 rounded text-xs font-mono text-slate-700 my-2">{line.replace(/```\w*/, "")}</code>;
                  }
                  if (line.trim() === "") return null;
                  return <p key={li} className="text-sm text-slate-600 leading-relaxed">{line}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingCourse() {
  const { certId, courseId } = useParams<{ certId: string; courseId: string }>();
  const { lang, toggleLang, t } = useLanguage();
  const { isCourseComplete, markCourseComplete } = useTrainingProgress();
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const course = trainingIndex.courses.find((c: any) => c.id === courseId);
  const cert = trainingIndex.certifications.find((c: any) => c.id === certId);

  // Lazy-load lessons for this course from public/data/courses/
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    setLessonsLoading(true);
    fetch(`/data/courses/${courseId}.json`)
      .then((res) => res.json())
      .then((data) => {
        setCourseLessons(data.lessons || []);
        setLessonsLoading(false);
      })
      .catch(() => {
        setCourseLessons([]);
        setLessonsLoading(false);
      });
  }, [courseId]);

  if (!course || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">{t({ en: "Course not found", fr: "Cours introuvable" })}</p>
      </div>
    );
  }

  const completed = isCourseComplete(course.id);
  const videos = course.videos || [];

  const toggleVideo = (videoId: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/training/${certId}`} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xl font-bold text-slate-800">Neopolis</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Training</span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="text-base">{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
            {lang === "en" ? "EN" : "FR"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/training" className="hover:text-emerald-600">{t({ en: "Training", fr: "Formation" })}</Link>
            <span>/</span>
            <Link href={`/training/${certId}`} className="hover:text-emerald-600">{t(cert.title)}</Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t(course.title)}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {courseLessons.length > 0 && (
              <span>{courseLessons.length} {t({ en: "lessons", fr: "leçons" })}</span>
            )}
            {course.exerciseCount > 0 && (
              <span>{course.exerciseCount} {t({ en: "exercises", fr: "exercices" })}</span>
            )}
            {videos.length > 0 && (
              <span>{videos.length} {t({ en: "videos", fr: "vidéos" })}</span>
            )}
          </div>
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              {t({ en: "Video Lessons", fr: "Leçons vidéo" })}
            </h2>
            <div className="space-y-3">
              {videos.map((video: any) => (
                <div key={video.videoId || video.title} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleVideo(video.videoId || video.title)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="font-medium text-slate-800 text-sm">{video.title}</span>
                    </div>
                    {expandedVideos.has(video.videoId || video.title) ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {expandedVideos.has(video.videoId || video.title) && (
                    <div className="px-4 pb-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={video.embedUrl || video.embed_url}
                          title={video.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {(video.watchUrl || video.watch_url) && (
                        <a
                          href={video.watchUrl || video.watch_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-slate-400 hover:text-emerald-600"
                        >
                          {t({ en: "Watch on YouTube →", fr: "Regarder sur YouTube →" })}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Content */}
        {courseLessons.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {t({ en: "Course Content", fr: "Contenu du cours" })}
              </h2>
              <button
                onClick={() => {
                  if (expandedLessons.size === courseLessons.length) {
                    setExpandedLessons(new Set());
                  } else {
                    setExpandedLessons(new Set(courseLessons.map((l) => l.id)));
                  }
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {expandedLessons.size === courseLessons.length
                  ? t({ en: "Collapse all", fr: "Tout réduire" })
                  : t({ en: "Expand all", fr: "Tout développer" })}
              </button>
            </div>
            <div className="space-y-2">
              {courseLessons.map((lesson) => (
                <LessonContent
                  key={lesson.id}
                  lesson={lesson}
                  lang={lang}
                  t={t}
                  isExpanded={expandedLessons.has(lesson.id)}
                  onToggle={() => toggleLesson(lesson.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Practice Questions */}
        <QuizSection certId={certId || ""} lang={lang} t={t} />

        {/* Mark Complete */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-6">
          <div>
            <h3 className="font-medium text-slate-800">
              {completed
                ? t({ en: "Course completed!", fr: "Cours terminé !" })
                : t({ en: "Mark as complete", fr: "Marquer comme terminé" })}
            </h3>
            <p className="text-sm text-slate-500">
              {completed
                ? t({ en: "Great job! Move on to the next course.", fr: "Bravo ! Passez au cours suivant." })
                : t({ en: "Click when you've finished studying this course.", fr: "Cliquez quand vous avez fini d'étudier ce cours." })}
            </p>
          </div>
          {completed ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          ) : (
            <Button
              onClick={() => markCourseComplete(course.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {t({ en: "Complete", fr: "Terminer" })}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
