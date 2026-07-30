# Implementation Plan: EN/FR Tabs in Admin Edit Dialogs

## Architecture
- Add `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"` to AdminContentManager.tsx
- Add a helper to extract EN/FR values from translation objects:
  ```tsx
  const getI18nValue = (field: any, lang: "en" | "fr"): string => {
    if (!field) return '';
    if (typeof field === 'string') return field; // same for both
    if (typeof field === 'object') return field[lang] || '';
    return String(field);
  };
  const setI18nValue = (field: any, lang: "en" | "fr", value: string): any => {
    if (!field || typeof field === 'string') {
      // Convert string to object
      return lang === 'en' ? { en: value, fr: '' } : { en: field || '', fr: value };
    }
    return { ...field, [lang]: value };
  };
  ```

## 3 Dialogs to modify

### 1. Exercise Edit Dialog (lines 762-807)
- Fields: title, prompt, instructions, correction
- State: editingExamQ (type === "exercise")
- Save: updateExerciseMut.mutate({ courseId, exerciseIndex, data: { title, prompt, instructions, correction } })
- Each field needs EN/FR tabs

### 2. Exam Question Edit Dialog (lines 810-891)
- Fields: domain, question, choices[].text, explanation
- State: editingExamQ (no type or type !== "exercise")
- Save: updateExamQMut or addExamQMut
- Each field needs EN/FR tabs (choices need per-choice EN/FR)

### 3. Quiz Edit Dialog (lines 894-960)
- Fields: question, choices[].text, explanation
- State: editingQuiz
- Save: updateQuizMut
- Each field needs EN/FR tabs

## Key Design Decisions
- English is the default/primary language (fallback)
- When opening an existing item, if the field is a string, it's treated as English only
- When saving, always save as {en, fr} object (even if FR is empty)
- Tab UI: small tabs at the top of each dialog, content shows all fields for that language
- Use a single tab state per dialog (not per-field) to avoid complexity
