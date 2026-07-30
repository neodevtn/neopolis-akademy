import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Language = "fr" | "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  t: (obj: { en: string; fr: string; ar?: string } | string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("neopolis_lang");
    if (stored === "en" || stored === "fr" || stored === "ar") return stored;
    return "fr";
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, isRTL]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("neopolis_lang", l);
  }, []);

  const t = useCallback((obj: { en: string; fr: string; ar?: string } | string | undefined | null): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (lang === "ar") return obj.ar || obj.fr || obj.en || "";
    return obj[lang] || obj.en || "";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
