
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Video, Download, Timer, Eye, FileText, ChevronDown, ArrowUp, Pencil } from "lucide-react";
import { MatchingExercise } from "@/components/MatchingExercise";
import { SingleChoiceExercise } from "@/components/SingleChoiceExercise";
import { ChapterQuiz } from "@/components/ChapterQuiz";
import { VideoRecommendations } from "@/components/VideoRecommendations";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { trpc } from "@/lib/trpc";
import { resolveI18n } from "./contentDetectors";
import { getPersistedCompletionProgress, hasOptionalSupplementaryVideos } from "./chapterProgress";
import { ExerciseRenderer } from "@/components/ExerciseRenderer";
import { FlipCardsGrid } from "@/components/FlipCard";
import { TabbedContent } from "@/components/TabbedContent";
import { ComparisonBox } from "@/components/ComparisonBox";
import { CourseIllustration } from "@/components/CourseIllustration";
import PageContent from "./PageContent";
import { CloudExerciseBlock } from "@/components/CloudExerciseBlock";
import { ProjectorPlayer } from "@/components/ProjectorPlayer";
import { CalloutBlock } from "@/components/blocks/CalloutBlock";
import { MatchingBlock } from "@/components/blocks/MatchingBlock";
import { FillBlankBlock } from "@/components/blocks/FillBlankBlock";
import { TerminalSimBlock } from "@/components/blocks/TerminalSimBlock";
import { CodeReplBlock } from "@/components/blocks/CodeReplBlock";
import { OrderingBlock } from "@/components/blocks/OrderingBlock";
import { AiEvaluationBlock } from "@/components/blocks/AiEvaluationBlock";
import { MultiChoiceBlock } from "@/components/blocks/MultiChoiceBlock";
import { NovasavoLearningBlock } from "@/components/blocks/NovasavoLearningBlocks";
import { BlockCustomizationFrame } from "@/components/blocks/BlockCustomizationFrame";
import { ComparisonPanelBlock, KnowledgeCheckBlock, LearningProgressBlock, LearningSectionBlock, LearningToolsBlock, SequenceVisualBlock } from "@/components/blocks/GenericLearningBlocks";
import LessonQuiz from "./LessonQuiz";
import NumericAnswerExercise from "@/components/NumericAnswerExercise";
import { useAuth } from "@/_core/hooks/useAuth";
import { getContextualCourseEditorHref } from "@/lib/courseEditorLink";
import { isEvaluationGateLocked, requiredCorrectAnswers } from "@shared/evaluationRules";

export default function LessonViewer({
  lesson,
  lessonIndex,
  lang,
  t,
  certId,
  courseId,
  onComplete,
  matchedVideos: _matchedVideos,
  completedVideos,
  toggleVideoComplete,
  isReviewMode = false,
  courseExercises = [],
  onChapterChange,
  onMediaPlaybackChange,
  initialChapter,
  courseTheme,
}: {
  lesson: any;
  lessonIndex: number;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  certId: string;
  courseId: string;
  onComplete: () => void;
  matchedVideos: any[];
  completedVideos: Set<string>;
  toggleVideoComplete: (id: string) => void;
  isReviewMode?: boolean;
  courseExercises?: any[];
  onChapterChange?: (current: number, total: number) => void;
  onMediaPlaybackChange?: (isPlaying: boolean) => void;
  initialChapter?: number;
  courseTheme?: any;
}) {
  const { user } = useAuth();
  const recordCompetencyOutcome = trpc.competencies.recordAssessmentOutcome.useMutation();
  const [currentChapter, setCurrentChapter] = useState(initialChapter ?? 0);
  // validatedChapter tracks the highest chapter index that was VALIDATED (quiz passed or exercises completed)
  // This is what gets persisted as progress - NOT the navigation position
  const [validatedChapter, setValidatedChapter] = useState(initialChapter ?? 0);

  const [showQuiz, setShowQuiz] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChapterQuiz, setShowChapterQuiz] = useState(false);
  const [chapterQuizPassed, setChapterQuizPassed] = useState<Set<number>>(new Set());
  // Track completed exercises in quiz/checkpoint chapters (exerciseId -> true)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  // Track chapters where all flip cards have been seen
  const [flipCardsCompleted, setFlipCardsCompleted] = useState<Set<number>>(new Set());
  // Track chapters where matching/bucket exercises have been completed
  const [matchingCompleted, setMatchingCompleted] = useState<Set<string>>(new Set());
  // Track completed cloud exercises (TP)
  const [completedCloudExercises, setCompletedCloudExercises] = useState<Set<string>>(new Set());
  const [completedNovasavoInteractions, setCompletedNovasavoInteractions] = useState<Set<string>>(new Set());
  // Track whether we're syncing from parent to avoid calling onChapterChange back
  const isSyncingFromParent = useRef(false);
  const prevLessonId = useRef(lesson.id);

  const chapters = useMemo(() => lesson.chapters || [], [lesson.chapters]);
  const totalChapters = chapters.length;

  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isLastChapter = currentChapter >= totalChapters - 1;

  // Estimated reading time (based on word count of current chapter)
  const estimatedReadingTime = useMemo(() => {
    const chapter = chapters[currentChapter];
    if (!chapter) return 0;
    let wordCount = 0;
    for (const block of chapter.blocks || []) {
      if (block.type === 'content') {
        const body = block.body || {};
        const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
        wordCount += text.split(/\s+/).length;
      }
    }
    return Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
  }, [chapters, currentChapter, lang]);

  // Sync with initialChapter prop (for single-lesson courses navigating via sidebar)
  useEffect(() => {
    if (initialChapter !== undefined && initialChapter !== currentChapter) {
      isSyncingFromParent.current = true;
      setCurrentChapter(initialChapter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChapter]); // intentionally excludes currentChapter to avoid loops

  // When lesson changes, reset chapter position
  useEffect(() => {
    if (lesson.id !== prevLessonId.current) {
      prevLessonId.current = lesson.id;
      const startChapter = initialChapter !== undefined ? initialChapter : 0;
      setCurrentChapter(startChapter);
      setValidatedChapter(startChapter);
      setShowQuiz(false);
      setShowTranscript(false);
      setShowChapterQuiz(false);
      setChapterQuizPassed(new Set());
      setCompletedExercises(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]); // intentionally excludes initialChapter to only reset on lesson change

  // Reading progress tracking + scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setReadingProgress(progress);
      setShowScrollTop(scrollTop > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts for navigation (respects gating)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && !isLastChapter) {
        // Check all gates before allowing forward navigation
        const ch = chapters[currentChapter];
        if (ch && !isReviewMode) {
          const blocks = ch.blocks || [];
          // Video gate
          const videoKeys = blocks.filter((b: any) => b.type === 'video').map((b: any) => { if (b.mp4Url || b.audioUrl) return b.id || ''; let rawId = b.videoId || ''; if (!rawId && b.url) { const m = (b.url as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); if (m) rawId = m[1]; } if (!rawId && b.id && typeof b.id === 'string' && b.id.length >= 8 && b.id.length <= 15) rawId = b.id; return typeof rawId === 'object' ? (rawId.fr || rawId.en || '') : rawId; }).filter(Boolean);
          if (!hasOptionalSupplementaryVideos(ch) && videoKeys.length > 0 && !videoKeys.every((k: string) => completedVideos.has(k))) return;
          // Flip cards gate
          const hasFlips = blocks.some((b: any) => b.type === 'flip_cards' && (b.cards || []).length > 0);
          if (hasFlips && !flipCardsCompleted.has(currentChapter)) return;
          // Matching gate
          const matchIds = blocks.filter((b: any) => b.type === 'bucket_sort').map((b: any, i: number) => b.id || `bucket_${i}`);
          if (matchIds.length > 0 && !matchIds.every((id: string) => matchingCompleted.has(id))) return;
          // Single choice exercise gate
          const scIds = blocks.filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'multi_choice_exercise' || b.type === 'resource_review').map((b: any, i: number) => b.id || `quiz_${i}`);
          if (scIds.length > 0 && !scIds.every((id: string) => completedExercises.has(id))) return;
          const cloudIds = blocks.filter((b: any) => b.type === 'cloud_exercise').map((b: any, i: number) => b.id || `cloud_exercise_${i}`);
          if (cloudIds.length > 0 && !cloudIds.every((id: string) => completedCloudExercises.has(id))) return;
          const novasavoIds = blocks.filter((b: any) => ["inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "knowledge_check"].includes(b.type)).map((b: any, i: number) => b.id || `novasavo_${i}`);
          if (novasavoIds.length > 0 && !novasavoIds.every((id: string) => completedNovasavoInteractions.has(id))) return;
        }
        setCurrentChapter(p => p + 1);
      } else if (e.key === 'ArrowLeft' && currentChapter > 0) {
        setCurrentChapter(p => p - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, isLastChapter, completedVideos, flipCardsCompleted, matchingCompleted, completedExercises, completedCloudExercises, completedNovasavoInteractions, isReviewMode, chapters]);

  // When chapter changes from internal navigation (Next button, etc.) - only scroll
  useEffect(() => {
    if (isSyncingFromParent.current) {
      isSyncingFromParent.current = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setReadingProgress(0);
  }, [currentChapter, totalChapters]);

  // YouTube video tracking is now handled by the YouTubePlayer component internally

  // Only persist progress when validatedChapter advances (quiz passed or exercises completed)
  useEffect(() => {
    if (validatedChapter > 0) {
      onChapterChange?.(validatedChapter, totalChapters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedChapter, totalChapters]); // onChapterChange is stable (useCallback in parent)

  const chapter = chapters[currentChapter];
  const canEditCurrentChapter = user?.role === "admin";
  const currentChapterEditHref = getContextualCourseEditorHref({ courseId, lessonIndex, chapterIndex: currentChapter });
  const novasavoInteractionIds = (chapter?.blocks || [])
    .filter((block: any) => ["inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "knowledge_check"].includes(block.type))
    .map((block: any, index: number) => block.id || `novasavo_${index}`);
  const isGatedByNovasavoInteraction = !isReviewMode && novasavoInteractionIds.length > 0 && !novasavoInteractionIds.every((id: string) => completedNovasavoInteractions.has(id));

  if (!chapter && !showQuiz) {
    return (
      <div className="mt-2 p-6 text-center">
        <p className="text-sm italic text-muted-foreground">
          {t({ en: "No content available", fr: "Aucun contenu disponible" })}
        </p>
      </div>
    );
  }

  // Render a single block
  const renderBlock = (block: any, blockIdx: number) => {
    switch (block.type) {
      case "unit_hero_blue":
      case "learning_objectives_panel":
      case "inline_myth_reality":
      case "inline_multiple_choice_feedback":
      case "inline_scenario_question_feedback":
      case "timeline_step_cards":
      case "process_flow_diagram":
      case "mistake_correction_pairs":
      case "ai_assistant_prompt_panel":
      case "notes_highlights_bookmarks_panel":
      case "accounting_comparison_visual":
      case "key_points_summary":
      case "competency_progress_hud":
      case "xp_progress_hud":
      case "course_completion_next_unit_panel":
        return <div key={blockIdx} className="novasavo-learning-block w-full min-w-0 max-w-full"><NovasavoLearningBlock block={block} lang={lang} courseId={courseId} lessonTitle={resolveI18n(lesson.title, lang)} screenTitle={resolveI18n(chapter?.title, lang)} onComplete={(id, isCorrect) => {
          setCompletedNovasavoInteractions((current) => new Set(current).add(id));
          if (isCorrect) recordCompetencyOutcome.mutate({
            sourceType: "checkpoint_passed",
            sourceKey: courseId,
            eventKey: `novasavo:${courseId}:${lessonIndex}:${currentChapter}:${id}`,
            score: 100,
            certificationId: certId,
            courseId,
            lessonIndex,
            chapterIndex: currentChapter,
          });
        }} /></div>;
      case "learning_section":
        return <LearningSectionBlock key={blockIdx} block={block} lang={lang} />;
      case "knowledge_check":
        return <KnowledgeCheckBlock key={blockIdx} block={block} lang={lang} onComplete={(id, isCorrect) => {
          setCompletedNovasavoInteractions((current) => new Set(current).add(id));
          if (isCorrect) recordCompetencyOutcome.mutate({ sourceType: "checkpoint_passed", sourceKey: courseId, eventKey: `knowledge-check:${courseId}:${lessonIndex}:${currentChapter}:${id}`, score: 100, certificationId: certId, courseId, lessonIndex, chapterIndex: currentChapter });
        }} />;
      case "sequence_visual":
        return <SequenceVisualBlock key={blockIdx} block={block} lang={lang} />;
      case "comparison_panel":
        return <ComparisonPanelBlock key={blockIdx} block={block} lang={lang} />;
      case "learning_tools":
        return <LearningToolsBlock key={blockIdx} block={block} lang={lang} courseId={courseId} lessonTitle={resolveI18n(lesson.title, lang)} screenTitle={resolveI18n(chapter?.title, lang)} />;
      case "learning_progress":
        return <LearningProgressBlock key={blockIdx} block={block} lang={lang} />;
      case "content": {
        const body = block.body || {};
        let text = typeof body === "string" ? body : (body[lang] || body.en || "");
        if (!text) return null;
        // Skip content blocks that are text duplicates of the following bucket_sort exercise
        const allBlocks = chapter?.blocks || [];
        if (blockIdx + 1 < allBlocks.length && allBlocks[blockIdx + 1]?.type === 'bucket_sort') {
          const nextBucket = allBlocks[blockIdx + 1];
          const bucketLabels = (nextBucket.buckets || []).map((b: any) => {
            const lbl = b.label || {};
            return typeof lbl === 'string' ? lbl : (lbl[lang] || lbl.en || '');
          });
          const textLines = text.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
          const lastLines = textLines.slice(-Math.max(bucketLabels.length + 2, 6));
          const matchCount = bucketLabels.filter((label: string) => lastLines.includes(label)).length;
          if (matchCount >= 2) {
            // This content block is a scraping artifact - skip it
            return null;
          }
        }
        // Skip the first line of the first content block since it's used as the screen title
        const isFirstContentBlock = blockIdx === (chapter?.blocks || []).findIndex((b: any) => b.type === 'content');
        if (isFirstContentBlock) {
          const lines = text.split('\n');
          const firstNonEmpty = lines.findIndex((l: string) => l.trim().length > 0);
          if (firstNonEmpty >= 0) {
            // Remove the first non-empty line (used as screen title)
            lines.splice(firstNonEmpty, 1);
            // Also check if the next non-empty line was used as screen description
            const secondNonEmpty = lines.findIndex((l: string) => l.trim().length > 0);
            if (secondNonEmpty >= 0) {
              const secondLine = lines[secondNonEmpty].trim().replace(/^#{1,6}\s+/, '');
              if (secondLine.length < 120 && secondLine.length > 20) {
                // This was likely used as screen description - skip it too
                lines.splice(secondNonEmpty, 1);
              }
            }
            text = lines.join('\n');
          }
        }
        if (!text.trim()) return null;
        // If this content block precedes a cloud_exercise AND contains setup instructions,
        // render it as a collapsible <details> to keep the TP zone closer to the top
        const nextBlock = (chapter?.blocks || [])[blockIdx + 1];
        const isSetupBeforeTP = nextBlock?.type === 'cloud_exercise' && (
          text.includes('Option A') || text.includes('Option B') || text.includes('environnement') || text.includes('Préparation')
        );
        if (isSetupBeforeTP) {
          // Extract the first heading as summary label
          const headingMatch = text.match(/^#{1,3}\s+(.+)/m);
          const summaryLabel = headingMatch ? headingMatch[1].trim() : (lang === 'fr' ? 'Préparation de l\'environnement' : 'Environment Setup');
          return (
            <details key={blockIdx} className="border border-border rounded-lg bg-muted/30 my-2">
              <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg">
                📋 {summaryLabel}
              </summary>
              <div className="px-4 pb-4 text-sm prose prose-sm max-w-none text-muted-foreground">
                <PageContent content={text} lang={lang} />
              </div>
            </details>
          );
        }
        return (
          <div key={blockIdx} className="py-1">
            <PageContent content={text} lang={lang} />
          </div>
        );
      }
      case "video": {
        // Check if this is a local MP4 video (DataCamp n8n course)
        if (block.mp4Url) {
          const mp4Title = typeof block.title === 'object' ? (block.title?.[lang] || block.title?.en || block.title?.fr || 'Video') : (block.title || 'Video');
          const mp4Key = block.id || `mp4_${blockIdx}`;
          const isMp4Complete = completedVideos.has(mp4Key);

          // Use ProjectorPlayer if slide data exists (DataCamp Projector videos with blank zones)
          if (block.projectorSlides && block.projectorSlides.length > 0 && block.projectorTimings) {
            return (
              <div key={blockIdx} className="my-6">
                <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-t-xl bg-card">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isMp4Complete ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isMp4Complete ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  </span>
                  <span className="font-semibold text-foreground">{mp4Title}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700">VIDÉO</span>
                  {isMp4Complete && <span className="ml-auto text-xs text-green-600 font-medium">{t({en:'\u2713 Watched',fr:'\u2713 Vue'})}</span>}
                </div>
                <ProjectorPlayer
                  mp4Url={block.mp4Url}
                  slides={block.projectorSlides}
                  timings={block.projectorTimings}
                  timingUnit={block.projectorTimingUnit}
                  duration={block.projectorDuration || 300}
                  onPlay={() => onMediaPlaybackChange?.(true)}
                  onPause={() => onMediaPlaybackChange?.(false)}
                  onEnded={() => { onMediaPlaybackChange?.(false); toggleVideoComplete(mp4Key); }}
                />
                <div className="flex items-center justify-between px-4 py-2 border border-t-0 border-border rounded-b-xl bg-card">
                  <button
                    onClick={() => toggleVideoComplete(mp4Key)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t({en:'Mark as watched (manual)',fr:'Marquer comme vue (manuel)'})}
                  </button>
                  {block.slidesPdf && (
                    <a href={block.slidesPdf} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {t({en:'Slides PDF',fr:'Slides PDF'})}
                    </a>
                  )}
                  {(block.subtitleUrlFr || block.subtitleUrlEn) && (
                    <a href={block.subtitleUrlFr || block.subtitleUrlEn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {t({en:'Subtitles',fr:'Sous-titres'})}
                    </a>
                  )}
                </div>
                {block.transcript && (
                  <details className="border border-t-0 border-border rounded-b-xl mt-[-1px]">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t({en:'Video transcript',fr:'Transcription vid\u00E9o'})}
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {block.transcriptSegments?.length > 0 ? (
                        block.transcriptSegments.map((seg: any, i: number) => (
                          <div key={i} className="mb-3">
                            <p className="font-semibold text-foreground mb-1">{seg.heading}</p>
                            <p>{seg.text}</p>
                          </div>
                        ))
                      ) : block.transcript}
                    </div>
                  </details>
                )}
              </div>
            );
          }

          // Fallback: standard video player (no Projector data)
          return (
            <div key={blockIdx} className="my-6 rounded-xl border border-border overflow-hidden bg-card">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isMp4Complete ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {isMp4Complete ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </span>
                <span className="font-semibold text-foreground">{mp4Title}</span>
                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700">VIDÉO</span>
                {isMp4Complete && <span className="ml-auto text-xs text-green-600 font-medium">{t({en:'\u2713 Watched',fr:'\u2713 Vue'})}</span>}
              </div>
              <video
                controls
                preload="metadata"
                playsInline
                className="w-full max-h-[480px] bg-black"
                onPlay={() => onMediaPlaybackChange?.(true)}
                onPause={() => onMediaPlaybackChange?.(false)}
                onEnded={() => { onMediaPlaybackChange?.(false); toggleVideoComplete(mp4Key); }}
              >
                <source src={block.mp4Url} type="video/mp4" />
                {block.hlsUrl && <source src={block.hlsUrl} type="application/x-mpegURL" />}
                {block.subtitleUrlFr && <track kind="subtitles" srcLang="fr" label="Français" src={block.subtitleUrlFr} default />}
                {block.subtitleUrlEn && <track kind="subtitles" srcLang="en" label="English" src={block.subtitleUrlEn} />}
              </video>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                <button
                  onClick={() => toggleVideoComplete(mp4Key)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t({en:'Mark as watched (manual)',fr:'Marquer comme vue (manuel)'})}
                </button>
                {block.slidesPdf && (
                  <a href={block.slidesPdf} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {t({en:'Slides PDF',fr:'Slides PDF'})}
                  </a>
                )}
              </div>
              {block.transcript && (
                <details className="border-t border-border">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t({en:'Video transcript',fr:'Transcription vid\u00E9o'})}
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {block.transcriptSegments?.length > 0 ? (
                      block.transcriptSegments.map((seg: any, i: number) => (
                        <div key={i} className="mb-3">
                          <p className="font-semibold text-foreground mb-1">{seg.heading}</p>
                          <p>{seg.text}</p>
                        </div>
                      ))
                    ) : block.transcript}
                  </div>
                </details>
              )}
            </div>
          );
        }
        // Audio-only fallback (when mp4Url is null but audioUrl exists)
        if (block.audioUrl) {
          const audioTitle = typeof block.title === 'object' ? (block.title?.[lang] || block.title?.en || block.title?.fr || 'Audio') : (block.title || 'Audio');
          const audioKey = block.id || `audio_${blockIdx}`;
          const isAudioComplete = completedVideos.has(audioKey);
          const hasProjectorSlides = Array.isArray(block.projectorSlides) && block.projectorSlides.length > 0 && Array.isArray(block.projectorTimings);

          if (hasProjectorSlides) {
            return (
              <div key={blockIdx} className="my-6">
                <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-t-xl bg-card">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isAudioComplete ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {isAudioComplete ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  </span>
                  <span className="font-semibold text-foreground">{audioTitle}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-700">PROJECTOR AUDIO</span>
                  {isAudioComplete && <span className="ml-auto text-xs text-green-600 font-medium">{t({en:'\u2713 Listened',fr:'\u2713 Écoutée'})}</span>}
                </div>
                <ProjectorPlayer
                  audioUrl={block.audioUrl}
                  slides={block.projectorSlides}
                  timings={block.projectorTimings}
                  timingUnit={block.projectorTimingUnit}
                  duration={block.projectorDuration || 300}
                  onPlay={() => onMediaPlaybackChange?.(true)}
                  onPause={() => onMediaPlaybackChange?.(false)}
                  onEnded={() => { onMediaPlaybackChange?.(false); toggleVideoComplete(audioKey); }}
                />
                <div className="flex items-center justify-between px-4 py-2 border border-t-0 border-border rounded-b-xl bg-card">
                  <button
                    onClick={() => toggleVideoComplete(audioKey)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t({en:'Mark as listened (manual)',fr:'Marquer comme écoutée (manuel)'})}
                  </button>
                  <div className="flex items-center gap-4">
                    {block.slidesPdf && (
                      <a href={block.slidesPdf} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {t({en:'Slides PDF',fr:'Slides PDF'})}
                      </a>
                    )}
                    {(block.subtitleUrlFr || block.subtitleUrlEn) && (
                      <a href={block.subtitleUrlFr || block.subtitleUrlEn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {t({en:'Subtitles',fr:'Sous-titres'})}
                      </a>
                    )}
                  </div>
                </div>
                {block.transcript && (
                  <details className="border border-t-0 border-border rounded-b-xl mt-[-1px]">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t({en:'Transcript',fr:'Transcription'})}
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {block.transcriptSegments?.length > 0 ? (
                        block.transcriptSegments.map((seg: any, i: number) => (
                          <div key={i} className="mb-3">
                            <p className="font-semibold text-foreground mb-1">{seg.heading}</p>
                            <p>{seg.text}</p>
                          </div>
                        ))
                      ) : block.transcript}
                    </div>
                  </details>
                )}
              </div>
            );
          }

          return (
            <div key={blockIdx} className="my-6 rounded-xl border border-border overflow-hidden bg-card">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <span className={`flex items-center justify-center w-7 h-7 rounded-full ${isAudioComplete ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                  {isAudioComplete ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </span>
                <span className="font-semibold text-foreground">{audioTitle}</span>
                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-700">AUDIO</span>
                {isAudioComplete && <span className="ml-auto text-xs text-green-600 font-medium">{t({en:'\u2713 Listened',fr:'\u2713 \u00C9cout\u00E9e'})}</span>}
              </div>
              <div className="px-4 py-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2 italic">{t({en:'Local audio version with transcript support',fr:'Version audio locale avec support/transcription'})}</p>
                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                  onPlay={() => onMediaPlaybackChange?.(true)}
                  onPause={() => onMediaPlaybackChange?.(false)}
                  onEnded={() => { onMediaPlaybackChange?.(false); toggleVideoComplete(audioKey); }}
                >
                  <source src={block.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                <button
                  onClick={() => toggleVideoComplete(audioKey)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t({en:'Mark as listened (manual)',fr:'Marquer comme \u00E9cout\u00E9e (manuel)'})}
                </button>
                {block.slidesPdf && (
                  <a href={block.slidesPdf} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                      {t({en:'Slides PDF',fr:'Slides PDF'})}
                    </a>
                  )}
                  {(block.subtitleUrlFr || block.subtitleUrlEn) && (
                    <a href={block.subtitleUrlFr || block.subtitleUrlEn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {t({en:'Subtitles',fr:'Sous-titres'})}
                    </a>
                  )}
                </div>
              {block.transcript && (
                <details className="border-t border-border">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t({en:'Transcript',fr:'Transcription'})}
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {block.transcriptSegments?.length > 0 ? (
                      block.transcriptSegments.map((seg: any, i: number) => (
                        <div key={i} className="mb-3">
                          <p className="font-semibold text-foreground mb-1">{seg.heading}</p>
                          <p>{seg.text}</p>
                        </div>
                      ))
                    ) : block.transcript}
                  </div>
                </details>
              )}
            </div>
          );
        }
        // Extract YouTube ID from multiple possible fields: videoId, id, or url
        let rawVideoId = block.videoId || "";
        if (!rawVideoId && block.url) {
          const urlMatch = (block.url as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
          if (urlMatch) rawVideoId = urlMatch[1];
        }
        if (!rawVideoId && block.id && typeof block.id === 'string' && block.id.length >= 8 && block.id.length <= 15) {
          rawVideoId = block.id;
        }
        const videoId = typeof rawVideoId === 'object' ? (rawVideoId[lang] || rawVideoId.en || rawVideoId.fr || "") : rawVideoId;
        const videoKey = typeof rawVideoId === 'object' ? (rawVideoId.fr || rawVideoId.en || "") : rawVideoId;
        const videoTitle = typeof block.title === 'object' && block.title !== null && ('fr' in block.title || 'en' in block.title) ? (block.title[lang] || block.title.en || block.title.fr || "Video") : (block.title || "Video");
        const videoWatchUrl = typeof block.watchUrl === 'object' ? (block.watchUrl[lang] || block.watchUrl.en || block.watchUrl.fr || "") : (block.watchUrl || "");
        const isVideoComplete = completedVideos.has(videoKey);
        return (
          <YouTubePlayer
            key={blockIdx}
            videoId={videoId}
            videoKey={videoKey}
            title={videoTitle}
            isCompleted={isVideoComplete}
            onMarkComplete={toggleVideoComplete}
            onPlaybackChange={onMediaPlaybackChange}
            watchUrl={videoWatchUrl}
            lang={lang}
            t={t}
          />
        );
      }
      case "transcript": {
        const body = block.body || {};
        const text = typeof body === "string" ? body : (body[lang] || body.en || "");
        if (!text) return null;
        return (
          <details key={blockIdx} className="group border border-border/50 rounded-lg" open={showTranscript}>
            <summary
              onClick={(e) => { e.preventDefault(); setShowTranscript(!showTranscript); }}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {t({ en: "Video Transcript", fr: "Transcription vidéo" })}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${showTranscript ? "rotate-180" : ""}`} />
            </summary>
            <div className="px-4 pb-3 text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {text}
            </div>
          </details>
        );
      }
      case "checkpoint": {
        const exerciseId = block.exerciseId;
        const exercise = courseExercises.find((ex: any) => ex.id === exerciseId);
        if (!exercise) return null;
        return (
          <div key={blockIdx} className="my-4">
            <ExerciseRenderer
              exercise={exercise}
              index={0}
              lang={lang as "en" | "fr"}
              onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })}
            />
          </div>
        );
      }
      case "flip_cards": {
        const cards = block.cards || [];
        if (!cards.length) return null;
        return (
          <div key={blockIdx}>
            <FlipCardsGrid cards={cards} lang={lang} onAllFlipped={() => setFlipCardsCompleted((prev) => { const next = new Set(Array.from(prev)); next.add(currentChapter); return next; })} />
          </div>
        );
      }
      case "tabbed_content": {
        const tabs = block.tabs || [];
        if (!tabs.length) return null;
        return (
          <div key={blockIdx}>
            <TabbedContent tabs={tabs} lang={lang as "en" | "fr"} />
          </div>
        );
      }
      case "comparison": {
        const items = block.items || [];
        if (!items.length) return null;
        return (
          <div key={blockIdx}>
            <ComparisonBox
              items={items}
              conclusion={block.conclusion}
              lang={lang as "en" | "fr"}
            />
          </div>
        );
      }
      case "bucket_sort": {
        if (!block.buckets || !block.cards) return null;
        const matchingId = block.id || `bucket_${blockIdx}`;
        return (
          <div key={blockIdx}>
            <MatchingExercise
              exercise={{
                id: matchingId,
                title: block.title,
                instructions: block.instructions,
                buckets: block.buckets,
                cards: block.cards,
                correction: block.correction,
              }}
              lang={lang as "en" | "fr"}
              onComplete={() => setMatchingCompleted((prev) => { const next = new Set(Array.from(prev)); next.add(matchingId); return next; })}
            />
          </div>
        );
      }
      case "single_choice_exercise": {
        const question = typeof block.question === 'string' ? block.question : (block.question?.[lang] || block.question?.en || '');
        const options = (block.options || []).map((opt: any) => ({
          id: opt.id,
          text: typeof opt.text === 'string' ? opt.text : (opt.text?.[lang] || opt.text?.en || '')
        }));
        const explanation = typeof block.explanation === 'string' ? block.explanation : (block.explanation?.[lang] || block.explanation?.en || '');
        const correctAnswer = block.correctAnswer || 'a';
        const exerciseId = block.id || `quiz_${blockIdx}`;
        const rankOption = (option: any) => `${exerciseId}:${option.id}`.split("").reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
        const displayedOptions = chapter?.shuffleChoices ? [...options].sort((a, b) => rankOption(a) - rankOption(b)) : options;
        // Calculate question number within this chapter
        const chapterBlocks = chapter?.blocks || [];
        const quizBlocksBefore = chapterBlocks.slice(0, blockIdx).filter((b: any) => b.type === 'single_choice_exercise').length;
        return (
          <SingleChoiceExercise
            key={blockIdx}
            id={exerciseId}
            question={question}
            options={displayedOptions}
            correctAnswer={correctAnswer}
            explanation={explanation}
            hint={typeof block.hint === 'string' ? block.hint : (block.hint?.[lang] || block.hint?.en || '')}
            lang={lang as 'en' | 'fr'}
            questionNumber={quizBlocksBefore + 1}
            onCorrect={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })}
          />
        );
      }
      case "download": {
        const dlTitle = block.title ? (typeof block.title === 'object' ? (block.title[lang] || block.title.en || '') : block.title) : '';
        const dlDesc = block.description ? (typeof block.description === 'object' ? (block.description[lang] || block.description.en || '') : block.description) : '';
        const dlUrl = block.download_url || block.url || '';
        const _dlFilename = block.filename || 'file';
        const dlColor = block.color || '#cbcadb';
        const dlImage = block.image || {};
        const dlImageSrc = typeof dlImage === 'object' ? (dlImage.src || '') : '';
        const dlImageAlt = typeof dlImage === 'object' ? (dlImage.alt || 'Download illustration') : 'Download illustration';
        const isFirstDownload = blockIdx === 0 || (blockIdx > 0 && (() => {
          const prevBlock = chapter?.blocks?.[blockIdx - 1];
          return !prevBlock || prevBlock.type !== 'download';
        })());
        return (
          <div key={blockIdx} className="my-4">
            {isFirstDownload ? (
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {t({ en: "Downloads", fr: "Téléchargements" })}
              </h3>
            ) : null}
            {/* Desktop: horizontal card. Mobile: stacked */}
            <a
              href={dlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity group mb-4"
              style={{ backgroundColor: dlColor }}
            >
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Image section */}
                <div className="md:w-48 w-full h-40 md:h-auto flex items-center justify-center p-6 shrink-0">
                  {dlImageSrc ? (
                    <img
                      src={dlImageSrc}
                      alt={dlImageAlt}
                      className="w-24 h-24 md:w-32 md:h-32 object-contain"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-foreground/60" />
                  )}
                </div>
                {/* Content section */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <p className="font-semibold text-foreground text-lg mb-2">{dlTitle}</p>
                  {dlDesc && <p className="text-foreground/80 text-base leading-relaxed mb-4">{dlDesc}</p>}
                  <div>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground/10 text-foreground text-sm font-medium group-hover:bg-foreground/20 transition-colors w-full md:w-auto justify-center">
                      <Download className="w-4 h-4" />
                      {t({ en: "Download", fr: "Télécharger" })}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        );
      }
      case "resource_review": {
        const reviewId = block.id || `resource_review_${blockIdx}`;
        const reviewTitle = typeof block.title === 'object' ? (block.title[lang] || block.title.en || '') : (block.title || '');
        const reviewInstructions = typeof block.instructions === 'object' ? (block.instructions[lang] || block.instructions.en || '') : (block.instructions || '');
        const reviewLabel = typeof block.resourceLabel === 'object' ? (block.resourceLabel[lang] || block.resourceLabel.en || '') : (block.resourceLabel || t({ en: 'Open local resource', fr: 'Ouvrir la ressource locale' }));
        const reviewUrl = block.resourceUrl || block.url || '';
        const reviewComplete = completedExercises.has(reviewId);
        return (
          <div key={blockIdx} className="my-6 rounded-xl border border-violet-200 bg-violet-50/40 p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{reviewTitle}</p>
                {reviewInstructions && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{reviewInstructions}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-medium text-violet-800 hover:bg-violet-100">
                    <FileText className="h-4 w-4" />{reviewLabel}
                  </a>
                  <Button size="sm" variant={reviewComplete ? 'outline' : 'default'} disabled={reviewComplete} onClick={() => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(reviewId); return next; })}>
                    {reviewComplete ? t({ en: 'Resource reviewed', fr: 'Ressource consultée' }) : t({ en: 'I have reviewed this resource', fr: 'J’ai consulté cette ressource' })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case "exercise": {
        // Numeric answer exercises
        if (block.exercise_type === "numeric_answers" && block.questions?.length > 0) {
          const exTitle = block.body ? {
            en: "Numeric Answer Exercise",
            fr: "Exercice à réponses numériques"
          } : { en: "Exercise", fr: "Exercice" };
          // Use title from the exercise definition if available
          const exerciseTitle = (() => {
            const body = block.body || {};
            const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
            const firstLine = text.split('\n').find((l: string) => l.trim().startsWith('##'));
            if (firstLine) {
              return { en: firstLine.replace(/^#+\s*/, ''), fr: firstLine.replace(/^#+\s*/, '') };
            }
            return exTitle;
          })();
          const exerciseInstructions = (() => {
            const body = block.body || {};
            const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
            const instrLine = text.split('\n').find((l: string) => l.trim().startsWith('**Instructions'));
            if (instrLine) {
              return { en: instrLine.replace(/\*\*/g, '').replace(/^Instructions\s*:?\s*/i, ''), fr: instrLine.replace(/\*\*/g, '').replace(/^Instructions\s*:?\s*/i, '') };
            }
            return { en: "Answer the following questions based on your data analysis.", fr: "Répondez aux questions suivantes en vous basant sur votre analyse des données." };
          })();
          return (
            <div key={blockIdx} className="my-4">
              <NumericAnswerExercise
                questions={block.questions}
                title={exerciseTitle}
                instructions={exerciseInstructions}
                lang={lang as "en" | "fr"}
                courseId={courseId}
                moduleId={`module_${lessonIndex + 1}`}
              />
            </div>
          );
        }
        // Fallback: render as content
        const exBody = block.body || {};
        const exText = typeof exBody === 'string' ? exBody : (exBody[lang] || exBody.en || '');
        if (!exText) return null;
        return (
          <div key={blockIdx} className="py-1">
            <PageContent content={exText} lang={lang} />
          </div>
        );
      }
      case "cloud_exercise": {
        return <CloudExerciseBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setCompletedCloudExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "callout": {
        return <CalloutBlock key={blockIdx} block={block} lang={lang} />;
      }
      case "matching": {
        return <MatchingBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setMatchingCompleted((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "fill_blank": {
        return <FillBlankBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "terminal_sim": {
        return <TerminalSimBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "code_repl": {
        return <CodeReplBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "ordering": {
        return <OrderingBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setMatchingCompleted((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "ai_evaluation": {
        return <AiEvaluationBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} evaluationContext={{ certificationId: certId, courseId, lessonIndex, chapterIndex: currentChapter }} onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      case "multi_choice_exercise": {
        return <MultiChoiceBlock key={blockIdx} block={block} lang={lang} t={t} blockIdx={blockIdx} onComplete={(id) => setCompletedExercises((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; })} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className="mt-2 w-full min-w-0 max-w-full">
      {/* Reading progress bar */}
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />

      {/* Scroll to top button */}
      <button
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4 text-foreground" />
      </button>

      {/* Sticky chapter title bar - appears on scroll */}
      <div className={`sticky-chapter-bar ${showScrollTop ? 'visible' : ''}`}>
        <div className="mx-auto flex w-full min-w-0 max-w-3xl items-center gap-3 px-4">
          <span className="text-xs font-semibold text-[#c75b3a] uppercase tracking-wider">
            {currentChapter + 1}/{totalChapters}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {chapter ? resolveI18n(chapter.title, lang) : ''}
          </span>
        </div>
      </div>

      {!showQuiz ? (
        <>
          <div>
          {/* Chapter header - Skilljar style: badge shows type + chapter name, title shows screen title */}
          {chapter && (() => {
            // Extract screen title from first content block's first line
            const firstContentBlock = chapter.blocks?.find((b: any) => b.type === 'content');
            let screenTitle = '';
            let screenDescription = '';
            if (firstContentBlock) {
              const body = firstContentBlock.body || {};
              const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
              const textLines = text.split('\n').filter((l: string) => l.trim().length > 0);
              if (textLines.length > 0) {
                // Strip markdown heading prefixes (##, ###, etc.)
                screenTitle = textLines[0].trim().replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '');
                // If second line is a short description (< 120 chars), use it
                if (textLines.length > 1 && textLines[1].trim().length < 120 && textLines[1].trim().length > 20) {
                  screenDescription = textLines[1].trim().replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '');
                }
              }
            }
            // Fall back to chapter title if no screen title found
            const displayTitle = screenTitle || resolveI18n(chapter.title, lang);
            const chapterName = resolveI18n(chapter.title, lang);
            // Only show chapter name in badge if screen title is different from chapter title
            const showChapterInBadge = screenTitle && screenTitle !== chapterName;

            return (
              <div className="mb-8">
                {/* Badge row: TYPE | CHAPTER_NAME · DURATION */}
                <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                    chapter.type === 'exercise'
                      ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300'
                      : chapter.type === 'checkpoint' || chapter.type === 'quiz'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {chapter.type === 'exercise' ? t({ en: 'EXERCISE', fr: 'EXERCICE' })
                      : chapter.type === 'checkpoint' ? 'CHECKPOINT'
                      : chapter.type === 'quiz' ? 'QUIZ'
                      : t({ en: 'TEACHING', fr: 'ENSEIGNEMENT' })}
                  </span>
                  {showChapterInBadge && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      {chapterName}
                    </span>
                  )}
                  {chapter.duration && (
                    <span className="text-xs text-muted-foreground">
                      · {chapter.duration}
                    </span>
                  )}
                  {estimatedReadingTime > 0 && (
                    <span className="reading-time-badge">
                      <Timer className="w-3 h-3" />
                      {estimatedReadingTime} min {t({ en: 'read', fr: 'de lecture' })}
                    </span>
                  )}
                  {canEditCurrentChapter && (
                    <Button asChild size="sm" variant="outline" className="ml-auto h-8 gap-1.5 border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary">
                      <a href={currentChapterEditHref} target="_blank" rel="noopener noreferrer" title={t({ en: 'Open this chapter in the content editor', fr: 'Ouvrir ce chapitre dans l’éditeur de contenu' })}>
                        <Pencil className="h-3.5 w-3.5" />
                        {t({ en: 'Edit this screen', fr: 'Modifier cet écran' })}
                      </a>
                    </Button>
                  )}
                </div>
                {/* Screen title - large serif */}
                <h2 className="text-2xl md:text-[28px] font-semibold text-foreground leading-tight" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {displayTitle}
                </h2>
                {/* Decorative separator */}
                <div className="mt-4 mb-2 w-12 h-0.5 bg-[#c75b3a]/60 rounded-full" />
                {/* Screen description - italic serif */}
                {screenDescription && (
                  <p className="mt-3 text-base text-muted-foreground italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                    {screenDescription}
                  </p>
                )}
                {/* Chapter description fallback */}
                {!screenDescription && chapter.description && (
                  <p className="mt-3 text-base text-muted-foreground italic" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                    {resolveI18n(chapter.description, lang)}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Render all blocks in the current chapter */}
          {/* Exercise navigation bar (top) - visible when in checkpoint/exercise chapters */}
          {chapter && (chapter.type === 'checkpoint' || chapter.type === 'exercise' || chapter.type === 'quiz') && totalChapters > 1 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 px-2 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCurrentChapter((p) => p - 1); }}
                disabled={currentChapter === 0}
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3 h-3" />
                {t({ en: "Previous", fr: "Précédent" })}
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                {currentChapter + 1} / {totalChapters}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCurrentChapter((p) => p + 1); }}
                disabled={currentChapter >= totalChapters - 1 || isGatedByNovasavoInteraction}
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {t({ en: "Next", fr: "Suivant" })}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}
          {chapter && (() => {
            // Detect if this screen is sparse (little content) to show illustration
            const allBlocks = chapter.blocks || [];
            const orderedBlocks = chapter.shuffleQuestions ? (() => {
              const shuffledQuestions = allBlocks
                .filter((block: any) => block.type === 'single_choice_exercise')
                .map((block: any) => ({ block, rank: `${currentChapter}:${block.id || block.question || ""}`.split("").reduce((total: number, character: string) => (total * 31 + character.charCodeAt(0)) >>> 0, 7) }))
                .sort((a: any, b: any) => a.rank - b.rank)
                .map((entry: any) => entry.block);
              return allBlocks.map((block: any) => block.type === 'single_choice_exercise' ? shuffledQuestions.shift() : block);
            })() : allBlocks;
            const contentBlocks = allBlocks.filter((b: any) => b.type === 'content');
            const hasVideo = allBlocks.some((b: any) => b.type === 'video');
            const hasExercise = allBlocks.some((b: any) => b.type === 'exercise' || b.type === 'quiz' || b.type === 'checkpoint');
            const hasBucketSort = allBlocks.some((b: any) => b.type === 'bucket_sort');
            const hasFlipCards = allBlocks.some((b: any) => b.type === 'flip_cards');
            const hasMatching = allBlocks.some((b: any) => b.type === 'matching');
            const hasNovasavoStructure = allBlocks.some((block: any) => ["unit_hero_blue", "learning_objectives_panel", "inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "timeline_step_cards", "process_flow_diagram", "mistake_correction_pairs", "ai_assistant_prompt_panel", "accounting_comparison_visual", "key_points_summary"].includes(block.type));
            const hasInteractive = hasVideo || hasExercise || hasBucketSort || hasFlipCards || hasMatching || hasNovasavoStructure;
            // Get screen title for illustration theme detection
            const firstCB = contentBlocks[0];
            let illustTitle = '';
            let illustContent = '';
            let contentAfterTitle = '';
            if (firstCB) {
              const body = firstCB.body || {};
              const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
              illustTitle = text.split('\n').find((l: string) => l.trim().length > 0) || '';
              illustContent = text;
              // Compute content remaining after title (and optional description) removal
              const lines = text.split('\n');
              const firstNonEmpty = lines.findIndex((l: string) => l.trim().length > 0);
              if (firstNonEmpty >= 0) {
                const remaining = [...lines];
                remaining.splice(firstNonEmpty, 1);
                const secondNonEmpty = remaining.findIndex((l: string) => l.trim().length > 0);
                if (secondNonEmpty >= 0) {
                  const secondLine = remaining[secondNonEmpty].trim().replace(/^#{1,6}\s+/, '');
                  if (secondLine.length < 120 && secondLine.length > 20) {
                    remaining.splice(secondNonEmpty, 1);
                  }
                }
                contentAfterTitle = remaining.join('\n').trim();
              }
            }
            // Compute total text length across all content blocks
            const totalTextLen = contentBlocks.reduce((acc: number, b: any) => {
              const body = b.body || {};
              const text = typeof body === 'string' ? body : (body[lang] || body.en || '');
              return acc + text.trim().length;
            }, 0);
            // Screen is sparse if:
            // 1. No interactive elements (video, exercise, etc.)
            // 2. AND either: total text is very short (<400), OR content after title removal is short (<200) with no markdown structure
            const hasMarkdownStructure = contentAfterTitle.includes('\n**') || contentAfterTitle.includes('\n1.') || contentAfterTitle.includes('\n- ') || contentAfterTitle.includes('\n•');
            const isSparse = !hasInteractive && (
              totalTextLen < 400 ||
              (contentAfterTitle.length < 200 && !hasMarkdownStructure)
            );
            // Les illustrations générées par heuristique ne figurent ni dans les JSON,
            // ni dans les sources pédagogiques : elles ne doivent jamais être injectées.
            // Seuls les médias explicitement déclarés dans un bloc peuvent être rendus.
            const shouldRenderAutomaticIllustration = false;
            return (
              <div className="w-full min-w-0 max-w-full space-y-8">
                {shouldRenderAutomaticIllustration && isSparse && (
                  <div className="w-full flex justify-center py-4">
                    <div className="w-full max-w-sm h-52 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                      <CourseIllustration
                        title={illustTitle}
                        content={illustContent}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {orderedBlocks.map((block: any, idx: number) => <BlockCustomizationFrame key={`${block.id || block.type || "block"}-${idx}`} block={block} lang={lang} theme={courseTheme}>{renderBlock(block, allBlocks.indexOf(block) >= 0 ? allBlocks.indexOf(block) : idx)}</BlockCustomizationFrame>)}
              </div>
            );
          })()}

          {/* Chapter Quiz (shown between teaching chapters) */}
          {showChapterQuiz && (
            <ChapterQuiz
              courseId={courseId}
              chapterIndex={currentChapter}
              lessonIndex={lessonIndex}
              lang={lang}
              t={t}
              onPass={(result) => {
                if (result?.total) recordCompetencyOutcome.mutate({
                  sourceType: "checkpoint_passed",
                  sourceKey: courseId,
                  eventKey: `chapter-quiz:${courseId}:${lessonIndex}:${currentChapter}`,
                  score: (result.correct / result.total) * 100,
                  certificationId: certId,
                  courseId,
                  lessonIndex,
                  chapterIndex: currentChapter,
                });
                setChapterQuizPassed((prev) => { const next = new Set(Array.from(prev)); next.add(currentChapter); return next; });
                setShowChapterQuiz(false);
                // Advance validated progress (quiz passed = chapter validated)
                setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                setCurrentChapter((p) => p + 1);
                setShowTranscript(false);
              }}
            />
          )}
          </div>

          {/* Video Recommendations - shown on last chapter only */}
          {isLastChapter && !isReviewMode && (
            <VideoRecommendations lesson={lesson} lang={lang} t={t} lessonId={`${courseId}__${lessonIndex}`} certId={certId} />
          )}

                    {/* Chapter navigation */}
          <div className="mt-8 w-full min-w-0 max-w-full border-t border-[#e8e5e0] pt-5 dark:border-slate-700">
            {/* Progress bar */}
            <div className="mb-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs font-medium text-muted-foreground sm:whitespace-nowrap">
                {t({ en: `Screen ${currentChapter + 1} of ${totalChapters}`, fr: `Écran ${currentChapter + 1} sur ${totalChapters}` })}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-[#e8e5e0] dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c75b3a] transition-all duration-300"
                  style={{ width: `${((currentChapter + 1) / totalChapters) * 100}%` }}
                />
              </div>
            </div>
            {/* Navigation buttons with keyboard hints */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCurrentChapter((p) => p - 1); setShowTranscript(false); setShowChapterQuiz(false); }}
                disabled={currentChapter === 0}
                className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground sm:w-auto"
              >
                ← {t({ en: "Previous", fr: "Précédent" })}
              </Button>
              <span className="kbd-hint hidden md:inline-flex">←</span>
            </div>

            {(() => {
              if (isLastChapter && isReviewMode) {
                return (
                  <span className="text-xs text-muted-foreground italic">
                    {t({ en: "End of review", fr: "Fin de la révision" })}
                  </span>
                );
              }
              if (isLastChapter && !isReviewMode) {
                // Gate the last chapter same as others
                const lastChapterVideoKeys = (chapter?.blocks || [])
                  .filter((b: any) => b.type === 'video')
                  .map((b: any) => {
                    let rawId = b.videoId || "";
                    if (!rawId && b.url) { const m = (b.url as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); if (m) rawId = m[1]; }
                    if (!rawId && b.id && typeof b.id === 'string' && b.id.length >= 8 && b.id.length <= 15) rawId = b.id;
                    return typeof rawId === 'object' ? (rawId.fr || rawId.en || "") : rawId;
                  })
                  .filter(Boolean);
                const lastAllVideosWatched = hasOptionalSupplementaryVideos(chapter) || lastChapterVideoKeys.length === 0 || lastChapterVideoKeys.every((k: string) => completedVideos.has(k));
                const lastChapterCloudIds = (chapter?.blocks || []).filter((b: any) => b.type === 'cloud_exercise').map((b: any, i: number) => b.id || `cloud_exercise_${i}`);
                const lastAllCloudDone = lastChapterCloudIds.length === 0 || lastChapterCloudIds.every((id: string) => completedCloudExercises.has(id));
                const lastChapterMatchingIds = (chapter?.blocks || []).filter((b: any) => b.type === 'bucket_sort').map((b: any, i: number) => b.id || `bucket_${i}`);
                const lastAllMatchingDone = lastChapterMatchingIds.length === 0 || lastChapterMatchingIds.every((id: string) => matchingCompleted.has(id));
              const lastChapterSCIds = (chapter?.blocks || []).filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'multi_choice_exercise' || b.type === 'resource_review').map((b: any, i: number) => b.id || `quiz_${i}`);
              const lastAllSCDone = lastChapterSCIds.length === 0 || lastChapterSCIds.every((id: string) => completedExercises.has(id));
              const lastChapterCheckpointIds = (chapter?.blocks || []).filter((b: any) => b.type === 'checkpoint').map((b: any, i: number) => b.exerciseId || `checkpoint_${i}`);
              const lastAllCheckpointsDone = lastChapterCheckpointIds.length === 0 || lastChapterCheckpointIds.every((id: string) => completedExercises.has(id));
                const lastNovasavoIds = (chapter?.blocks || []).filter((block: any) => ["inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback"].includes(block.type)).map((block: any, index: number) => block.id || `novasavo_${index}`);
                const lastAllNovasavoDone = lastNovasavoIds.length === 0 || lastNovasavoIds.every((id: string) => completedNovasavoInteractions.has(id));
                const lastIsGated = !lastAllVideosWatched || !lastAllCloudDone || !lastAllMatchingDone || !lastAllSCDone || !lastAllCheckpointsDone || !lastAllNovasavoDone;
                return (
                  <Button
                    size="sm"
                    disabled={lastIsGated}
                    onClick={() => {
                      // Persist the terminal sentinel before unmounting this
                      // reader through onComplete. This prevents a completed
                      // three-chapter lesson from remaining at 2/3.
                      const completionProgress = getPersistedCompletionProgress(totalChapters);
                      onChapterChange?.(completionProgress.current, completionProgress.total);
                      setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                      onComplete();
                    }}
                    className={lastIsGated ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"}
                    title={lastIsGated ? (lang === 'fr' ? 'Validez toutes les activités pour terminer' : 'Complete all activities to finish') : undefined}
                  >
                    {lastIsGated ? (
                      <>{t({ en: "Complete activities to finish", fr: "Validez les activités pour terminer" })}</>
                    ) : (
                      <>{t({ en: "Complete lesson", fr: "Leçon terminée" })} ✓</>
                    )}
                  </Button>
                );
              }
              // Not last chapter - show Next button with possible gate
              const isQuizOrCheckpointChapter = chapter?.type === 'quiz' || chapter?.type === 'checkpoint';
              const chapterExerciseIds = isQuizOrCheckpointChapter
                ? (chapter?.blocks || []).filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'multi_choice_exercise' || b.type === 'checkpoint').map((b: any, i: number) => b.type === 'checkpoint' ? (b.exerciseId || `checkpoint_${i}`) : (b.id || `quiz_${i}`))
                : [];
              const validationRequired = chapter?.requiredBeforeAdvance !== false;
              const completedChapterExercises = chapterExerciseIds.filter((id: string) => completedExercises.has(id)).length;
              const requiredChapterSuccesses = requiredCorrectAnswers(chapterExerciseIds.length, chapter?.passThreshold);
              const isGatedByExercises = isQuizOrCheckpointChapter && isEvaluationGateLocked({ totalQuestions: chapterExerciseIds.length, completedCorrectAnswers: completedChapterExercises, configuredThreshold: chapter?.passThreshold, required: validationRequired, reviewMode: isReviewMode });
              // Video gate: block Next if current chapter has video blocks that haven't been watched
              const chapterVideoKeys = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'video')
                .map((b: any) => {
                  let rawId = b.videoId || "";
                  if (!rawId && b.url) { const m = (b.url as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); if (m) rawId = m[1]; }
                  if (!rawId && b.id && typeof b.id === 'string' && b.id.length >= 8 && b.id.length <= 15) rawId = b.id;
                  return typeof rawId === 'object' ? (rawId.fr || rawId.en || "") : rawId;
                })
                .filter(Boolean);
              const allVideosWatched = chapterVideoKeys.length === 0 || chapterVideoKeys.every((k: string) => completedVideos.has(k));
              const isGatedByVideo = chapterVideoKeys.length > 0 && !allVideosWatched && !hasOptionalSupplementaryVideos(chapter) && !isReviewMode;
              // Flip cards gate: block if chapter has flip_cards and not all have been flipped
              const chapterHasFlipCards = (chapter?.blocks || []).some((b: any) => b.type === 'flip_cards' && (b.cards || []).length > 0);
              const isGatedByFlipCards = chapterHasFlipCards && !flipCardsCompleted.has(currentChapter) && !isReviewMode;
              // Matching/bucket sort gate: block if chapter has bucket_sort exercises not completed
              const chapterMatchingIds = (chapter?.blocks || [])
                .map((b: any, i: number) => ({ ...b, _blockIdx: i }))
                .filter((b: any) => b.type === 'bucket_sort')
                .map((b: any) => b.id || `bucket_${b._blockIdx}`);
              const allMatchingCompleted = chapterMatchingIds.length === 0 || chapterMatchingIds.every((id: string) => matchingCompleted.has(id));
              const isGatedByMatching = chapterMatchingIds.length > 0 && !allMatchingCompleted && !isReviewMode;
              // Single choice exercise gate for ALL chapters (not just quiz/checkpoint)
              const chapterSingleChoiceIds = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'multi_choice_exercise')
                .map((b: any, i: number) => b.id || `quiz_${i}`);
              const completedSingleChoice = chapterSingleChoiceIds.filter((id: string) => completedExercises.has(id)).length;
              const requiredSingleChoice = isQuizOrCheckpointChapter ? requiredChapterSuccesses : chapterSingleChoiceIds.length;
              const isGatedBySingleChoice = isEvaluationGateLocked({ totalQuestions: chapterSingleChoiceIds.length, completedCorrectAnswers: completedSingleChoice, configuredThreshold: isQuizOrCheckpointChapter ? requiredSingleChoice : chapterSingleChoiceIds.length, required: validationRequired, reviewMode: isReviewMode });
              const chapterResourceReviewIds = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'resource_review')
                .map((b: any, i: number) => b.id || `resource_review_${i}`);
              const isGatedByResourceReview = chapterResourceReviewIds.length > 0 && !chapterResourceReviewIds.every((id: string) => completedExercises.has(id)) && !isReviewMode;
              // Cloud exercise (TP) gate: block if chapter has cloud_exercise blocks not completed
              const chapterCloudExerciseIds = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'cloud_exercise')
                .map((b: any, i: number) => b.id || `cloud_exercise_${i}`);
              const allCloudExercisesCompleted = chapterCloudExerciseIds.length === 0 || chapterCloudExerciseIds.every((id: string) => completedCloudExercises.has(id));
              const isGatedByCloudExercise = chapterCloudExerciseIds.length > 0 && !allCloudExercisesCompleted && !isReviewMode;
              const isGatedByNovasavo = isGatedByNovasavoInteraction;
              const passageConditions = [
                isGatedByVideo && t({ en: "Watch or mark the official video as watched.", fr: "Regardez ou marquez comme vue la vidéo officielle." }),
                isGatedByFlipCards && t({ en: "Turn over every study card.", fr: "Retournez toutes les cartes de révision." }),
                isGatedByMatching && t({ en: "Complete the interactive sorting activity.", fr: "Terminez l’activité de tri interactive." }),
                (isGatedByExercises || isGatedBySingleChoice) && t({ en: "Submit the required validation activity.", fr: "Soumettez l’activité de validation requise." }),
                isGatedByResourceReview && t({ en: "Open and confirm review of the required local resource.", fr: "Ouvrez puis confirmez la consultation de la ressource locale requise." }),
                isGatedByCloudExercise && t({ en: "Submit the practical exercise.", fr: "Soumettez l’exercice pratique." }),
                isGatedByNovasavo && t({ en: "Answer the required inline activity.", fr: "Répondez à l’activité intégrée obligatoire." }),
              ].filter(Boolean);
              const chapterTitle = resolveI18n(chapter?.title, 'en');
              const isStructuralChapter = /^(Module Introduction|Key Takeaways|Module Complete)$/i.test(chapterTitle);
              const isTeachingChapter = chapter?.type === 'teaching' && !isStructuralChapter;
              const needsQuiz = isTeachingChapter && !isReviewMode && !chapterQuizPassed.has(currentChapter) && courseId !== "automatisation_comptable_ia__01";

              const isGated = isGatedByExercises || isGatedByVideo || isGatedByFlipCards || isGatedByMatching || isGatedBySingleChoice || isGatedByResourceReview || isGatedByCloudExercise || isGatedByNovasavo;
              return (
                <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end sm:gap-1.5">
                  {passageConditions.length > 0 && (
                    <p className="w-full max-w-none text-left text-xs leading-relaxed text-muted-foreground sm:max-w-xs sm:text-right" role="status">
                      {t({ en: "To continue: ", fr: "Pour continuer : " })}{passageConditions.join(" ")}
                    </p>
                  )}
                  <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <span className="kbd-hint hidden md:inline-flex">→</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isGated}
                    onClick={() => {
                      if (needsQuiz) {
                        setShowChapterQuiz(true);
                      } else {
                        // Always advance validatedChapter when Next is clicked (it's only clickable when all gates pass)
                        setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                        setCurrentChapter((p) => p + 1);
                        setShowTranscript(false);
                        setShowChapterQuiz(false);
                      }
                    }}
                    className={`w-full justify-center whitespace-normal text-center leading-snug sm:w-auto sm:whitespace-nowrap ${isGated ? 'text-muted-foreground cursor-not-allowed' : 'text-[#c75b3a] hover:text-[#a84a2e]'}`}
                    title={isGatedByVideo ? (lang === 'fr' ? 'Regardez la vidéo pour continuer (ou marquez-la comme vue)' : 'Watch the video to continue (or mark it as watched)') : isGatedByFlipCards ? (lang === 'fr' ? 'Retournez toutes les cartes pour continuer' : 'Flip all cards to continue') : (isGatedByExercises || isGatedBySingleChoice || isGatedByMatching || isGatedByCloudExercise) ? (lang === 'fr' ? 'Validez cette activité pour continuer' : 'Complete this activity to continue') : undefined}
                  >
                    {isGatedByVideo ? (
                      <>{t({ en: "🎥 Watch video to continue", fr: "🎥 Regardez la vidéo pour continuer" })}</>
                    ) : isGatedByFlipCards ? (
                      <>{t({ en: "🃏 Flip all cards to continue", fr: "🃏 Retournez toutes les cartes" })}</>
                    ) : (isGatedByExercises || isGatedBySingleChoice || isGatedByMatching || isGatedByCloudExercise || isGatedByNovasavo) ? (
                      <>{t({ en: "Complete activity to continue", fr: "Validez l'activité pour continuer" })}</>
                    ) : (
                      <>{t({ en: "Next", fr: "Suivant" })} →</>
                    )}
                  </Button>
                </div>
                </div>
              );
            })()}
            </div>
          </div>
        </>
      ) : (
        <LessonQuiz
          certId={certId}
          courseId={courseId}
          lessonIndex={lessonIndex}
          lang={lang}
          t={t}
          onPass={onComplete}
        />
      )}
    </div>
  );
}

// Sidebar content (shared between desktop and mobile drawer)
