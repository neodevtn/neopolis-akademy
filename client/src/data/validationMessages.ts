/**
 * Traduction des messages d'erreur de validation Zod
 * Les messages originaux sont en français dans shared/validation.ts
 * Ce fichier fournit les traductions EN/AR pour l'affichage frontend
 */

type Lang = "fr" | "en" | "ar";

const translations: Record<string, { en: string; ar: string }> = {
  // Step 1
  "Le prénom doit contenir au moins 2 caractères": { en: "First name must be at least 2 characters", ar: "يجب أن يحتوي الاسم على حرفين على الأقل" },
  "Le prénom ne doit pas dépasser 50 caractères": { en: "First name must not exceed 50 characters", ar: "يجب ألا يتجاوز الاسم 50 حرفاً" },
  "Le nom doit contenir au moins 2 caractères": { en: "Last name must be at least 2 characters", ar: "يجب أن يحتوي اسم العائلة على حرفين على الأقل" },
  "Le nom ne doit pas dépasser 50 caractères": { en: "Last name must not exceed 50 characters", ar: "يجب ألا يتجاوز اسم العائلة 50 حرفاً" },
  "Format d'email invalide": { en: "Invalid email format", ar: "صيغة البريد الإلكتروني غير صالحة" },
  "L'email ne doit pas dépasser 320 caractères": { en: "Email must not exceed 320 characters", ar: "يجب ألا يتجاوز البريد الإلكتروني 320 حرفاً" },
  "Le numéro doit contenir au moins 5 caractères": { en: "Phone number must be at least 5 characters", ar: "يجب أن يحتوي رقم الهاتف على 5 أحرف على الأقل" },
  "Le numéro ne doit pas dépasser 20 caractères": { en: "Phone number must not exceed 20 characters", ar: "يجب ألا يتجاوز رقم الهاتف 20 حرفاً" },
  "Format de téléphone invalide (ex: +216 XX XXX XXX)": { en: "Invalid phone format (e.g.: +216 XX XXX XXX)", ar: "صيغة الهاتف غير صالحة (مثال: +216 XX XXX XXX)" },

  // Step 2
  "Le pays est requis": { en: "Country is required", ar: "الدولة مطلوبة" },
  "La ville doit contenir au moins 2 caractères": { en: "City must be at least 2 characters", ar: "يجب أن تحتوي المدينة على حرفين على الأقل" },
  "Le secteur d'activité est requis": { en: "Industry sector is required", ar: "قطاع النشاط مطلوب" },
  "Le poste doit contenir au moins 2 caractères": { en: "Role must be at least 2 characters", ar: "يجب أن يحتوي المنصب على حرفين على الأقل" },
  "Les années d'expérience doivent être positives": { en: "Years of experience must be positive", ar: "سنوات الخبرة يجب أن تكون إيجابية" },

  // Step 3
  "Veuillez sélectionner votre niveau en programmation": { en: "Please select your programming level", ar: "يرجى اختيار مستواك في البرمجة" },
  "Veuillez sélectionner votre niveau en IA": { en: "Please select your AI knowledge level", ar: "يرجى اختيار مستواك في الذكاء الاصطناعي" },
  "Veuillez sélectionner votre expérience Cloud": { en: "Please select your Cloud experience", ar: "يرجى اختيار خبرتك في الحوسبة السحابية" },

  // Step 4
  "Veuillez sélectionner votre niveau d'expertise": { en: "Please select your expertise level", ar: "يرجى اختيار مستوى خبرتك" },
  "Veuillez sélectionner la taille de votre réseau": { en: "Please select your network size", ar: "يرجى اختيار حجم شبكتك" },
  "Veuillez sélectionner votre expérience commerciale": { en: "Please select your business development experience", ar: "يرجى اختيار خبرتك التجارية" },

  // Step 5
  "Ce champ ne doit pas dépasser 3000 caractères": { en: "This field must not exceed 3000 characters", ar: "يجب ألا يتجاوز هذا الحقل 3000 حرف" },
  "Veuillez sélectionner le niveau de vos contacts": { en: "Please select your contacts level", ar: "يرجى اختيار مستوى جهات اتصالك" },
  "Veuillez sélectionner votre connaissance du marché": { en: "Please select your market knowledge", ar: "يرجى اختيار معرفتك بالسوق" },

  // Step 6
  "Veuillez sélectionner votre tolérance au risque": { en: "Please select your risk tolerance", ar: "يرجى اختيار مدى تحملك للمخاطر" },
  "Veuillez sélectionner votre niveau d'autonomie": { en: "Please select your autonomy level", ar: "يرجى اختيار مستوى استقلاليتك" },
  "Veuillez sélectionner votre niveau de résilience": { en: "Please select your resilience level", ar: "يرجى اختيار مستوى مرونتك" },
  "Veuillez sélectionner votre style de leadership": { en: "Please select your leadership style", ar: "يرجى اختيار أسلوب قيادتك" },

  // Step 7
  "Le scénario doit contenir au moins 100 caractères pour être évalué": { en: "The scenario must be at least 100 characters to be evaluated", ar: "يجب أن يحتوي السيناريو على 100 حرف على الأقل ليتم تقييمه" },
  "Le scénario ne doit pas dépasser 5000 caractères": { en: "The scenario must not exceed 5000 characters", ar: "يجب ألا يتجاوز السيناريو 5000 حرف" },
  "Le secteur cible est requis": { en: "Target sector is required", ar: "القطاع المستهدف مطلوب" },
  "L'impact attendu doit contenir au moins 50 caractères": { en: "Expected impact must be at least 50 characters", ar: "يجب أن يحتوي التأثير المتوقع على 50 حرفاً على الأقل" },

  // Step 8
  "Veuillez sélectionner votre aisance en prise de parole": { en: "Please select your public speaking level", ar: "يرجى اختيار مستوى ارتياحك في الخطابة" },
  "Veuillez sélectionner votre expérience en vente": { en: "Please select your sales experience", ar: "يرجى اختيار خبرتك في المبيعات" },
  "La motivation doit contenir au moins 50 caractères": { en: "Motivation must be at least 50 characters", ar: "يجب أن تحتوي الرسالة التحفيزية على 50 حرفاً على الأقل" },
  "La motivation ne doit pas dépasser 5000 caractères": { en: "Motivation must not exceed 5000 characters", ar: "يجب ألا تتجاوز الرسالة التحفيزية 5000 حرف" },

  // Generic
  "Required": { en: "Required", ar: "مطلوب" },
};

/**
 * Translate a Zod validation error message based on the current language
 * If the language is French, return the original message
 * If no translation is found, return the original message
 */
export function translateValidationError(message: string, lang: Lang): string {
  if (lang === "fr") return message;
  const translation = translations[message];
  if (translation) {
    return translation[lang] || message;
  }
  // Fallback: try partial match for dynamic messages
  for (const [key, value] of Object.entries(translations)) {
    if (message.includes(key)) {
      return value[lang] || message;
    }
  }
  return message;
}
