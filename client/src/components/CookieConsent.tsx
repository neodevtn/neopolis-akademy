import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";

const COOKIE_CONSENT_KEY = "neopolis_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
    window.location.reload();
  };

  const handleRefuse = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div
            className="container max-w-[900px] mx-auto rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6"
            style={{
              background: "rgba(250, 248, 243, 0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--wise-rule)",
              boxShadow: "0 -4px 32px rgba(0, 0, 0, 0.08), 0 -1px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="flex items-start gap-3 flex-1">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "rgba(45, 183, 105, 0.12)" }}
              >
                <Cookie size={18} style={{ color: "var(--wise-positive-deep)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--wise-ink)" }}>
                  {t({ fr: "Nous respectons votre vie privée", en: "We respect your privacy", ar: "نحن نحترم خصوصيتك" })}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--wise-ink-soft)" }}>
                  {t({
                    fr: "Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement (authentification, session). Aucun cookie publicitaire n'est utilisé.",
                    en: "This site only uses technical cookies necessary for operation (authentication, session). No advertising cookies are used.",
                    ar: "يستخدم هذا الموقع فقط ملفات تعريف الارتباط التقنية الضرورية للتشغيل (المصادقة، الجلسة). لا يتم استخدام أي ملفات تعريف ارتباط إعلانية."
                  })}{" "}
                  <Link href="/mentions-legales" className="underline" style={{ color: "var(--wise-positive-deep)" }}>
                    {t({ fr: "En savoir plus", en: "Learn more", ar: "اعرف المزيد" })}
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={handleRefuse}
                className="flex-1 md:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg transition-all hover:scale-[0.97] active:scale-[0.95]"
                style={{
                  color: "var(--wise-ink-soft)",
                  border: "1px solid var(--wise-rule)",
                  background: "transparent",
                }}
              >
                {t({ fr: "Refuser", en: "Decline", ar: "رفض" })}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg transition-all hover:scale-[0.97] active:scale-[0.95] flex items-center justify-center gap-1.5"
                style={{
                  color: "white",
                  background: "var(--wise-positive-deep)",
                }}
              >
                <Shield size={12} />
                {t({ fr: "Accepter", en: "Accept", ar: "قبول" })}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
