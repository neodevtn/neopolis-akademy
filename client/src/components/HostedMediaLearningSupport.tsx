import React from "react";
import PageContent from "@/pages/training/PageContent";

export function localizedMediaText(value: unknown, lang: string): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const resolved = record[lang] || record.en || record.fr;
  return typeof resolved === "string" ? resolved : "";
}

/** An explicit hosted-video source must not be hidden behind legacy Projector slides. */
export function shouldUseProjector(block: any): boolean {
  return block?.sourceType !== "video" && block?.sourceType !== "hls"
    && Array.isArray(block?.projectorSlides) && block.projectorSlides.length > 0
    && Array.isArray(block?.projectorTimings);
}

/** The same learner-facing metadata and French alternative are available for every media provider. */
export function HostedMediaLearningSupport({ block, lang }: { block: any; lang: string }) {
  const objective = localizedMediaText(block?.objectiveBefore, lang);
  const alternative = lang === "fr" ? localizedMediaText(block?.alternativeTextFr, "fr") : "";
  const language = ({ fr: "Français", en: "English", ar: "العربية", multi: lang === "fr" ? "Multilingue" : "Multilingual" } as Record<string, string>)[block?.videoLanguage];
  const duration = Number(block?.durationSeconds);
  if (!objective && !alternative && !language && !(duration > 0)) return null;
  return (
    <div className="space-y-3 p-4 text-sm" data-testid="hosted-media-learning-support">
      {(language || duration > 0) && (
        <p className="text-xs text-muted-foreground">
          {language && <span>{lang === "fr" ? "Langue du média" : "Media language"} : {language}</span>}
          {language && duration > 0 && <span> · </span>}
          {duration > 0 && <span>{lang === "fr" ? "Durée" : "Duration"} : {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}</span>}
        </p>
      )}
      {objective && <div><p className="mb-1 font-semibold">{lang === "fr" ? "Objectif de lecture" : "Playback objective"}</p><PageContent content={objective} lang={lang} /></div>}
      {alternative && (
        <details className="rounded-lg border border-border bg-muted/20">
          <summary className="cursor-pointer px-3 py-2 font-medium">Alternative textuelle française</summary>
          <div className="px-3 pb-3"><PageContent content={alternative} lang="fr" /></div>
        </details>
      )}
    </div>
  );
}
