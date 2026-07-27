import { XCircle, CheckCircle2 } from 'lucide-react';

interface ComparisonItem {
  variant: 'wrong' | 'right';
  label: { en: string; fr: string };
  content: { en: string; fr: string };
}

interface ComparisonBoxProps {
  items: ComparisonItem[];
  conclusion?: { en: string; fr: string };
  lang: 'en' | 'fr';
}

export function ComparisonBox({ items, conclusion, lang }: ComparisonBoxProps) {
  return (
    <div className="my-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const isWrong = item.variant === 'wrong';
          return (
            <div
              key={idx}
              className={`
                rounded-xl border-2 p-5 transition-all
                ${isWrong
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-emerald-200 bg-emerald-50/50'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start gap-2.5 mb-3">
                {isWrong ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isWrong ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {item.label[lang] || item.label.en}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.content[lang] || item.content.en}
              </p>
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      {conclusion && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="w-1 h-full min-h-[20px] bg-amber-400 rounded-full" />
          <p className="text-sm font-medium text-amber-800">
            {conclusion[lang] || conclusion.en}
          </p>
        </div>
      )}
    </div>
  );
}
