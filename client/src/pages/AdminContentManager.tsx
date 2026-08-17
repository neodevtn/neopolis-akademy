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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, BookOpen, FileText, HelpCircle, Play, Edit3, Eye,
  ChevronRight, Search, GraduationCap, CheckCircle2, XCircle,
  Braces, ImagePlus, Plus, Trash2, Save, RefreshCw, Layers, PenTool, Download, Video, PlayCircle as PlayCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import trainingIndex from "@/data/trainingIndex.json";
import { AdminNavbar } from "@/components/AdminNavbar";

import { BlockLibrary } from "@/components/admin/BlockLibrary";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { ChapterSourceEditor } from "@/components/admin/ChapterSourceEditor";
import { QuestionBankPanel } from "@/components/admin/QuestionBankPanel";
import { CheckpointSettings } from "@/components/admin/CheckpointSettings";
import { ExamBankSettings } from "@/components/admin/ExamBankSettings";
import { LessonRecommendationEditor, normalizeYouTubeId } from "@/components/admin/LessonRecommendationEditor";
import { LegacyExerciseEditor } from "@/components/admin/LegacyExerciseEditor";
import { cloneCourseDraft } from "@shared/contentStudio";
import { normalizeQuestionBank, serializeQuestionBank } from "@shared/questionBank";
import { normalizeExamConfiguration, type ExamConfiguration } from "@shared/examConfiguration";
import { toBlockMediaUrl } from "@/lib/mediaUrl";
import { getExercisesForSelectedChapter } from "@/lib/exerciseEditor";
const LOGO_URL = "/api/assets/logo_neopolis_akademy_9c9a0823.png";

type ViewMode = "browse" | "course" | "quiz-simulate" | "exam-simulate" | "edit-course" | "edit-quiz" | "edit-exam";

export default function AdminContentManager() {
  const { user, isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  // Helper to resolve body which can be string or {en, fr} translation object
  const resolveBody = (body: any): string => {
    if (!body) return '';
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null) return body[lang] || body.en || body.fr || JSON.stringify(body);
    return String(body);
  };
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const requested = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("mode") : null;
    return requested === "edit" ? "edit-course" : requested === "view" ? "course" : requested === "quiz" ? "edit-quiz" : requested === "quiz-simulate" ? "quiz-simulate" : "browse";
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("courseId") || "" : "",
  );
  const [selectedCertId, setSelectedCertId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(() => {
    if (typeof window === "undefined") return 0;
    const requested = Number(new URLSearchParams(window.location.search).get("lesson"));
    return Number.isInteger(requested) && requested >= 0 ? requested : 0;
  });
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(() => {
    if (typeof window === "undefined") return 0;
    const params = new URLSearchParams(window.location.search);
    if (params.get("panel") === "recommendations") return -1;
    const requested = Number(params.get("chapter"));
    return Number.isInteger(requested) && requested >= 0 ? requested : 0;
  });
  const [courseDraft, setCourseDraft] = useState<any | null>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ blockIndex: number; fieldKey: string } | null>(null);
  const [recommendationMediaLessonIdx, setRecommendationMediaLessonIdx] = useState<number | null>(null);
  const [sourceEditorOpen, setSourceEditorOpen] = useState(false);
  const [quizSimState, setQuizSimState] = useState<{ currentQ: number; answers: Record<number, string>; showResults: boolean }>({ currentQ: 0, answers: {}, showResults: false });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{ lessonIdx: number; chapterIdx: number; blockIdx: number; content: string } | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [editingExamQ, setEditingExamQ] = useState<any>(null);
  const [editingLegacyExercise, setEditingLegacyExercise] = useState<any>(null);
  const [editLang, setEditLang] = useState<"en" | "fr">("en");

  // Helpers for bilingual editing
  const getI18n = (field: any, l: "en" | "fr"): string => {
    if (!field) return '';
    if (typeof field === 'string') return l === 'en' ? field : ''; // strings are treated as EN
    if (typeof field === 'object') return field[l] || '';
    return String(field);
  };
  const setI18n = (field: any, l: "en" | "fr", value: string): Record<string, string> => {
    if (!field || typeof field === 'string') {
      // Convert string to bilingual object
      const obj = { en: field || '', fr: '' };
      obj[l] = value;
      return obj;
    }
    return { ...field, [l]: value };
  };
  const [selectedQuizKey, setSelectedQuizKey] = useState("");
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examConfigDrafts, setExamConfigDrafts] = useState<Record<string, ExamConfiguration>>({});

  // Queries
  const coursesQuery = trpc.adminContent.listCourses.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const courseDetailQuery = trpc.adminContent.getCourse.useQuery(
    { courseId: selectedCourseId },
    { enabled: !!selectedCourseId && viewMode !== "browse" }
  );
  const globalMediaQuery = trpc.adminContent.listMediaAssets.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && viewMode === "edit-course",
  });
  const quizzesQuery = trpc.adminContent.getQuizzes.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && (viewMode === "quiz-simulate" || viewMode === "edit-quiz"),
  });
  const examQuestionsQuery = trpc.adminContent.getMockExamQuestions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && (viewMode === "exam-simulate" || viewMode === "edit-exam"),
  });
  const examConfigurationsQuery = trpc.adminContent.getExamConfigurations.useQuery(undefined, {
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
  const updateExamConfigurationMut = trpc.adminContent.updateExamConfiguration.useMutation({
    onSuccess: () => { toast.success("Règles d’examen sauvegardées"); examConfigurationsQuery.refetch(); setExamQuestions([]); },
    onError: (e) => toast.error(e.message),
  });
  const updateExerciseMut = trpc.adminContent.updateExercise.useMutation({
    onSuccess: () => { toast.success("Exercice mis à jour"); courseDetailQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const validateCourseDraftMut = trpc.adminContent.validateCourseDraft.useMutation();
  const saveCourseDraftMut = trpc.adminContent.saveCourseDraft.useMutation({
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.validation.errors[0]?.message || "Le brouillon contient des erreurs.");
        return;
      }
      setCourseDraft(null);
      toast.success("Cours sauvegardé après validation.");
      courseDetailQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
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

  const getCertIdForCourse = (courseId: string) => {
    const courseMeta = (trainingIndex.courses as any[]).find((course) => course.id === courseId);
    return courseMeta?.certId || getCertForCourse(courseId)?.id || null;
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
                {cert.totalVideos > 0 && <span className="flex items-center gap-1"><PlayCircleIcon className="w-3 h-3" />{cert.totalVideos} vidéos</span>}
                {(cert as any).totalDownloads > 0 && <span className="flex items-center gap-1"><Download className="w-3 h-3" />{(cert as any).totalDownloads} téléchargements</span>}
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
                          setCourseDraft(null);
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
                          setCourseDraft(null);
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
    const publishedCourse = courseDetailQuery.data;
    const course = courseDraft || publishedCourse;
    if (courseDetailQuery.isLoading) return <div className="text-center py-8 text-gray-500">Chargement du cours…</div>;
    if (courseDetailQuery.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center">
            <p className="font-medium text-red-800">Impossible de charger ce cours.</p>
            <p className="mt-1 text-sm text-red-700">{courseDetailQuery.error.message}</p>
            <Button className="mt-4" variant="outline" onClick={() => courseDetailQuery.refetch()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Réessayer</Button>
          </CardContent>
        </Card>
      );
    }
    if (!course) return <div className="text-center py-8 text-gray-500">Aucun contenu disponible pour ce cours.</div>;

    const lesson = course.lessons?.[selectedLessonIdx];
    const chapter = lesson?.chapters?.[selectedChapterIdx];
    const mediaAssets = globalMediaQuery.data || [];
    const certId = getCertIdForCourse(selectedCourseId);
    const learnerPreviewHref = certId ? `/training/${certId}/${selectedCourseId}` : null;
    const makeDraftWithChapter = (nextChapter: any) => {
      const draft = cloneCourseDraft(courseDraft || publishedCourse);
      draft.lessons[selectedLessonIdx].chapters[selectedChapterIdx] = nextChapter;
      return draft;
    };
    const updateDraftBlocks = (blocks: any[]) => {
      if (!chapter) return;
      setCourseDraft(makeDraftWithChapter({ ...chapter, blocks }));
    };
    const updateLessonRecommendations = (recommendedVideos: any[]) => {
      const draft = cloneCourseDraft(courseDraft || publishedCourse);
      draft.lessons[selectedLessonIdx] = { ...draft.lessons[selectedLessonIdx], recommendedVideos };
      setCourseDraft(draft);
    };
    const currentChapterExercises = getExercisesForSelectedChapter({
      exercises: course.exercises,
      lesson,
      lessonIndex: selectedLessonIdx,
      chapterId: chapter?.id,
      chapterIndex: selectedChapterIdx,
    });
    const saveDraft = () => {
      const draft = courseDraft || cloneCourseDraft(publishedCourse);
      saveCourseDraftMut.mutate({ courseId: selectedCourseId, data: draft });
    };

    return (
      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Sidebar - Lessons/Chapters */}
        <div className="w-full shrink-0 border rounded-lg p-3 max-h-64 overflow-y-auto bg-white xl:w-64 xl:max-h-[70vh]">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">Leçons</h4>
          {course.lessons?.map((l: any, li: number) => (
            <div key={li} className="mb-1">
              <button
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${li === selectedLessonIdx ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-gray-100 text-gray-600"}`}
                onClick={() => { setSelectedLessonIdx(li); setSelectedChapterIdx(0); }}
              >
                <span className="truncate block">{li + 1}. {typeof l.title === 'string' ? l.title : (l.title?.fr || l.title?.en || `Leçon ${li + 1}`)}</span>
              </button>
              {li === selectedLessonIdx && l.chapters?.map((ch: any, ci: number) => (
                <button
                  key={ci}
                  className={`w-full text-left text-xs px-4 py-1 rounded transition-colors ${ci === selectedChapterIdx ? "bg-emerald-100 text-emerald-800 font-medium" : "hover:bg-gray-50 text-gray-500"}`}
                  onClick={() => setSelectedChapterIdx(ci)}
                >
                  {typeof ch.title === 'string' ? ch.title : (ch.title?.fr || ch.title?.en || `Chapitre ${ci + 1}`)}
                </button>
              ))}
              {li === selectedLessonIdx && viewMode === "edit-course" && (
                <button
                  className={`mt-1 flex w-full items-center gap-1.5 rounded px-4 py-1.5 text-left text-xs font-medium transition-colors ${selectedChapterIdx === -1 ? "bg-amber-100 text-amber-900" : "text-amber-700 hover:bg-amber-50"}`}
                  onClick={() => setSelectedChapterIdx(-1)}
                >
                  <Video className="h-3.5 w-3.5" /> Fin de module · recommandations
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 border rounded-lg p-4 bg-white max-h-[70vh] overflow-y-auto sm:p-6">
          {viewMode === "edit-course" && lesson && selectedChapterIdx === -1 ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 border-b border-amber-200 pb-4">
                <div className="flex items-center gap-2 text-amber-700"><Video className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.12em]">Paramètres de la leçon</span></div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">Vidéos recommandées de fin de module</h3>
                <p className="mt-1 text-sm text-muted-foreground">Cette sélection est unique pour la leçon. Elle s’affiche à l’apprenant seulement après le dernier chapitre ou exercice du module.</p>
              </div>
              <LessonRecommendationEditor
                videos={Array.isArray(lesson.recommendedVideos) ? lesson.recommendedVideos : []}
                onChange={updateLessonRecommendations}
                onRequestMedia={() => { setRecommendationMediaLessonIdx(selectedLessonIdx); setMediaLibraryOpen(true); }}
              />
            </div>
          ) : chapter ? (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{typeof chapter.title === 'string' ? chapter.title : (chapter.title?.fr || chapter.title?.en || 'Chapitre')}</h3>
                  {viewMode === "edit-course" && <p className="mt-1 text-xs text-muted-foreground">Brouillon local : les modifications ne sont pas publiées avant la sauvegarde.</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <Badge variant="outline">{chapter.type || "content"}</Badge>
                  {viewMode === "edit-course" && <>
                    <Button size="sm" variant="outline" onClick={() => setSourceEditorOpen(true)}><Braces className="mr-1 h-3.5 w-3.5" /> Mode avancé</Button>
                    <Button size="sm" variant="outline" disabled={!courseDraft || saveCourseDraftMut.isPending} onClick={() => setCourseDraft(null)}>Annuler</Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={!courseDraft || saveCourseDraftMut.isPending} onClick={saveDraft}><Save className="mr-1 h-3.5 w-3.5" /> {saveCourseDraftMut.isPending ? "Sauvegarde…" : "Sauvegarder"}</Button>
                  </>}
                  {viewMode === "course" && learnerPreviewHref && (
                    <a
                      href={learnerPreviewHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> Aperçu apprenant
                    </a>
                  )}
                </div>
              </div>
              {viewMode === "edit-course" && chapter.type === "checkpoint" && (
                <CheckpointSettings chapter={chapter} onChange={(nextChapter) => setCourseDraft(makeDraftWithChapter(nextChapter))} />
              )}
              {viewMode === "edit-course" ? (
                <BlockLibrary
                  blocks={chapter.blocks || []}
                  onChange={updateDraftBlocks}
                  lang={lang}
                  t={t}
                  onRequestMedia={(target) => { setMediaTarget(target); setMediaLibraryOpen(true); }}
                />
              ) : (
              <div className="space-y-3">
                {chapter.blocks?.map((block: any, bi: number) => (
                  <div key={bi} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{block.type}</Badge>
                    </div>
                    {block.type === "content" && (
                      <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: resolveBody(block.body).replace(/\n/g, "<br/>") }} />
                    )}
                    {block.type === "video" && (
                      <div className="rounded border bg-gray-50 p-3 text-sm">
                        {block.youtubeId ? (
                          <iframe
                            className="aspect-video w-full rounded"
                            src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
                            title={resolveBody(block.title) || "Vidéo du cours"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : block.mp4Url || block.videoUrl || block.url ? (
                          <video className="w-full rounded" controls preload="metadata">
                            <source src={block.mp4Url || block.videoUrl || block.url} />
                            Votre navigateur ne prend pas en charge la lecture vidéo.
                          </video>
                        ) : block.audioUrl ? (
                          <audio className="w-full" controls preload="metadata">
                            <source src={block.audioUrl} />
                            Votre navigateur ne prend pas en charge la lecture audio.
                          </audio>
                        ) : (
                          <p className="text-amber-700">Média non renseigné pour ce bloc vidéo.</p>
                        )}
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
                        {resolveBody(block.body).substring(0, 300)}...
                      </div>
                    )}
                    {block.type === "text" && (
                      <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: resolveBody(block.content).replace(/\n/g, "<br/>") }} />
                    )}
                    {block.type === "single_choice_exercise" && (
                      <div className="bg-indigo-50 rounded p-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-indigo-600" /> QCM : {resolveBody(block.question)}
                        <div className="ml-5 mt-1 text-xs text-gray-500">{block.options?.length || 0} options</div>
                      </div>
                    )}
                    {block.type === "bucket_sort" && (
                      <div className="bg-orange-50 rounded p-3 text-sm">
                        <Layers className="w-4 h-4 inline mr-1 text-orange-600" /> Tri par catégories : {resolveBody(block.title)}
                      </div>
                    )}
                    {block.type === "comparison" && (
                      <div className="bg-cyan-50 rounded p-3 text-sm">
                        <Layers className="w-4 h-4 inline mr-1 text-cyan-600" /> Comparaison ({block.items?.length || 0} éléments)
                      </div>
                    )}
                    {block.type === "tabbed_content" && (
                      <div className="bg-teal-50 rounded p-3 text-sm">
                        <Layers className="w-4 h-4 inline mr-1 text-teal-600" /> Contenu à onglets ({block.tabs?.length || 0} onglets)
                      </div>
                    )}
                    {block.type === "download" && (
                      <div className="bg-green-50 rounded p-3 text-sm">
                        <FileText className="w-4 h-4 inline mr-1 text-green-600" /> Téléchargement : {typeof block.title === 'string' ? block.title : (block.title?.fr || block.title?.en || block.filename || "fichier")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* Exercises linked to the selected chapter */}
              {course.exercises && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <PenTool className="w-4 h-4 text-emerald-600" /> Exercices de cet écran
                  </h4>
                  <p className="mb-3 text-xs text-muted-foreground">Seuls les exercices rattachés au chapitre ouvert sont affichés. Le contexte, la consigne et la correction restent séparés.</p>
                  {currentChapterExercises.length === 0 ? <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-muted-foreground">Aucun exercice complémentaire n’est rattaché à cet écran.</div> : currentChapterExercises.map((ex: any) => <div key={ex.id || ex._idx} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">{ex.interactionType === "free_text" ? "Réponse libre" : ex.interactionType || "Exercice"}</p><h5 className="mt-1 text-sm font-semibold text-slate-900">{resolveBody(ex.title) || `Exercice ${ex._idx + 1}`}</h5></div>
                        <div className="flex shrink-0 items-center gap-2">{ex.difficulty && <Badge variant="outline" className="text-xs">{ex.difficulty}</Badge>}{viewMode === "edit-course" && <Button size="sm" variant="outline" className="h-8 gap-1.5 text-blue-700" onClick={() => setEditingLegacyExercise(ex)}><Edit3 className="h-3.5 w-3.5" /> Modifier</Button>}</div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-3"><p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Contexte pédagogique</p><p className="line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-700">{resolveBody(ex.prompt) || "Aucun contexte renseigné."}</p></div>
                        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3"><p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">Consigne pour l’apprenant</p><p className="line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-700">{resolveBody(ex.instructions) || "Aucune consigne renseignée."}</p></div>
                      </div>
                    </div>)}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Sélectionnez un chapitre dans la barre latérale.</p>
          )}
        </div>
        {viewMode === "edit-course" && chapter && (
          <>
            <MediaLibrary
              assets={mediaAssets}
              open={mediaLibraryOpen}
              onOpenChange={setMediaLibraryOpen}
              onSelect={(asset) => {
                if (recommendationMediaLessonIdx !== null) {
                  if (asset.kind !== "youtube") {
                    toast.error("Sélectionnez une vidéo YouTube pour une recommandation de fin de module.");
                    return;
                  }
                  const videoId = normalizeYouTubeId(asset.url);
                  if (!videoId || videoId.length < 6) {
                    toast.error("Cette ressource ne contient pas un identifiant YouTube utilisable.");
                    return;
                  }
                  const draft = cloneCourseDraft(courseDraft || publishedCourse);
                  const current = Array.isArray(draft.lessons[recommendationMediaLessonIdx].recommendedVideos) ? draft.lessons[recommendationMediaLessonIdx].recommendedVideos : [];
                  if (current.some((video: any) => video.videoId === videoId)) {
                    toast.info("Cette vidéo est déjà recommandée dans ce module.");
                  } else {
                    draft.lessons[recommendationMediaLessonIdx].recommendedVideos = [...current, { videoId, title: asset.title, channel: "", type: "complementary", topics: [] }];
                    setCourseDraft(draft);
                  }
                  setRecommendationMediaLessonIdx(null);
                  return;
                }
                if (!mediaTarget) return;
                const blocks = [...(chapter.blocks || [])];
                blocks[mediaTarget.blockIndex] = { ...blocks[mediaTarget.blockIndex], [mediaTarget.fieldKey]: toBlockMediaUrl(asset.url, asset.kind, mediaTarget.fieldKey) };
                updateDraftBlocks(blocks);
                setMediaTarget(null);
              }}
            />
            <ChapterSourceEditor
              chapter={chapter}
              open={sourceEditorOpen}
              onOpenChange={setSourceEditorOpen}
              validate={async (candidateChapter) => {
                const candidateCourse = makeDraftWithChapter(candidateChapter);
                return validateCourseDraftMut.mutateAsync({ data: candidateCourse });
              }}
              onApply={(candidateChapter) => setCourseDraft(makeDraftWithChapter(candidateChapter))}
            />
          </>
        )}
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
    const storedConfig = normalizeExamConfiguration((examConfigurationsQuery.data as Record<string, Partial<ExamConfiguration>> | undefined)?.[selectedCertId], certQuestions.length);
    const examConfig = examConfigDrafts[selectedCertId] || storedConfig;
    // Select the configured subset once per simulation attempt.
    const activeExamQuestions = examQuestions.length > 0 ? examQuestions : (() => {
      const source = examConfig.shuffleQuestions ? [...certQuestions].sort(() => Math.random() - 0.5) : [...certQuestions];
      const selected = source.slice(0, Math.min(examConfig.questionCount, source.length)).map((question: any) => {
        if (!examConfig.shuffleChoices) return question;
        return { ...question, choices: [...(question.choices || [])].sort(() => Math.random() - 0.5) };
      });
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
          <Badge variant="secondary">Seuil : {examConfig.passingScore}%</Badge>
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
    const storedConfig = normalizeExamConfiguration((examConfigurationsQuery.data as Record<string, Partial<ExamConfiguration>> | undefined)?.[selectedCertId], certQuestions.length);
    const examConfig = examConfigDrafts[selectedCertId] || storedConfig;

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

        <ExamBankSettings
          configuration={examConfig}
          availableQuestions={certQuestions.length}
          isSaving={updateExamConfigurationMut.isPending}
          onChange={(configuration) => setExamConfigDrafts((current) => ({ ...current, [selectedCertId]: configuration }))}
          onSave={() => updateExamConfigurationMut.mutate({ certificationId: selectedCertId, configuration: normalizeExamConfiguration(examConfig, certQuestions.length) })}
        />

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
          const rawBank = courseQuizzes[key];
          const questionBank = normalizeQuestionBank(rawBank);
          const questions = questionBank.questions;
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Leçon {key.replace("_", " ch.")}</span>
                  <Badge variant="outline">{questions.length} questions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <QuestionBankPanel
                  rawBank={rawBank}
                  onSave={(bank) => updateQuizMut.mutate({
                    courseId: selectedCourseId,
                    lessonKey: key,
                    questions: serializeQuestionBank(bank),
                  })}
                  onAddQuestion={() => {
                    setEditingQuiz({
                      isNew: true,
                      courseId: selectedCourseId,
                      lessonKey: key,
                      question: { en: "", fr: "" },
                      choices: [{ id: "a", text: { en: "", fr: "" } }, { id: "b", text: { en: "", fr: "" } }, { id: "c", text: { en: "", fr: "" } }, { id: "d", text: { en: "", fr: "" } }],
                      correctId: "a",
                      explanation: { en: "", fr: "" },
                    });
                    setEditDialogOpen(true);
                  }}
                />
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
    if (editingLegacyExercise) {
      return <LegacyExerciseEditor
        exercise={editingLegacyExercise}
        onClose={() => setEditingLegacyExercise(null)}
        onSave={(data) => {
          updateExerciseMut.mutate({
            courseId: selectedCourseId,
            exerciseIndex: editingLegacyExercise._idx,
            data: {
              title: data.title,
              prompt: data.prompt,
              instructions: data.instructions,
              correction: data.correction,
              rubric: data.rubric,
              difficulty: data.difficulty,
              interactionType: data.interactionType,
              inputSchema: data.inputSchema,
              options: data.options,
            },
          });
          setEditingLegacyExercise(null);
        }}
      />;
    }
    if (editingBlock) {
      const eb = editingBlock as any;
      return (
        <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) { setEditDialogOpen(false); setEditingBlock(null); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Éditer le contenu du bloc</DialogTitle>
            </DialogHeader>
            {eb.isI18nBody ? (
              <Tabs value={editLang} onValueChange={(v) => setEditLang(v as "en" | "fr")} className="w-full">
                <TabsList className="mb-3">
                  <TabsTrigger value="en">🇬🇧 English (default)</TabsTrigger>
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                </TabsList>
                <TabsContent value="en">
                  <Textarea
                    value={eb.bodyEn || ""}
                    onChange={(e) => setEditingBlock({ ...eb, bodyEn: e.target.value } as any)}
                    rows={15}
                    className="font-mono text-xs"
                    placeholder="English content (default)"
                  />
                </TabsContent>
                <TabsContent value="fr">
                  <Textarea
                    value={eb.bodyFr || ""}
                    onChange={(e) => setEditingBlock({ ...eb, bodyFr: e.target.value } as any)}
                    rows={15}
                    className="font-mono text-xs"
                    placeholder="Contenu français (optionnel)"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Textarea
                value={editingBlock.content}
                onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                rows={15}
                className="font-mono text-xs"
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingBlock(null); }}>Annuler</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                const course = courseDetailQuery.data;
                if (!course) return;
                const blocks = [...(course.lessons[editingBlock.lessonIdx].chapters[editingBlock.chapterIdx].blocks || [])];
                if (eb.isI18nBody) {
                  // Save as bilingual object
                  blocks[editingBlock.blockIdx] = { ...blocks[editingBlock.blockIdx], body: { en: eb.bodyEn || "", fr: eb.bodyFr || "" } };
                } else {
                  try {
                    blocks[editingBlock.blockIdx] = JSON.parse(editingBlock.content);
                  } catch {
                    blocks[editingBlock.blockIdx] = { ...blocks[editingBlock.blockIdx], body: editingBlock.content };
                  }
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
              <Tabs value={editLang} onValueChange={(v) => setEditLang(v as "en" | "fr")} className="w-full">
                <TabsList className="mb-3">
                  <TabsTrigger value="en">🇬🇧 English (default)</TabsTrigger>
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                </TabsList>
                <TabsContent value={editLang} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Titre ({editLang.toUpperCase()})</label>
                    <Input value={getI18n(editingExamQ.title, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, title: setI18n(editingExamQ.title, editLang, e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Contexte pédagogique ({editLang.toUpperCase()})</label>
                    <Textarea value={getI18n(editingExamQ.prompt, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, prompt: setI18n(editingExamQ.prompt, editLang, e.target.value) })} rows={4} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Consigne pour l’apprenant ({editLang.toUpperCase()})</label>
                    <Textarea value={getI18n(editingExamQ.instructions, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, instructions: setI18n(editingExamQ.instructions, editLang, e.target.value) })} rows={3} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Correction ({editLang.toUpperCase()})</label>
                    <Textarea value={getI18n(editingExamQ.correction, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, correction: setI18n(editingExamQ.correction, editLang, e.target.value) })} rows={3} />
                  </div>
                </TabsContent>
              </Tabs>
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
            <Tabs value={editLang} onValueChange={(v) => setEditLang(v as "en" | "fr")} className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="en">🇬🇧 English (default)</TabsTrigger>
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
              </TabsList>
              <TabsContent value={editLang} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Domaine ({editLang.toUpperCase()})</label>
                  <Input value={getI18n(editingExamQ.domain, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, domain: setI18n(editingExamQ.domain, editLang, e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Question ({editLang.toUpperCase()})</label>
                  <Textarea value={getI18n(editingExamQ.question, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, question: setI18n(editingExamQ.question, editLang, e.target.value) })} rows={3} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Choix ({editLang.toUpperCase()})</label>
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
                        value={getI18n(c.text, editLang)}
                        onChange={(e) => {
                          const choices = [...editingExamQ.choices];
                          choices[ci] = { ...choices[ci], text: setI18n(c.text, editLang, e.target.value) };
                          setEditingExamQ({ ...editingExamQ, choices });
                        }}
                        className="flex-1"
                        placeholder={`Choix ${c.id}`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Explication ({editLang.toUpperCase()})</label>
                  <Textarea value={getI18n(editingExamQ.explanation, editLang)} onChange={(e) => setEditingExamQ({ ...editingExamQ, explanation: setI18n(editingExamQ.explanation, editLang, e.target.value) })} rows={2} />
                </div>
              </TabsContent>
            </Tabs>
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
            <Tabs value={editLang} onValueChange={(v) => setEditLang(v as "en" | "fr")} className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="en">🇬🇧 English (default)</TabsTrigger>
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
              </TabsList>
              <TabsContent value={editLang} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Question ({editLang.toUpperCase()})</label>
                  <Textarea value={getI18n(editingQuiz.question, editLang)} onChange={(e) => setEditingQuiz({ ...editingQuiz, question: setI18n(editingQuiz.question, editLang, e.target.value) })} rows={3} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Choix ({editLang.toUpperCase()}) — cocher la bonne réponse</label>
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
                        value={getI18n(c.text, editLang)}
                        onChange={(e) => {
                          const choices = [...editingQuiz.choices];
                          choices[ci] = { ...choices[ci], text: setI18n(c.text, editLang, e.target.value) };
                          setEditingQuiz({ ...editingQuiz, choices });
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Explication ({editLang.toUpperCase()})</label>
                  <Textarea value={getI18n(editingQuiz.explanation, editLang)} onChange={(e) => setEditingQuiz({ ...editingQuiz, explanation: setI18n(editingQuiz.explanation, editLang, e.target.value) })} rows={2} />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingQuiz(null); }}>Annuler</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                const quizData = quizzesQuery.data;
                if (!quizData) return;
                const courseQuizzes = { ...quizData[editingQuiz.courseId] };
                const bank = normalizeQuestionBank(courseQuizzes[editingQuiz.lessonKey] || []);
                const nextQuestion = {
                  question: editingQuiz.question,
                  choices: editingQuiz.choices,
                  correctId: editingQuiz.correctId,
                  explanation: editingQuiz.explanation,
                };
                const questions = editingQuiz.isNew
                  ? [...bank.questions, nextQuestion]
                  : bank.questions.map((question: any, index: number) => index === editingQuiz.questionIdx ? nextQuestion : question);
                updateQuizMut.mutate({
                  courseId: editingQuiz.courseId,
                  lessonKey: editingQuiz.lessonKey,
                  questions: serializeQuestionBank({ ...bank, questions }),
                });
                setEditDialogOpen(false);
                setEditingQuiz(null);
              }}>
                <Save className="w-3 h-3 mr-1" /> {editingQuiz.isNew ? "Ajouter" : "Sauvegarder"}
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
