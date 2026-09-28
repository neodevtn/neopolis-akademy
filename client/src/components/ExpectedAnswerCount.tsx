import { ListChecks } from "lucide-react";
import {
  answerSelectionProgressLabel,
  expectedAnswerCountLabel,
  type AssessmentLanguage,
} from "@shared/expectedAnswerCount";

export function ExpectedAnswerCount({
  count,
  lang,
  selected,
  className = "",
}: {
  count: number;
  lang: AssessmentLanguage;
  selected?: number;
  className?: string;
}) {
  const label = expectedAnswerCountLabel(count, lang);
  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100 ${className}`}
      role="note"
      aria-label={label}
    >
      <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {typeof selected === "number" && count > 1 && (
        <span className="font-normal text-sky-700 dark:text-sky-300" aria-live="polite">
          · {answerSelectionProgressLabel(selected, count, lang)}
        </span>
      )}
    </div>
  );
}
