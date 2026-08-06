import { AlertCircle, Lightbulb, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface CalloutBlockProps {
  block: any;
  lang: string;
}

const VARIANTS: Record<string, { icon: any; bg: string; border: string; text: string; title: string }> = {
  info: { icon: AlertCircle, bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-200", title: "Info" },
  tip: { icon: Lightbulb, bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-200", title: "Tip" },
  warning: { icon: AlertTriangle, bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-800 dark:text-orange-200", title: "Warning" },
  danger: { icon: ShieldAlert, bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-200", title: "Danger" },
  success: { icon: CheckCircle2, bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-800 dark:text-green-200", title: "Success" },
};

export function CalloutBlock({ block, lang }: CalloutBlockProps) {
  const variant = VARIANTS[block.variant] || VARIANTS.info;
  const Icon = variant.icon;
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const body = typeof block.body === "object" ? (block.body[lang] || block.body.en || "") : (block.body || "");

  return (
    <div className={`my-4 rounded-lg border ${variant.border} ${variant.bg} p-4`}>
      <div className={`flex items-start gap-3 ${variant.text}`}>
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{body}</div>
        </div>
      </div>
    </div>
  );
}
