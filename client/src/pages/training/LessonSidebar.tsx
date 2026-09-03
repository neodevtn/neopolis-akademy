
import React from "react";
import { CheckCircle2, Lock, PlayCircle, ChevronRight, BookOpen, Video, Brain, Target, Trophy, GraduationCap, Check, Download, Eye } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { resolveI18n } from "./contentDetectors";
import { normalizeChapterProgress } from "./chapterProgress";
import { useAuth } from "@/_core/hooks/useAuth";
import { isSequentialLessonLocked } from "@shared/learningAccess";
import { canBypassLearningSequence } from "@shared/roles";

export function LessonSidebarContent({
  lessons,
  lang,
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  videos,
  activeLessonIndex,
  onLessonClick,
  chapterProgress,
  displayedLessonIndex,
  onScreenClick: _onScreenClick,
  activeScreenIndex: _activeScreenIndex,
  chaptersData,
  sections,
}: {
  lessons: any[];
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  nextUnlocked: number;
  isLessonComplete: (courseId: string, idx: number) => boolean;
  courseId: string;
  videos: any[];
  activeLessonIndex: number | null;
  onLessonClick: (idx: number) => void;
  chapterProgress: { current: number; total: number } | null;
  displayedLessonIndex: number;
  onScreenClick?: (chapterIdx: number, screenIdx: number) => void;
  activeScreenIndex?: number;
  chaptersData?: any[];
  sections?: any[];
}) {
  const { user } = useAuth();
  const safeChapterProgress = normalizeChapterProgress(chapterProgress);
  const isNovasavoCourse = courseId === "automatisation_comptable_ia__01";
  const navigableLessons = isNovasavoCourse ? lessons.filter((lesson) => lesson.id !== "novasavo_final_exam") : lessons;
  const safeChapterTotal = safeChapterProgress.total;
  const safeChapterCurrent = safeChapterProgress.current;
  // Calculate overall progress percentage
  const completedCount = navigableLessons.filter((_, idx) => isLessonComplete(courseId, idx)).length;
  const activeUnitFraction = isNovasavoCourse && safeChapterTotal > 0 && displayedLessonIndex < navigableLessons.length
    ? Math.min(1, (safeChapterCurrent + 1) / safeChapterTotal)
    : 0;
  const progressPct = isNovasavoCourse
    ? Math.round(Math.min(100, ((Math.min(completedCount, navigableLessons.length) + activeUnitFraction) / Math.max(1, navigableLessons.length)) * 100))
    : lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Build section boundaries: map lesson index -> section title to show BEFORE it
  const sectionBoundaries: Record<number, string> = {};
  if (sections && sections.length > 0) {
    const genericTitles = new Set(['module introduction', 'module complete', 'key takeaways']);
    let searchFrom = 0;
    for (const section of sections) {
      const sectionTitle = section.title ? (typeof section.title === 'object' ? resolveI18n(section.title, lang) : section.title) : '';
      const sectionLessons = section.lessons || [];
      if (sectionLessons.length > 0) {
        // Find the first non-generic lesson title in this section for boundary matching
        const uniqueTitle = sectionLessons.find((t: string) => t && !genericTitles.has(t.toLowerCase()));
        let foundIdx = -1;
        if (uniqueTitle) {
          // Search from expected position to handle repeated titles
          for (let i = searchFrom; i < lessons.length; i++) {
            const lt = lessons[i].title ? (typeof lessons[i].title === 'object' ? resolveI18n(lessons[i].title, 'en') : lessons[i].title) : '';
            if (lt && uniqueTitle && lt.toLowerCase() === uniqueTitle.toLowerCase()) {
              // The section starts at the first lesson before this unique one (could be Module Introduction)
              foundIdx = Math.max(searchFrom, i - sectionLessons.indexOf(uniqueTitle));
              break;
            }
          }
        }
        if (foundIdx >= 0) {
          sectionBoundaries[foundIdx] = sectionTitle;
          searchFrom = foundIdx + sectionLessons.length;
        } else {
          // Fallback: use sequential position
          sectionBoundaries[searchFrom] = sectionTitle;
          searchFrom += sectionLessons.length;
        }
      } else {
        // No lessons array - use sequential assignment
        sectionBoundaries[searchFrom] = sectionTitle;
      }
    }
  }

  return (
    <div className="p-3 space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-muted-foreground">
        {isNovasavoCourse ? t({ en: "Units and final exam", fr: "Unités et examen final" }) : t({ en: "Progress", fr: "Progression" })}
      </p>
      {lessons.map((lesson, idx) => {
        const completed = isLessonComplete(courseId, idx);
        const isCurrent = (idx === nextUnlocked && !completed) || (canBypassLearningSequence(user?.role) && activeLessonIndex === idx && !completed);
        const isLocked = isSequentialLessonLocked({ lessonIndex: idx, nextUnlocked, role: user?.role });
        const isActive = activeLessonIndex === idx;

        let statusIcon: React.ReactNode;
        let bgClass = "";
        let textClass = "text-muted-foreground";

        if (completed) {
          statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          textClass = "text-foreground";
        } else if (isCurrent) {
          statusIcon = (
            <div className="w-4 h-4 rounded-full bg-primary shrink-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          );
          bgClass = "bg-primary/5 border border-primary/30";
          textClass = "text-foreground";
        } else if (isLocked) {
          statusIcon = <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
          textClass = "text-muted-foreground";
        } else {
          statusIcon = <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />;
        }

        // Override bg for active review item
        if (isActive && completed) {
          bgClass = "bg-amber-500/10 border border-amber-500/30";
        }

        // Check if this lesson has a matching video
        const lessonTitle = (resolveI18n(lesson.title, "en") || "").toLowerCase().trim();
        const hasVideo = videos.some((v: any) => (resolveI18n(v.title, "en") || "").toLowerCase().trim() === lessonTitle);
        
        // Determine chapter/lesson type icon
        const chType = lesson.chapterType || '';
        const hasBucketSort = lesson.hasBucketSort || false;
        const lessonTitleEn = (resolveI18n(lesson.title, "en") || "").toLowerCase();
        const isModuleComplete = lessonTitleEn.includes('module complete') || lessonTitleEn.includes('module terminé');
        const isKeyTakeaways = lessonTitleEn.includes('key takeaway') || lessonTitleEn.includes('points clés');
        
        // Detect lesson content types from blocks
        const lessonBlocks = (lesson.chapters || []).flatMap((ch: any) => (ch.blocks || []).map((b: any) => b.type || ''));
        const hasFlipCards = lessonBlocks.includes('flip_cards');
        const hasDownload = lessonBlocks.includes('download');
        const hasCheckpoint = lessonBlocks.includes('checkpoint');
        const hasTabbedContent = lessonBlocks.includes('tabbed_content');
        const hasExerciseBlock = lessonBlocks.includes('single_choice_exercise');
        
        let typeIcon: React.ReactNode;
        if (chType === 'quiz' || lessonTitleEn.includes('quiz')) {
          typeIcon = <Brain className="w-3 h-3 text-purple-500 shrink-0" />;
        } else if (chType === 'exercise' || hasExerciseBlock || hasBucketSort) {
          typeIcon = <Target className="w-3 h-3 text-orange-500 shrink-0" />;
        } else if (hasVideo || lesson.hasVideo) {
          typeIcon = <Video className="w-3 h-3 text-red-400 shrink-0" />;
        } else if (isModuleComplete) {
          typeIcon = <Trophy className="w-3 h-3 text-amber-500 shrink-0" />;
        } else if (isKeyTakeaways) {
          typeIcon = <GraduationCap className="w-3 h-3 text-emerald-500 shrink-0" />;
        } else if (hasCheckpoint && !hasFlipCards && !hasTabbedContent) {
          typeIcon = <Check className="w-3 h-3 text-blue-500 shrink-0" />;
        } else if (hasDownload) {
          typeIcon = <Download className="w-3 h-3 text-indigo-500 shrink-0" />;
        } else {
          typeIcon = <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />;
        }

        // Clickable if completed or current
        const isClickable = completed || isCurrent || !isLocked;

        // Get sub-screens (blocks) for this chapter when it's the active one
        const showSubScreens = isActive && chaptersData && chaptersData[idx];
        const _chapterBlocks = showSubScreens ? (chaptersData[idx]?.blocks || []) : [];

        return (
          <div key={lesson.id ? `${lesson.id}_${idx}` : `lesson_${idx}`}>
            {sectionBoundaries[idx] && (
              <p className="text-xs font-bold uppercase tracking-wider px-3 pt-4 pb-1 text-primary/80 border-t border-border/50 mt-2">
                {sectionBoundaries[idx]}
              </p>
            )}
            <button
              onClick={() => isClickable && onLessonClick(idx)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${bgClass} ${isLocked ? "opacity-50 cursor-not-allowed" : ""} ${isClickable && !isActive ? "hover:bg-secondary/50 cursor-pointer" : ""}`}
            >
              {statusIcon}
              <span className={`truncate font-medium ${textClass}`} title={resolveI18n(lesson.title, lang)}>
                {resolveI18n(lesson.title, lang)}
              </span>
              {typeIcon && (
                <span className="shrink-0 ml-auto flex items-center">
                  {typeIcon}
                </span>
              )}
              {!typeIcon && hasVideo && (
                <Video className="w-3.5 h-3.5 text-red-400 shrink-0 ml-auto" />
              )}
              {isActive && completed && !typeIcon && (
                <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-auto" />
              )}
            </button>

            {/* Chapter progress indicator for the currently displayed lesson (non-sub-screen mode) */}
            {idx === displayedLessonIndex && chapterProgress && safeChapterTotal > 1 && !completed && (
              <div className="ml-7 mr-3 mt-0.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex gap-0.5">
                    {Array.from({ length: safeChapterTotal }).map((_, ci) => (
                      <div
                        key={ci}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          ci < safeChapterCurrent
                            ? "bg-emerald-500"
                            : ci === safeChapterCurrent
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {safeChapterCurrent > 0 && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {safeChapterCurrent + 1}/{safeChapterTotal}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {/* Progress footer */}
      <div className="mt-4 pt-3 border-t border-border px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t({ en: "PROGRESS", fr: "PROGRESSION" })} {progressPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-[#c75b3a] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Sidebar component with Sheet for mobile, sticky aside for desktop
export default function LessonSidebar({
  lessons,
  lang,
  t,
  nextUnlocked,
  isLessonComplete,
  courseId,
  sidebarOpen,
  onClose,
  videos,
  activeLessonIndex,
  onLessonClick,
  chapterProgress,
  displayedLessonIndex,
  onScreenClick,
  activeScreenIndex,
  chaptersData,
  sections,
}: {
  lessons: any[];
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  nextUnlocked: number;
  isLessonComplete: (courseId: string, idx: number) => boolean;
  courseId: string;
  sidebarOpen: boolean;
  onClose: () => void;
  videos: any[];
  activeLessonIndex: number | null;
  onLessonClick: (idx: number) => void;
  chapterProgress: { current: number; total: number } | null;
  displayedLessonIndex: number;
  onScreenClick?: (chapterIdx: number, screenIdx: number) => void;
  activeScreenIndex?: number;
  chaptersData?: any[];
  sections?: any[];
}) {
  const sidebarContent = (
    <LessonSidebarContent
      lessons={lessons}
      lang={lang}
      t={t}
      nextUnlocked={nextUnlocked}
      isLessonComplete={isLessonComplete}
      courseId={courseId}
      videos={videos}
      activeLessonIndex={activeLessonIndex}
      onLessonClick={(idx) => { onLessonClick(idx); onClose(); }}
      chapterProgress={chapterProgress}
      displayedLessonIndex={displayedLessonIndex}
      onScreenClick={onScreenClick}
      activeScreenIndex={activeScreenIndex}
      chaptersData={chaptersData}
      sections={sections}
    />
  );

  return (
    <>
      {/* Mobile drawer using Sheet */}
      <div className="lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">
                {courseId === "automatisation_comptable_ia__01" ? t({ en: "Units and final exam", fr: "Unités et examen final" }) : t({ en: "Lessons", fr: "Leçons" })}
              </span>
            </div>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-72 overflow-y-auto bg-card border-r border-border">
        {sidebarContent}
      </aside>
    </>
  );
}
