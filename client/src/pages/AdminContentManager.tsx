import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, BookOpen, FileText, HelpCircle, Play, Edit3, Eye,
  ChevronRight, Search, GraduationCap, CheckCircle2, XCircle,
  Plus, Trash2, Save, RefreshCw, Layers, PenTool,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import trainingIndex from "@/data/trainingIndex.json";
import { AdminNavbar } from "@/components/AdminNavbar";

const LOGO_URL = "/manus-storage/logo_neopolis_akademy_9c9a0823.png";

type ViewMode = "browse" | "course" | "quiz-simulate" | "exam-simulate" | "edit-course" | "edit-quiz" | "edit-exam";

export default function AdminContentManager() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCertId, setSelectedCertId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [quizSimState, setQuizSimState] = useState<{ currentQ: number; answers: Record<number, string>; showResults: boolean }>({ currentQ: 0, answers: {}, showResults: false });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{ lessonIdx: number; chapterIdx: number; blockIdx: number; content: string } | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [editingExamQ, setEditingExamQ] = useState<any>(null);
  const [selectedQuizKey, setSelectedQuizKey] = useState("");
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  // Queries
  const coursesQuery = trpc.adminContent.listCourses.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const courseDetailQuery = trpc.adminContent.getCourse.useQuery(
    { courseId: selectedCourseId },
    { enabled: !!selectedCourseId && viewMode !== "browse" }
  );
  const quizzesQuery = trpc.adminContent.getQuizzes.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && (viewMode === "quiz-simulate" || viewMode === "edit-quiz"),
  });
  const examQuestionsQuery = trpc.adminContent.getMockExamQuestions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && (viewMode === "exam-simulate" || viewMode === "edit-exam"),
  });

  // Mutations
  const updateChapterMut = trpc.adminContent.updateChapterBlocks.useMutation({
    onSuccess: () => { toast.success("Chapitre mis à jour"); courseDetailQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateQuizMut = trpc.adminContent.updateQuizzes.useMutation({
    onSuccess: () => { toast.success("Quiz mis à jour"); quizzesQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateExamQMut = trpc.adminContent.updateMockExamQuestion.useMutation({
    onSuccess: () => { toast.success("Question mise à jour"); examQuestionsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteExamQMut = trpc.adminContent.deleteMockExamQuestion.useMutation({
    onSuccess: () => { toast.success("Question supprimée"); examQuestionsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const addExamQMut = trpc.adminContent.addMockExamQuestion.useMutation({
    onSuccess: () => { toast.success("Question ajoutée"); examQuestionsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateExerciseMut = trpc.adminContent.updateExercise.useMutation({
    onSuccess: () => { toast.success("Exercice mis à jour"); courseDetailQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const certifications = trainingIndex.certifications;

  // Filter courses by search
  const filteredCourses = useMemo(() => {
    if (!coursesQuery.data) return [];
    if (!searchQuery) return coursesQuery.data;
    const q = searchQuery.toLowerCase();
    return coursesQuery.data.filter(c =>
      c.title.toLowerCase().includes(q) || c.courseId.toLowerCase().includes(q)
    );
  }, [coursesQuery.data, searchQuery]);

  // Auth guard
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  // Get certification info for a courseId
  const getCertForCourse = (courseId: string) => {
    return certifications.find(c => c.courses.includes(courseId));
  };

  // ─── BROWSE VIEW ───
  const renderBrowse = () => (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un cours, quiz, exercice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Certifications overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map(cert => (
          <Card key={cert.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>{cert.icon}</span>
                <span className="truncate">{cert.title.fr}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{cert.courseCount} cours</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{cert.totalLessons} leçons</span>
                <span className="flex items-center gap-1"><PenTool className="w-3 h-3" />{cert.totalExercises} exercices</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  setSelectedCertId(cert.id);
                  setViewMode("exam-simulate");
                }}>
                  <Play className="w-3 h-3 mr-1" /> Simuler Examen
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  setSelectedCertId(cert.id);
                  setViewMode("edit-exam");
                }}>
                  <Edit3 className="w-3 h-3 mr-1" /> Éditer Examen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course list */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Tous les cours ({filteredCourses.length})
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Cours</th>
                <th className="text-left px-4 py-2 font-medium">Certification</th>
                <th className="text-center px-4 py-2 font-medium">Leçons</th>
                <th className="text-center px-4 py-2 font-medium">Exercices</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => {
                const cert = getCertForCourse(course.courseId);
                return (
                  <tr key={course.courseId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-900">{course.title}</span>
                      <br />
                      <span className="text-xs text-gray-400">{course.courseId}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {cert && <Badge variant="secondary" className="text-xs">{cert.icon} {cert.title.fr.split(" – ")[0]}</Badge>}
                    </td>
                    <td className="text-center px-4 py-2.5">{course.lessonsCount}</td>
                    <td className="text-center px-4 py-2.5">{course.exercisesCount}</td>
                    <td className="text-right px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                          setSelectedCourseId(course.courseId);
                          setSelectedLessonIdx(0);
                          setSelectedChapterIdx(0);
                          setViewMode("course");
                        }}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Consulter
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                          setSelectedCourseId(course.courseId);
                          setViewMode("quiz-simulate");
                        }}>
                          <Play className="w-3.5 h-3.5 mr-1" /> Quiz
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600" onClick={() => {
                          setSelectedCourseId(course.courseId);
                          setSelectedLessonIdx(0);
                          setSelectedChapterIdx(0);
                          setViewMode("edit-course");
                        }}>
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Éditer
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── COURSE VIEW (Consultation) ───
  const renderCourseView = () => {
    const course = courseDetailQuery.data;
    if (!course) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

    const lesson = course.lessons?.[selectedLessonIdx];
    const chapter = lesson?.chapters?.[selectedChapterIdx];

    return (
      <div className="flex gap-4">
        {/* Sidebar - Lessons/Chapters */}
        <div className="w-64 shrink-0 border rounded-lg p-3 max-h-[70vh] overflow-y-auto bg-white">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">Leçons</h4>
          {course.lessons?.map((l: any, li: number) => (
            <div key={li} className="mb-1">
              <button
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${li === selectedLessonIdx ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-gray-100 text-gray-600"}`}
                onClick={() => { setSelectedLessonIdx(li); setSelectedChapterIdx(0); }}
              >
                <span className="truncate block">{li + 1}. {l.title?.fr || l.title || `Leçon ${li + 1}`}</span>
              </button>
              {li === selectedLessonIdx && l.chapters?.map((ch: any, ci: number) => (
                <button
                  key={ci}
                  className={`w-full text-left text-xs px-4 py-1 rounded transition-colors ${ci === selectedChapterIdx ? "bg-emerald-100 text-emerald-800 font-medium" : "hover:bg-gray-50 text-gray-500"}`}
                  onClick={() => setSelectedChapterIdx(ci)}
                >
                  {ch.title?.fr || ch.title || `Chapitre ${ci + 1}`}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 border rounded-lg p-6 bg-white max-h-[70vh] overflow-y-auto">
          {chapter ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{chapter.title?.fr || chapter.title}</h3>
                <Badge variant="outline">{chapter.type || "content"}</Badge>
              </div>
              <div className="space-y-3">
                {chapter.blocks?.map((block: any, bi: number) => (
                  <div key={bi} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{block.type}</Badge>
                      {viewMode === "edit-course" && (
                        <Button size="sm" variant="ghost" className="h-5 px-1 text-blue-600" onClick={() => {
                          setEditingBlock({
                            lessonIdx: selectedLessonIdx,
                            chapterIdx: selectedChapterIdx,
                            blockIdx: bi,
                            content: typeof block.body === "string" ? block.body : JSON.stringify(block, null, 2),
                          });
                          setEditDialogOpen(true);
                        }}>
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {block.type === "content" && (
                      <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: block.body?.replace(/\n/g, "<br/>") || "" }} />
                    )}
                    {block.type === "video" && (
                      <div className="bg-gray-100 rounded p-3 text-sm">
                        <Play className="w-4 h-4 inline mr-1" /> Vidéo : {block.youtubeId || block.url || "ID non spécifié"}
                      </div>
                    )}
                    {block.type === "flip_cards" && (
                      <div className="bg-blue-50 rounded p-3 text-sm">
                        <Layers className="w-4 h-4 inline mr-1" /> Cartes interactives ({block.cards?.length || 0} cartes)
                      </div>
                    )}
                    {block.type === "checkpoint" && (
                      <div className="bg-amber-50 rounded p-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-amber-600" /> Point de contrôle
                      </div>
                    )}
                    {block.type === "transcript" && (
                      <div className="bg-purple-50 rounded p-3 text-sm text-purple-700 max-h-32 overflow-y-auto">
                        {block.body?.substring(0, 300)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Exercises for this lesson */}
              {course.exercises && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <PenTool className="w-4 h-4 text-emerald-600" /> Exercices de cette leçon
                  </h4>
                  {course.exercises
                    .map((ex: any, idx: number) => ({ ...ex, _idx: idx }))
                    .filter((ex: any) => {
                      const lessonId = lesson.id || `lesson_${selectedLessonIdx}`;
                      return ex.lessonId === lessonId || ex.lessonId === String(selectedLessonIdx);
                    })
                    .map((ex: any) => (
                      <div key={ex.id || ex._idx} className="border rounded p-3 mb-2 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{ex.title || `Exercice ${ex._idx + 1}`}</span>
                          <div className="flex gap-1">
                            {ex.difficulty && <Badge variant="outline" className="text-xs">{ex.difficulty}</Badge>}
                            {viewMode === "edit-course" && (
                              <Button size="sm" variant="ghost" className="h-5 px-1 text-blue-600" onClick={() => {
                                setEditingExamQ({ type: "exercise", idx: ex._idx, ...ex });
                                setEditDialogOpen(true);
                              }}>
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{ex.prompt?.substring(0, 200)}</p>
                        {ex.instructions && <p className="text-xs text-blue-600 mt-1">📋 {ex.instructions.substring(0, 150)}</p>}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Sélectionnez un chapitre dans la barre latérale.</p>
          )}
        </div>
      </div>
    );
  };

  // ─── QUIZ SIMULATION ───
  const renderQuizSimulate = () => {
    const quizData = quizzesQuery.data;
    if (!quizData) return <div className="text-center py-8 text-gray-500">Chargement des quiz...</div>;

    const courseQuizzes = quizData[selectedCourseId];
    if (!courseQuizzes) return <div className="text-center py-8 text-gray-500">Aucun quiz trouvé pour ce cours.</div>;

    const lessonKeys = Object.keys(courseQuizzes);
    const activeQuizKey = selectedQuizKey || lessonKeys[0] || "";
    const questions = courseQuizzes[activeQuizKey] || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={activeQuizKey} onValueChange={(v) => {
            setSelectedQuizKey(v);
            setQuizSimState({ currentQ: 0, answers: {}, showResults: false });
          }}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sélectionner un quiz" />
            </SelectTrigger>
            <SelectContent>
              {lessonKeys.map(k => (
                <SelectItem key={k} value={k}>Leçon {k.replace("_", " ch.")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge>{questions.length} questions</Badge>
        </div>

        {questions.length > 0 && !quizSimState.showResults && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">Question {quizSimState.currentQ + 1}/{questions.length}</Badge>
                <span className="text-xs text-gray-500">{Object.keys(quizSimState.answers).length} répondue(s)</span>
              </div>
              <p className="font-medium mb-4">{typeof questions[quizSimState.currentQ]?.question === "object" ? t(questions[quizSimState.currentQ]?.question) : questions[quizSimState.currentQ]?.question}</p>
              <div className="space-y-2">
                {questions[quizSimState.currentQ]?.choices?.map((choice: any) => (
                  <button
                    key={choice.id}
                    className={`w-full text-left p-3 rounded border transition-colors ${quizSimState.answers[quizSimState.currentQ] === choice.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                    onClick={() => setQuizSimState(prev => ({ ...prev, answers: { ...prev.answers, [prev.currentQ]: choice.id } }))}
                  >
                    {typeof choice.text === "object" ? t(choice.text) : choice.text}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" disabled={quizSimState.currentQ === 0} onClick={() => setQuizSimState(prev => ({ ...prev, currentQ: prev.currentQ - 1 }))}>
                  Précédent
                </Button>
                {quizSimState.currentQ < questions.length - 1 ? (
                  <Button onClick={() => setQuizSimState(prev => ({ ...prev, currentQ: prev.currentQ + 1 }))}>
                    Suivant
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setQuizSimState(prev => ({ ...prev, showResults: true }))}>
                    Terminer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {quizSimState.showResults && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4">Résultats de la simulation</h4>
              {questions.map((q: any, idx: number) => {
                const userAnswer = quizSimState.answers[idx];
                const isCorrect = userAnswer === q.correctId;
                return (
                  <div key={idx} className={`p-3 rounded mb-2 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{typeof q.question === "object" ? t(q.question) : q.question}</p>
                        <p className="text-xs text-gray-500 mt-1">Réponse correcte : {typeof q.choices?.find((c: any) => c.id === q.correctId)?.text === "object" ? t(q.choices?.find((c: any) => c.id === q.correctId)?.text) : q.choices?.find((c: any) => c.id === q.correctId)?.text}</p>
                        {q.explanation && <p className="text-xs text-blue-600 mt-1">💡 {typeof q.explanation === "object" ? t(q.explanation) : q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 flex items-center gap-3">
                <Badge className="bg-emerald-100 text-emerald-800">
                  Score : {questions.filter((q: any, i: number) => quizSimState.answers[i] === q.correctId).length}/{questions.length}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setQuizSimState({ currentQ: 0, answers: {}, showResults: false })}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Recommencer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ─── EXAM SIMULATION ───
  const renderExamSimulate = () => {
    const allQuestions = examQuestionsQuery.data as any[] | undefined;
    if (!allQuestions) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

    const certQuestions = allQuestions.filter((q: any) => q.certificationId === selectedCertId);
    // Take 30 random questions for simulation - use useMemo-like approach
    const activeExamQuestions = examQuestions.length > 0 ? examQuestions : (() => {
      const shuffled = [...certQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(30, shuffled.length));
      if (selected.length > 0 && examQuestions.length === 0) {
        setTimeout(() => setExamQuestions(selected), 0);
      }
      return selected;
    })();

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{certQuestions.length} questions disponibles</Badge>
          <Badge>{activeExamQuestions.length} questions sélectionnées</Badge>
        </div>

        {!quizSimState.showResults && activeExamQuestions.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">Question {quizSimState.currentQ + 1}/{activeExamQuestions.length}</Badge>
                <Badge variant="secondary">{typeof activeExamQuestions[quizSimState.currentQ]?.domain === "object" ? t(activeExamQuestions[quizSimState.currentQ]?.domain) : activeExamQuestions[quizSimState.currentQ]?.domain}</Badge>
              </div>
              <p className="font-medium mb-4">{typeof activeExamQuestions[quizSimState.currentQ]?.question === "object" ? t(activeExamQuestions[quizSimState.currentQ]?.question) : activeExamQuestions[quizSimState.currentQ]?.question}</p>
              <div className="space-y-2">
                {activeExamQuestions[quizSimState.currentQ]?.choices?.map((choice: any) => (
                  <button
                    key={choice.id}
                    className={`w-full text-left p-3 rounded border transition-colors ${quizSimState.answers[quizSimState.currentQ] === choice.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                    onClick={() => setQuizSimState(prev => ({ ...prev, answers: { ...prev.answers, [prev.currentQ]: choice.id } }))}
                  >
                    {typeof choice.text === "object" ? t(choice.text) : choice.text}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" disabled={quizSimState.currentQ === 0} onClick={() => setQuizSimState(prev => ({ ...prev, currentQ: prev.currentQ - 1 }))}>
                  Précédent
                </Button>
                {quizSimState.currentQ < activeExamQuestions.length - 1 ? (
                  <Button onClick={() => setQuizSimState(prev => ({ ...prev, currentQ: prev.currentQ + 1 }))}>
                    Suivant
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setQuizSimState(prev => ({ ...prev, showResults: true }))}>
                    Terminer l'examen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {quizSimState.showResults && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-2">Résultats de l'examen simulé</h4>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">
                  {activeExamQuestions.filter((q: any, i: number) => {
                    const correct = q.correctChoiceIds || [q.correctId];
                    return correct.includes(quizSimState.answers[i]);
                  }).length}/{activeExamQuestions.length}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setQuizSimState({ currentQ: 0, answers: {}, showResults: false })}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Recommencer
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {activeExamQuestions.map((q: any, idx: number) => {
                  const correct = q.correctChoiceIds || [q.correctId];
                  const isCorrect = correct.includes(quizSimState.answers[idx]);
                  return (
                    <div key={idx} className={`p-2 rounded text-sm ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                      <span className="font-medium">{idx + 1}.</span> {(typeof q.question === "object" ? t(q.question) : q.question).substring(0, 80)}...
                      {!isCorrect && <span className="text-red-600 ml-2">✗</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ─── EDIT EXAM QUESTIONS ───
  const renderEditExam = () => {
    const allQuestions = examQuestionsQuery.data as any[] | undefined;
    if (!allQuestions) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

    const certQuestions = allQuestions.filter((q: any) => q.certificationId === selectedCertId);
    const domains = Array.from(new Set(certQuestions.map((q: any) => typeof q.domain === "object" ? (q.domain.fr || q.domain.en || "") : q.domain)));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{certQuestions.length} questions</Badge>
            <Badge variant="secondary">{domains.length} domaines</Badge>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
            setEditingExamQ({
              isNew: true,
              certificationId: selectedCertId,
              domain: domains[0] || "",
              question: "",
              choices: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" }],
              correctChoiceIds: [],
              explanation: "",
            });
            setEditDialogOpen(true);
          }}>
            <Plus className="w-3 h-3 mr-1" /> Ajouter une question
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-12">#</th>
                <th className="text-left px-3 py-2 font-medium">Question</th>
                <th className="text-left px-3 py-2 font-medium w-32">Domaine</th>
                <th className="text-right px-3 py-2 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certQuestions.slice(0, 100).map((q: any, idx: number) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-3 py-2 truncate max-w-md">{typeof q.question === "object" ? t(q.question) : q.question}</td>
                  <td className="px-3 py-2"><Badge variant="secondary" className="text-xs">{typeof q.domain === "object" ? t(q.domain) : q.domain}</Badge></td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-6 px-1" onClick={() => {
                      setEditingExamQ(q);
                      setEditDialogOpen(true);
                    }}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-red-600" onClick={() => {
                      if (confirm("Supprimer cette question ?")) {
                        deleteExamQMut.mutate({ questionId: q.id });
                      }
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── EDIT QUIZ ───
  const renderEditQuiz = () => {
    const quizData = quizzesQuery.data;
    if (!quizData) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

    const courseQuizzes = quizData[selectedCourseId];
    if (!courseQuizzes) return <div className="text-center py-8 text-gray-500">Aucun quiz pour ce cours.</div>;

    const lessonKeys = Object.keys(courseQuizzes);

    return (
      <div className="space-y-4">
        {lessonKeys.map(key => {
          const questions = courseQuizzes[key];
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Leçon {key.replace("_", " ch.")}</span>
                  <Badge variant="outline">{questions.length} questions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {questions.map((q: any, qi: number) => (
                  <div key={qi} className="border-b last:border-0 py-2 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{typeof q.question === "object" ? t(q.question) : q.question}</p>
                      <p className="text-xs text-gray-400">Réponse : {typeof q.choices?.find((c: any) => c.id === q.correctId)?.text === "object" ? t(q.choices?.find((c: any) => c.id === q.correctId)?.text) : q.choices?.find((c: any) => c.id === q.correctId)?.text}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-1 shrink-0" onClick={() => {
                      setEditingQuiz({ courseId: selectedCourseId, lessonKey: key, questionIdx: qi, ...q });
                      setEditDialogOpen(true);
                    }}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ─── EDIT DIALOG ───
  const renderEditDialog = () => {
    if (editingBlock) {
      return (
        <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) { setEditDialogOpen(false); setEditingBlock(null); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Éditer le contenu du bloc</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editingBlock.content}
              onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
              rows={15}
              className="font-mono text-xs"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingBlock(null); }}>Annuler</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                const course = courseDetailQuery.data;
                if (!course) return;
                const blocks = [...(course.lessons[editingBlock.lessonIdx].chapters[editingBlock.chapterIdx].blocks || [])];
                try {
                  // Try to parse as JSON first
                  blocks[editingBlock.blockIdx] = JSON.parse(editingBlock.content);
                } catch {
                  // If not JSON, update the body field
                  blocks[editingBlock.blockIdx] = { ...blocks[editingBlock.blockIdx], body: editingBlock.content };
                }
                updateChapterMut.mutate({
                  courseId: selectedCourseId,
                  lessonIndex: editingBlock.lessonIdx,
                  chapterIndex: editingBlock.chapterIdx,
                  blocks,
                });
                setEditDialogOpen(false);
                setEditingBlock(null);
              }}>
                <Save className="w-3 h-3 mr-1" /> Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    if (editingExamQ) {
      const isExercise = editingExamQ.type === "exercise";
      if (isExercise) {
        return (
          <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) { setEditDialogOpen(false); setEditingExamQ(null); } }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Éditer l'exercice</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Titre</label>
                  <Input value={editingExamQ.title || ""} onChange={(e) => setEditingExamQ({ ...editingExamQ, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Prompt</label>
                  <Textarea value={editingExamQ.prompt || ""} onChange={(e) => setEditingExamQ({ ...editingExamQ, prompt: e.target.value })} rows={4} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Instructions</label>
                  <Textarea value={editingExamQ.instructions || ""} onChange={(e) => setEditingExamQ({ ...editingExamQ, instructions: e.target.value })} rows={3} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Correction</label>
                  <Textarea value={editingExamQ.correction || ""} onChange={(e) => setEditingExamQ({ ...editingExamQ, correction: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingExamQ(null); }}>Annuler</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  updateExerciseMut.mutate({
                    courseId: selectedCourseId,
                    exerciseIndex: editingExamQ.idx,
                    data: {
                      title: editingExamQ.title,
                      prompt: editingExamQ.prompt,
                      instructions: editingExamQ.instructions,
                      correction: editingExamQ.correction,
                    },
                  });
                  setEditDialogOpen(false);
                  setEditingExamQ(null);
                }}>
                  <Save className="w-3 h-3 mr-1" /> Sauvegarder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      }

      // Exam question edit
      return (
        <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) { setEditDialogOpen(false); setEditingExamQ(null); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExamQ.isNew ? "Ajouter une question" : "Éditer la question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Domaine</label>
                <Input value={typeof editingExamQ.domain === "object" ? (editingExamQ.domain.fr || editingExamQ.domain.en || "") : (editingExamQ.domain || "")} onChange={(e) => setEditingExamQ({ ...editingExamQ, domain: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Question</label>
                <Textarea value={typeof editingExamQ.question === "object" ? (editingExamQ.question.fr || editingExamQ.question.en || "") : (editingExamQ.question || "")} onChange={(e) => setEditingExamQ({ ...editingExamQ, question: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Choix</label>
                {editingExamQ.choices?.map((c: any, ci: number) => (
                  <div key={ci} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={(editingExamQ.correctChoiceIds || []).includes(c.id)}
                      onChange={(e) => {
                        const ids = [...(editingExamQ.correctChoiceIds || [])];
                        if (e.target.checked) ids.push(c.id);
                        else ids.splice(ids.indexOf(c.id), 1);
                        setEditingExamQ({ ...editingExamQ, correctChoiceIds: ids });
                      }}
                      className="w-4 h-4"
                    />
                    <Input
                      value={typeof c.text === "object" ? (c.text.fr || c.text.en || "") : c.text}
                      onChange={(e) => {
                        const choices = [...editingExamQ.choices];
                        choices[ci] = { ...choices[ci], text: e.target.value };
                        setEditingExamQ({ ...editingExamQ, choices });
                      }}
                      className="flex-1"
                      placeholder={`Choix ${c.id}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Explication</label>
                <Textarea value={typeof editingExamQ.explanation === "object" ? (editingExamQ.explanation.fr || editingExamQ.explanation.en || "") : (editingExamQ.explanation || "")} onChange={(e) => setEditingExamQ({ ...editingExamQ, explanation: e.target.value })} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingExamQ(null); }}>Annuler</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                if (editingExamQ.isNew) {
                  addExamQMut.mutate({
                    certificationId: editingExamQ.certificationId,
                    domain: editingExamQ.domain,
                    question: editingExamQ.question,
                    choices: editingExamQ.choices,
                    correctChoiceIds: editingExamQ.correctChoiceIds,
                    explanation: editingExamQ.explanation,
                  });
                } else {
                  updateExamQMut.mutate({
                    questionId: editingExamQ.id,
                    data: {
                      question: editingExamQ.question,
                      choices: editingExamQ.choices,
                      correctChoiceIds: editingExamQ.correctChoiceIds,
                      explanation: editingExamQ.explanation,
                      domain: editingExamQ.domain,
                    },
                  });
                }
                setEditDialogOpen(false);
                setEditingExamQ(null);
              }}>
                <Save className="w-3 h-3 mr-1" /> {editingExamQ.isNew ? "Ajouter" : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    if (editingQuiz) {
      return (
        <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) { setEditDialogOpen(false); setEditingQuiz(null); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Éditer la question de quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Question</label>
                <Textarea value={typeof editingQuiz.question === "object" ? (editingQuiz.question.fr || editingQuiz.question.en || "") : (editingQuiz.question || "")} onChange={(e) => setEditingQuiz({ ...editingQuiz, question: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Choix (cocher la bonne réponse)</label>
                {editingQuiz.choices?.map((c: any, ci: number) => (
                  <div key={ci} className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="correctQuiz"
                      checked={editingQuiz.correctId === c.id}
                      onChange={() => setEditingQuiz({ ...editingQuiz, correctId: c.id })}
                      className="w-4 h-4"
                    />
                    <Input
                      value={typeof c.text === "object" ? (c.text.fr || c.text.en || "") : c.text}
                      onChange={(e) => {
                        const choices = [...editingQuiz.choices];
                        choices[ci] = { ...choices[ci], text: e.target.value };
                        setEditingQuiz({ ...editingQuiz, choices });
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Explication</label>
                <Textarea value={typeof editingQuiz.explanation === "object" ? (editingQuiz.explanation.fr || editingQuiz.explanation.en || "") : (editingQuiz.explanation || "")} onChange={(e) => setEditingQuiz({ ...editingQuiz, explanation: e.target.value })} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingQuiz(null); }}>Annuler</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                const quizData = quizzesQuery.data;
                if (!quizData) return;
                const courseQuizzes = { ...quizData[editingQuiz.courseId] };
                const questions = [...courseQuizzes[editingQuiz.lessonKey]];
                questions[editingQuiz.questionIdx] = {
                  question: editingQuiz.question,
                  choices: editingQuiz.choices,
                  correctId: editingQuiz.correctId,
                  explanation: editingQuiz.explanation,
                };
                updateQuizMut.mutate({
                  courseId: editingQuiz.courseId,
                  lessonKey: editingQuiz.lessonKey,
                  questions,
                });
                setEditDialogOpen(false);
                setEditingQuiz(null);
              }}>
                <Save className="w-3 h-3 mr-1" /> Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  // ─── MAIN RENDER ───
  const getViewTitle = () => {
    switch (viewMode) {
      case "browse": return "Gestion du contenu pédagogique";
      case "course": return `Consultation : ${selectedCourseId}`;
      case "edit-course": return `Édition : ${selectedCourseId}`;
      case "quiz-simulate": return `Simulation Quiz : ${selectedCourseId}`;
      case "edit-quiz": return `Édition Quiz : ${selectedCourseId}`;
      case "exam-simulate": return `Simulation Examen : ${selectedCertId}`;
      case "edit-exam": return `Édition Examen : ${selectedCertId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Admin Navigation */}
      <AdminNavbar activePage="content" />

      {/* Content action bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end gap-2">
          {viewMode !== "browse" && (
            <Button variant="outline" size="sm" onClick={() => {
              setViewMode("browse");
              setQuizSimState({ currentQ: 0, answers: {}, showResults: false });
            }}>
              <ArrowLeft className="w-3 h-3 mr-1" /> Retour à la liste
            </Button>
          )}
          {(viewMode === "course") && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setViewMode("edit-course")}>
              <Edit3 className="w-3 h-3 mr-1" /> Passer en mode édition
            </Button>
          )}
          {(viewMode === "edit-course") && (
            <Button size="sm" variant="outline" onClick={() => setViewMode("course")}>
              <Eye className="w-3 h-3 mr-1" /> Mode consultation
            </Button>
          )}
          {viewMode === "quiz-simulate" && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setViewMode("edit-quiz")}>
              <Edit3 className="w-3 h-3 mr-1" /> Éditer les quiz
            </Button>
          )}
          {viewMode === "edit-quiz" && (
            <Button size="sm" variant="outline" onClick={() => { setViewMode("quiz-simulate"); setQuizSimState({ currentQ: 0, answers: {}, showResults: false }); }}>
              <Play className="w-3 h-3 mr-1" /> Simuler
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-xl font-bold mb-4">{getViewTitle()}</h2>

          {viewMode === "browse" && renderBrowse()}
          {(viewMode === "course" || viewMode === "edit-course") && renderCourseView()}
          {viewMode === "quiz-simulate" && renderQuizSimulate()}
          {viewMode === "edit-quiz" && renderEditQuiz()}
          {viewMode === "exam-simulate" && renderExamSimulate()}
          {viewMode === "edit-exam" && renderEditExam()}
        </motion.div>
      </main>

      {/* Edit Dialog */}
      {renderEditDialog()}
    </div>
  );
}
