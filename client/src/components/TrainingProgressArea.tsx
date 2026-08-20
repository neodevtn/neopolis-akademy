import type { ReactNode } from "react";
import { TrainingProgressProvider } from "@/contexts/TrainingProgressContext";

/** Charge les données de progression seulement dans les parcours qui en ont besoin. */
export default function TrainingProgressArea({ children }: { children: ReactNode }) {
  return <TrainingProgressProvider>{children}</TrainingProgressProvider>;
}
