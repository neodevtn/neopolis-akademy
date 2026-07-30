import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "ar", flag: "🇸🇦", label: "AR" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors"
      >
        <span>{current.flag}</span>
        {current.label}
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden min-w-[100px]">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors ${l.code === lang ? "bg-secondary font-semibold" : ""}`}
            >
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
