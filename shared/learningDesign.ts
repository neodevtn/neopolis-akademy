export type LearningTemplateId = "neopolis" | "finance-ledger" | "technical-lab" | "certification";

export type LearningTheme = {
  id?: LearningTemplateId | string;
  label?: string;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    surfaceMuted?: string;
    foreground?: string;
  };
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  density?: "compact" | "comfortable" | "spacious";
  fontFamily?: string;
};

export type BlockAppearance = {
  tone?: "brand" | "info" | "success" | "warning" | "neutral" | "contrast";
  variant?: "solid" | "soft" | "outlined" | "gradient";
  accent?: "blue" | "indigo" | "emerald" | "amber" | "slate";
  density?: "compact" | "comfortable" | "spacious";
  layout?: "stack" | "split" | "grid" | "timeline" | "flow";
};

export const LEARNING_TEMPLATE_PRESETS: Record<LearningTemplateId, Required<LearningTheme>> = {
  neopolis: {
    id: "neopolis",
    label: "Neopolis",
    palette: { primary: "#1e3a5f", secondary: "#0f2746", accent: "#e94560", surface: "#ffffff", surfaceMuted: "#f5f7fb", foreground: "#172033" },
    radius: "xl",
    density: "comfortable",
    fontFamily: "inherit",
  },
  "finance-ledger": {
    id: "finance-ledger",
    label: "Finance & Comptabilité",
    palette: { primary: "#155eef", secondary: "#0f172a", accent: "#eab308", surface: "#ffffff", surfaceMuted: "#eff6ff", foreground: "#172033" },
    radius: "xl",
    density: "comfortable",
    fontFamily: "inherit",
  },
  "technical-lab": {
    id: "technical-lab",
    label: "Laboratoire technique",
    palette: { primary: "#0f766e", secondary: "#0f172a", accent: "#22c55e", surface: "#ffffff", surfaceMuted: "#ecfdf5", foreground: "#12231f" },
    radius: "lg",
    density: "comfortable",
    fontFamily: "inherit",
  },
  certification: {
    id: "certification",
    label: "Préparation certification",
    palette: { primary: "#5b21b6", secondary: "#24113f", accent: "#f59e0b", surface: "#ffffff", surfaceMuted: "#faf5ff", foreground: "#25143d" },
    radius: "xl",
    density: "spacious",
    fontFamily: "inherit",
  },
};

export function resolveLearningTheme(theme?: LearningTheme | string | null): Required<LearningTheme> {
  const requested = typeof theme === "string" ? { id: theme } : theme || {};
  const preset = LEARNING_TEMPLATE_PRESETS[(requested.id as LearningTemplateId) || "neopolis"] || LEARNING_TEMPLATE_PRESETS.neopolis;
  return {
    ...preset,
    ...requested,
    palette: { ...preset.palette, ...(requested.palette || {}) },
  };
}

export function blockAppearanceFromData(block: Record<string, unknown>): BlockAppearance {
  return {
    tone: block.styleTone as BlockAppearance["tone"] | undefined,
    variant: block.styleVariant as BlockAppearance["variant"] | undefined,
    accent: block.styleAccent as BlockAppearance["accent"] | undefined,
    density: block.styleDensity as BlockAppearance["density"] | undefined,
    layout: block.styleLayout as BlockAppearance["layout"] | undefined,
  };
}
