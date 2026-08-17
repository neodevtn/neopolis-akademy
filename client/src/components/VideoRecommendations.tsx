import { useMemo, useState } from 'react';
import { ExternalLink, Play, BookOpen, Lightbulb, Tv, Flag, X, AlertTriangle, Clock, LinkIcon, HelpCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export type RecommendationType = 'tutorial' | 'deep_dive' | 'complementary' | 'masterclass';

export interface RecommendedVideo {
  videoId: string;
  title: string;
  channel: string;
  type: RecommendationType;
  topics: string[];
}

interface I18nText { en?: string; fr?: string; }
interface VideoRecommendationsProps {
  lesson: {
    title?: I18nText | string;
    chapters?: Array<{ title?: I18nText | string; blocks?: Array<{ type?: string; title?: I18nText | string; body?: I18nText | string }> }>;
    recommendedVideos?: RecommendedVideo[];
  };
  lang: string;
  t: (i18n: { en: string; fr: string }) => string;
  lessonId?: string;
  certId?: string;
}
type FeedbackReason = 'not_relevant' | 'obsolete' | 'broken_link' | 'other';

function resolveText(value: I18nText | string | undefined, lang: string): string {
  if (!value) return '';
  return typeof value === 'string' ? value : (lang === 'fr' ? value.fr : value.en) || value.en || value.fr || '';
}

function getLessonText(lesson: VideoRecommendationsProps['lesson'], lang: string) {
  return [
    resolveText(lesson.title, lang),
    ...(lesson.chapters || []).flatMap((chapter) => [
      resolveText(chapter.title, lang),
      ...(chapter.blocks || []).slice(0, 3).flatMap((block) => [resolveText(block.title, lang), resolveText(block.body, lang).slice(0, 200)]),
    ]),
  ].join(' ').toLowerCase();
}

/** Deterministic fallback used only for legacy modules not yet explicitly curated by an administrator. */
export function selectRecommendedVideos(lessonText: string, catalog: RecommendedVideo[], aliases: Record<string, string[]>, limit = 3): RecommendedVideo[] {
  const keywords = lessonText.split(/[\s,.\-_:;/()[\]{}]+/).filter((word) => word.length > 2);
  return catalog
    .map((video) => {
      let score = video.type === 'tutorial' ? 2 : video.type === 'masterclass' ? 1 : 0;
      for (const [topic, terms] of Object.entries(aliases)) {
        if (terms.some((term) => lessonText.includes(term)) && video.topics.some((tag) => tag.includes(topic) || terms.some((term) => tag.includes(term)))) score += 10;
      }
      for (const keyword of keywords) {
        if (video.topics.some((tag) => tag.includes(keyword))) score += 2;
        if (video.title.toLowerCase().includes(keyword)) score += 1;
      }
      return { video, score };
    })
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score || a.video.title.localeCompare(b.video.title))
    .slice(0, limit)
    .map(({ video }) => video);
}

function getTypeBadge(type: RecommendationType, t: VideoRecommendationsProps['t']) {
  if (type === 'tutorial') return { label: t({ en: 'Tutorial', fr: 'Tutoriel' }), icon: Play, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (type === 'deep_dive') return { label: t({ en: 'Deep Dive', fr: 'Approfondissement' }), icon: BookOpen, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  if (type === 'masterclass') return { label: t({ en: 'Masterclass', fr: 'Masterclass' }), icon: Tv, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
  return { label: t({ en: 'Complementary', fr: 'Complémentaire' }), icon: Lightbulb, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
}

function FeedbackPopover({ videoId, videoTitle, lessonId, certId, t, onDismissed }: {
  videoId: string; videoTitle: string; lessonId: string; certId: string; t: VideoRecommendationsProps['t']; onDismissed: (videoId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const submitMutation = trpc.videoFeedback.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.alreadyReported ? t({ en: 'You already reported this video', fr: 'Vous avez déjà signalé cette vidéo' }) : t({ en: 'Thank you for your feedback! This video will be hidden.', fr: 'Merci pour votre retour ! Cette vidéo sera masquée.' }));
      onDismissed(videoId); setIsOpen(false); setSelectedReason(null);
    },
    onError: () => toast.error(t({ en: 'Failed to submit feedback. Please try again.', fr: 'Échec de l’envoi. Veuillez réessayer.' })),
  });
  const reasons: { value: FeedbackReason; label: string; icon: typeof Flag }[] = [
    { value: 'not_relevant', label: t({ en: 'Not relevant to this lesson', fr: 'Pas pertinent pour cette leçon' }), icon: Flag },
    { value: 'obsolete', label: t({ en: 'Outdated / Obsolete content', fr: 'Contenu obsolète / dépassé' }), icon: Clock },
    { value: 'broken_link', label: t({ en: 'Broken link / Video unavailable', fr: 'Lien cassé / Vidéo indisponible' }), icon: LinkIcon },
    { value: 'other', label: t({ en: 'Other reason', fr: 'Autre raison' }), icon: HelpCircle },
  ];
  return <div className="relative" onClick={(event) => event.preventDefault()}>
    <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsOpen(!isOpen); }} className="rounded-md p-1 text-muted-foreground/60 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-900/20" title={t({ en: 'Report this video', fr: 'Signaler cette vidéo' })} aria-label={t({ en: 'Report this video', fr: 'Signaler cette vidéo' })}><Flag className="h-3.5 w-3.5" /></button>
    {isOpen && <><div className="fixed inset-0 z-40" onClick={(event) => { event.preventDefault(); setIsOpen(false); }} /><div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
      <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-semibold"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />{t({ en: 'Report Video', fr: 'Signaler la vidéo' })}</span><button type="button" onClick={() => setIsOpen(false)} className="rounded p-0.5 hover:bg-muted"><X className="h-3.5 w-3.5" /></button></div>
      <p className="mb-2 line-clamp-1 text-[10px] italic text-muted-foreground">{videoTitle}</p>
      <div className="mb-3 space-y-1.5">{reasons.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setSelectedReason(value)} className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] ${selectedReason === value ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' : 'border-transparent hover:bg-muted'}`}><Icon className="h-3.5 w-3.5 shrink-0" />{label}</button>)}</div>
      <button type="button" disabled={!selectedReason || submitMutation.isPending} onClick={() => selectedReason && submitMutation.mutate({ videoId, lessonId, certId, reason: selectedReason })} className="w-full rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40">{submitMutation.isPending ? t({ en: 'Sending...', fr: 'Envoi...' }) : t({ en: 'Submit Report', fr: 'Envoyer le signalement' })}</button>
    </div></>}
  </div>;
}

export function VideoRecommendations({ lesson, lang, t, lessonId, certId }: VideoRecommendationsProps) {
  const [dismissedVideos, setDismissedVideos] = useState<Set<string>>(new Set());
  const catalogQuery = trpc.videoRecommendations.getCatalog.useQuery();
  const feedbackQuery = trpc.videoFeedback.getMyFeedback.useQuery({ certId: certId || '' }, { enabled: !!certId });
  const selectedVideos = useMemo(() => {
    const explicit = Array.isArray(lesson.recommendedVideos) ? lesson.recommendedVideos : [];
    if (explicit.length > 0) return explicit;
    if (!catalogQuery.data) return [];
    return selectRecommendedVideos(getLessonText(lesson, lang), catalogQuery.data.videos, catalogQuery.data.topicAliases);
  }, [catalogQuery.data, lang, lesson]);
  const reportedIds = new Set((feedbackQuery.data || []).map((item) => item.videoId).concat(Array.from(dismissedVideos)));
  const visibleVideos = selectedVideos.filter((video) => !reportedIds.has(video.videoId));
  if (catalogQuery.isLoading && !lesson.recommendedVideos?.length) return null;
  if (visibleVideos.length === 0) return null;

  return <section className="mb-4 mt-8 px-1" aria-label={t({ en: 'Recommended Videos', fr: 'Vidéos recommandées' })}>
    <div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c75b3a]/10 dark:bg-[#c75b3a]/20"><Tv className="h-4 w-4 text-[#c75b3a]" /></div><div><h3 className="text-sm font-semibold text-foreground">{t({ en: 'Recommended Videos', fr: 'Vidéos recommandées' })}</h3><p className="text-xs text-muted-foreground">{lesson.recommendedVideos?.length ? t({ en: 'Selected for this module by the training team', fr: 'Sélectionnées par l’équipe pédagogique pour ce module' }) : t({ en: 'Complementary resources matched to this module', fr: 'Ressources complémentaires associées à ce module' })}</p></div></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleVideos.map((video) => {
      const badge = getTypeBadge(video.type, t); const BadgeIcon = badge.icon;
      return <a key={video.videoId} href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-border/50 bg-card/50 transition-all duration-200 hover:border-[#c75b3a]/30 hover:bg-card hover:shadow-md"><div className="relative aspect-video overflow-hidden bg-muted"><img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"><Play className="ml-0.5 h-5 w-5 text-[#c75b3a]" fill="currentColor" /></div></div><div className={`absolute left-2 top-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${badge.color}`}><BadgeIcon className="h-3 w-3" />{badge.label}</div></div><div className="p-3"><h4 className="line-clamp-2 text-xs font-medium leading-tight text-foreground transition-colors group-hover:text-[#c75b3a]">{video.title}</h4><div className="mt-2 flex items-center justify-between"><span className="max-w-[60%] truncate text-[10px] text-muted-foreground">{video.channel}</span><div className="flex items-center gap-1">{lessonId && certId && <FeedbackPopover videoId={video.videoId} videoTitle={video.title} lessonId={lessonId} certId={certId} t={t} onDismissed={(videoId) => setDismissedVideos((current) => new Set(Array.from(current).concat(videoId)))} />}<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-[#c75b3a]" /></div></div></div></a>;
    })}</div>
  </section>;
}

export default VideoRecommendations;
