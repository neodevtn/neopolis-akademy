import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "en" | "fr";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (obj: { en: string; fr: string } | string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("neopolis_lang");
    return (stored === "en" || stored === "fr") ? stored : "fr";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("neopolis_lang", l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "en" ? "fr" : "en";
      localStorage.setItem("neopolis_lang", next);
      return next;
    });
  }, []);

  const t = useCallback((obj: { en: string; fr: string } | string | undefined | null): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || "";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
