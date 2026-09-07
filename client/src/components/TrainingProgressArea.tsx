import type { ReactNode } from "react";
import { TrainingProgressProvider } from "@/contexts/TrainingProgressContext";
import { LearningIntegrityGate } from "@/components/LearningIntegrityGate";

/** Charge les données de progression seulement dans les parcours qui en ont besoin. */
export default function TrainingProgressArea({ children }: { children: ReactNode }) {
  return <TrainingProgressProvider><LearningIntegrityGate />{children}</TrainingProgressProvider>;
}
