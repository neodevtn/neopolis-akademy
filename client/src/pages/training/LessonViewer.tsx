
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Video, Download, Timer, Eye, FileText, ChevronDown, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchingExercise } from "@/components/MatchingExercise";
import { SingleChoiceExercise } from "@/components/SingleChoiceExercise";
import { ChapterQuiz } from "@/components/ChapterQuiz";
import { VideoRecommendations } from "@/components/VideoRecommendations";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { trpc } from "@/lib/trpc";
import { resolveI18n } from "./contentDetectors";
import { ExerciseRenderer } from "@/components/ExerciseRenderer";
import { FlipCardsGrid } from "@/components/FlipCard";
import { TabbedContent } from "@/components/TabbedContent";
import { ComparisonBox } from "@/components/ComparisonBox";
import { CourseIllustration } from "@/components/CourseIllustration";
import PageContent from "./PageContent";
import LessonQuiz from "./LessonQuiz";
import NumericAnswerExercise from "@/components/NumericAnswerExercise";

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
  initialChapter,
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
  initialChapter?: number;
}) {
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
  // Track whether we're syncing from parent to avoid calling onChapterChange back
  const isSyncingFromParent = useRef(false);
  const prevLessonId = useRef(lesson.id);
  // Track navigation direction for slide-in animation
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

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
      setSlideDirection(initialChapter > currentChapter ? 'right' : 'left');
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
          const videoKeys = blocks.filter((b: any) => b.type === 'video').map((b: any) => { let rawId = b.videoId || ''; if (!rawId && b.url) { const m = (b.url as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); if (m) rawId = m[1]; } if (!rawId && b.id && typeof b.id === 'string' && b.id.length >= 8 && b.id.length <= 15) rawId = b.id; return typeof rawId === 'object' ? (rawId.fr || rawId.en || '') : rawId; }).filter(Boolean);
          if (videoKeys.length > 0 && !videoKeys.every((k: string) => completedVideos.has(k))) return;
          // Flip cards gate
          const hasFlips = blocks.some((b: any) => b.type === 'flip_cards' && (b.cards || []).length > 0);
          if (hasFlips && !flipCardsCompleted.has(currentChapter)) return;
          // Matching gate
          const matchIds = blocks.filter((b: any) => b.type === 'bucket_sort').map((b: any, i: number) => b.id || `bucket_${i}`);
          if (matchIds.length > 0 && !matchIds.every((id: string) => matchingCompleted.has(id))) return;
          // Single choice exercise gate
          const scIds = blocks.filter((b: any) => b.type === 'single_choice_exercise').map((b: any, i: number) => b.id || `quiz_${i}`);
          if (scIds.length > 0 && !scIds.every((id: string) => completedExercises.has(id))) return;
        }
        setSlideDirection('right');
        setCurrentChapter(p => p + 1);
      } else if (e.key === 'ArrowLeft' && currentChapter > 0) {
        setSlideDirection('left');
        setCurrentChapter(p => p - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, isLastChapter, completedVideos, flipCardsCompleted, matchingCompleted, completedExercises, isReviewMode, chapters]);

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
        return (
          <div key={blockIdx} className="py-1">
            <PageContent content={text} lang={lang} />
          </div>
        );
      }
      case "video": {
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
        // Calculate question number within this chapter
        const chapterBlocks = chapter?.blocks || [];
        const quizBlocksBefore = chapterBlocks.slice(0, blockIdx).filter((b: any) => b.type === 'single_choice_exercise').length;
        return (
          <SingleChoiceExercise
            key={blockIdx}
            id={exerciseId}
            question={question}
            options={options}
            correctAnswer={correctAnswer}
            explanation={explanation}
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
      default:
        return null;
    }
  };

  // Slide-in animation variants
  const slideEase = [0.23, 1, 0.32, 1] as [number, number, number, number];
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: slideEase },
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.2, ease: slideEase },
    }),
  };

  return (
    <div className="mt-2">
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
        <div className="flex items-center gap-3 max-w-3xl mx-auto px-4">
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
          <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`chapter-${currentChapter}`}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
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
          {chapter && (() => {
            // Detect if this screen is sparse (little content) to show illustration
            const allBlocks = chapter.blocks || [];
            const contentBlocks = allBlocks.filter((b: any) => b.type === 'content');
            const hasVideo = allBlocks.some((b: any) => b.type === 'video');
            const hasExercise = allBlocks.some((b: any) => b.type === 'exercise' || b.type === 'quiz' || b.type === 'checkpoint');
            const hasBucketSort = allBlocks.some((b: any) => b.type === 'bucket_sort');
            const hasFlipCards = allBlocks.some((b: any) => b.type === 'flip_cards');
            const hasMatching = allBlocks.some((b: any) => b.type === 'matching');
            const hasInteractive = hasVideo || hasExercise || hasBucketSort || hasFlipCards || hasMatching;
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
            return (
              <div className="space-y-8">
                {isSparse && (
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
                {allBlocks.map((block: any, idx: number) => renderBlock(block, idx))}
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
              onPass={() => {
                setChapterQuizPassed((prev) => { const next = new Set(Array.from(prev)); next.add(currentChapter); return next; });
                setShowChapterQuiz(false);
                // Advance validated progress (quiz passed = chapter validated)
                setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                setSlideDirection('right');
                setCurrentChapter((p) => p + 1);
                setShowTranscript(false);
              }}
            />
          )}
          </motion.div>
          </AnimatePresence>

          {/* Video Recommendations - shown on last chapter only */}
          {isLastChapter && !isReviewMode && (
            <VideoRecommendations lesson={lesson} lang={lang} t={t} lessonId={`${courseId}__${lessonIndex}`} certId={certId} />
          )}

                    {/* Chapter navigation */}
          <div className="mt-8 pt-5 border-t border-[#e8e5e0] dark:border-slate-700">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
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
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSlideDirection('left'); setCurrentChapter((p) => p - 1); setShowTranscript(false); setShowChapterQuiz(false); }}
                disabled={currentChapter === 0}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
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
                return (
                  <Button
                    size="sm"
                    onClick={() => setShowQuiz(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                  >
                    {t({ en: "Take Quiz", fr: "Passer le quiz" })}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                );
              }
              // Not last chapter - show Next button with possible gate
              const isQuizOrCheckpointChapter = chapter?.type === 'quiz' || chapter?.type === 'checkpoint';
              const chapterExerciseIds = isQuizOrCheckpointChapter
                ? (chapter?.blocks || []).filter((b: any) => b.type === 'single_choice_exercise' || b.type === 'checkpoint').map((b: any, i: number) => b.type === 'checkpoint' ? (b.exerciseId || `checkpoint_${i}`) : (b.id || `quiz_${i}`))
                : [];
              const allExercisesCompleted = chapterExerciseIds.length === 0 || chapterExerciseIds.every((id: string) => completedExercises.has(id));
              const isGatedByExercises = isQuizOrCheckpointChapter && chapterExerciseIds.length > 0 && !allExercisesCompleted && !isReviewMode;
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
              const isGatedByVideo = chapterVideoKeys.length > 0 && !allVideosWatched && !isReviewMode;
              // Flip cards gate: block if chapter has flip_cards and not all have been flipped
              const chapterHasFlipCards = (chapter?.blocks || []).some((b: any) => b.type === 'flip_cards' && (b.cards || []).length > 0);
              const isGatedByFlipCards = chapterHasFlipCards && !flipCardsCompleted.has(currentChapter) && !isReviewMode;
              // Matching/bucket sort gate: block if chapter has bucket_sort exercises not completed
              const chapterMatchingIds = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'bucket_sort')
                .map((b: any, i: number) => b.id || `bucket_${i}`);
              const allMatchingCompleted = chapterMatchingIds.length === 0 || chapterMatchingIds.every((id: string) => matchingCompleted.has(id));
              const isGatedByMatching = chapterMatchingIds.length > 0 && !allMatchingCompleted && !isReviewMode;
              // Single choice exercise gate for ALL chapters (not just quiz/checkpoint)
              const chapterSingleChoiceIds = (chapter?.blocks || [])
                .filter((b: any) => b.type === 'single_choice_exercise')
                .map((b: any, i: number) => b.id || `quiz_${i}`);
              const allSingleChoiceCompleted = chapterSingleChoiceIds.length === 0 || chapterSingleChoiceIds.every((id: string) => completedExercises.has(id));
              const isGatedBySingleChoice = chapterSingleChoiceIds.length > 0 && !allSingleChoiceCompleted && !isReviewMode;
              const chapterTitle = resolveI18n(chapter?.title, 'en');
              const isStructuralChapter = /^(Module Introduction|Key Takeaways|Module Complete)$/i.test(chapterTitle);
              const isTeachingChapter = chapter?.type === 'teaching' && !isStructuralChapter;
              const needsQuiz = isTeachingChapter && !isReviewMode && !chapterQuizPassed.has(currentChapter);

              const isGated = isGatedByExercises || isGatedByVideo || isGatedByFlipCards || isGatedByMatching || isGatedBySingleChoice;
              return (
                <div className="flex items-center gap-2">
                  <span className="kbd-hint hidden md:inline-flex">→</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isGated}
                    onClick={() => {
                      if (needsQuiz) {
                        setShowChapterQuiz(true);
                      } else {
                        if (isQuizOrCheckpointChapter && allExercisesCompleted) {
                          setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                        } else if (isStructuralChapter || (!isTeachingChapter && !isQuizOrCheckpointChapter)) {
                          setValidatedChapter((prev) => Math.max(prev, currentChapter + 1));
                        }
                        setSlideDirection('right');
                        setCurrentChapter((p) => p + 1);
                        setShowTranscript(false);
                        setShowChapterQuiz(false);
                      }
                    }}
                    className={`gap-1 font-medium ${isGated ? 'text-muted-foreground cursor-not-allowed' : 'text-[#c75b3a] hover:text-[#a84a2e]'}`}
                    title={isGatedByVideo ? (lang === 'fr' ? 'Regardez la vidéo pour continuer (ou marquez-la comme vue)' : 'Watch the video to continue (or mark it as watched)') : isGatedByFlipCards ? (lang === 'fr' ? 'Retournez toutes les cartes pour continuer' : 'Flip all cards to continue') : (isGatedByExercises || isGatedBySingleChoice || isGatedByMatching) ? (lang === 'fr' ? 'Complétez tous les exercices pour continuer' : 'Complete all exercises to continue') : undefined}
                  >
                    {isGatedByVideo ? (
                      <>{t({ en: "🎥 Watch video to continue", fr: "🎥 Regardez la vidéo pour continuer" })}</>
                    ) : isGatedByFlipCards ? (
                      <>{t({ en: "🃏 Flip all cards to continue", fr: "🃏 Retournez toutes les cartes" })}</>
                    ) : (isGatedByExercises || isGatedBySingleChoice || isGatedByMatching) ? (
                      <>{t({ en: "Complete all exercises", fr: "Complétez les exercices" })}</>
                    ) : (
                      <>{t({ en: "Next", fr: "Suivant" })} →</>
                    )}
                  </Button>
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
