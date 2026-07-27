import { useState } from 'react';

interface Tab {
  label: { en: string; fr: string };
  content: { en: string; fr: string };
}

interface TabbedContentProps {
  tabs: Tab[];
  lang: 'en' | 'fr';
}

export function TabbedContent({ tabs, lang }: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="my-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Tab headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-all duration-200
              ${activeTab === idx
                ? 'text-emerald-700 bg-white border-b-2 border-emerald-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {tab.label[lang] || tab.label.en}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {(tabs[activeTab]?.content[lang] || tabs[activeTab]?.content.en || '').split('\n\n').map((paragraph, idx) => {
            // Handle bold text
            const parts = paragraph.split(/\*\*(.*?)\*\*/g);
            // Handle bullet points
            if (paragraph.startsWith('•')) {
              return (
                <div key={idx} className="flex items-start gap-2 my-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>
                    {parts.map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </span>
                </div>
              );
            }
            return (
              <p key={idx} className="mb-3">
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : <span key={i}>{part}</span>
                )}
              </p>
            );
          })}
        </div>
      </div>

      {/* Tab indicator */}
      <div className="flex justify-center gap-1.5 pb-4">
        {tabs.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              activeTab === idx ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
