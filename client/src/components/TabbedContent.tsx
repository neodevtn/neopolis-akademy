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
    <div className="my-6">
      {/* Tab headers - Skilljar style: orange active with thick underline */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`
              px-5 py-3 text-sm font-medium transition-all duration-200 relative
              ${activeTab === idx
                ? 'text-[#c75b3a]'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label[lang] || tab.label.en}
            {activeTab === idx && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#c75b3a] rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-5 px-1">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {(tabs[activeTab]?.content[lang] || tabs[activeTab]?.content.en || '').split('\n\n').map((paragraph, idx) => {
            // Handle bold text
            const parts = paragraph.split(/\*\*(.*?)\*\*/g);
            // Handle bullet points
            if (paragraph.startsWith('•') || paragraph.startsWith('- ')) {
              const cleanParagraph = paragraph.replace(/^[•\-]\s*/, '');
              const bulletParts = cleanParagraph.split(/\*\*(.*?)\*\*/g);
              return (
                <div key={idx} className="flex items-start gap-2 my-1.5">
                  <span className="text-[#c75b3a] mt-0.5 font-bold">•</span>
                  <span>
                    {bulletParts.map((part, i) =>
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
    </div>
  );
}
