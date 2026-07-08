import { z } from "zod";

/**
 * Schéma de validation partagé entre frontend et backend
 * pour le formulaire de candidature Neopolis Akademy.
 * Compatible Zod v4.
 */

// Regex patterns
const PHONE_REGEX = /^\+?[\d\s\-()]{5,20}$/;

// Enums partagés
export const programmingLevels = ["none", "beginner", "intermediate", "advanced", "expert"] as const;
export const aiKnowledgeLevels = ["none", "basic", "intermediate", "advanced", "expert"] as const;
export const cloudExperienceLevels = ["none", "basic", "intermediate", "advanced", "expert"] as const;
export const sectorExpertiseLevels = ["junior", "intermediate", "senior", "expert"] as const;
export const clientNetworkLevels = ["none", "small", "medium", "large"] as const;
export const businessDevelopmentLevels = ["none", "basic", "intermediate", "advanced"] as const;
export const publicSpeakingLevels = ["none", "basic", "intermediate", "advanced"] as const;
export const salesExperienceLevels = ["none", "less_1y", "1_3y", "3_5y", "more_5y"] as const;

// Schéma de validation complet
export const applicationSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères"),

  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),

  email: z.string()
    .email("Format d'email invalide")
    .max(320, "L'email ne doit pas dépasser 320 caractères"),

  phone: z.string()
    .min(5, "Le numéro doit contenir au moins 5 caractères")
    .max(20, "Le numéro ne doit pas dépasser 20 caractères")
    .regex(PHONE_REGEX, "Format de téléphone invalide (ex: +212 6XX XXX XXX)"),

  country: z.string()
    .min(1, "Le pays est requis"),

  city: z.string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(100, "La ville ne doit pas dépasser 100 caractères"),

  sector: z.string()
    .min(1, "Le secteur d'activité est requis"),

  currentRole: z.string()
    .min(2, "Le poste doit contenir au moins 2 caractères")
    .max(100, "Le poste ne doit pas dépasser 100 caractères"),

  yearsExperience: z.number()
    .min(0, "Les années d'expérience doivent être positives")
    .max(50, "Les années d'expérience ne peuvent pas dépasser 50"),

  programmingLevel: z.enum(programmingLevels, {
    error: "Veuillez sélectionner votre niveau en programmation",
  }),
  aiKnowledge: z.enum(aiKnowledgeLevels, {
    error: "Veuillez sélectionner votre niveau en IA",
  }),
  cloudExperience: z.enum(cloudExperienceLevels, {
    error: "Veuillez sélectionner votre expérience Cloud",
  }),

  technicalTools: z.string()
    .max(1000, "Ce champ ne doit pas dépasser 1000 caractères")
    .optional()
    .default(""),

  certifications: z.string()
    .max(1000, "Ce champ ne doit pas dépasser 1000 caractères")
    .optional()
    .default(""),

  sectorExpertise: z.enum(sectorExpertiseLevels, {
    error: "Veuillez sélectionner votre niveau d'expertise",
  }),
  clientNetwork: z.enum(clientNetworkLevels, {
    error: "Veuillez sélectionner la taille de votre réseau",
  }),
  businessDevelopment: z.enum(businessDevelopmentLevels, {
    error: "Veuillez sélectionner votre expérience commerciale",
  }),

  languages: z.string()
    .max(500, "Ce champ ne doit pas dépasser 500 caractères")
    .optional()
    .default(""),

  publicSpeaking: z.enum(publicSpeakingLevels, {
    error: "Veuillez sélectionner votre aisance en prise de parole",
  }),
  salesExperience: z.enum(salesExperienceLevels, {
    error: "Veuillez sélectionner votre expérience en vente",
  }),

  motivation: z.string()
    .min(50, "La motivation doit contenir au moins 50 caractères")
    .max(5000, "La motivation ne doit pas dépasser 5000 caractères"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// Schémas par étape pour validation frontend progressive
export const step1Schema = z.object({
  firstName: applicationSchema.shape.firstName,
  lastName: applicationSchema.shape.lastName,
  email: applicationSchema.shape.email,
  phone: applicationSchema.shape.phone,
});

export const step2Schema = z.object({
  country: applicationSchema.shape.country,
  city: applicationSchema.shape.city,
  sector: applicationSchema.shape.sector,
  currentRole: applicationSchema.shape.currentRole,
  yearsExperience: applicationSchema.shape.yearsExperience,
});

export const step3Schema = z.object({
  programmingLevel: applicationSchema.shape.programmingLevel,
  aiKnowledge: applicationSchema.shape.aiKnowledge,
  cloudExperience: applicationSchema.shape.cloudExperience,
  technicalTools: applicationSchema.shape.technicalTools,
  certifications: applicationSchema.shape.certifications,
});

export const step4Schema = z.object({
  sectorExpertise: applicationSchema.shape.sectorExpertise,
  clientNetwork: applicationSchema.shape.clientNetwork,
  businessDevelopment: applicationSchema.shape.businessDevelopment,
});

export const step5Schema = z.object({
  languages: applicationSchema.shape.languages,
  publicSpeaking: applicationSchema.shape.publicSpeaking,
  salesExperience: applicationSchema.shape.salesExperience,
  motivation: applicationSchema.shape.motivation,
});

// Helper pour extraire les erreurs par champ depuis un ZodError
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
