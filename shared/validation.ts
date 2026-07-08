import { z } from "zod";

/**
 * Schéma de validation partagé entre frontend et backend
 * pour le formulaire de candidature Neopolis Akademy.
 * Compatible Zod v4.
 */

// Regex patterns
const PHONE_REGEX = /^\+?[\d\s\-()]{5,20}$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/;

// Enums partagés
export const programmingLevels = ["none", "beginner", "intermediate", "advanced", "expert"] as const;
export const aiKnowledgeLevels = ["none", "basic", "intermediate", "advanced", "expert"] as const;
export const cloudExperienceLevels = ["none", "basic", "intermediate", "advanced", "expert"] as const;
export const sectorExpertiseLevels = ["junior", "intermediate", "senior", "expert"] as const;
export const clientNetworkLevels = ["none", "small", "medium", "large"] as const;
export const businessDevelopmentLevels = ["none", "basic", "intermediate", "advanced"] as const;
export const publicSpeakingLevels = ["none", "basic", "intermediate", "advanced"] as const;
export const salesExperienceLevels = ["none", "less_1y", "1_3y", "3_5y", "more_5y"] as const;

// New enums
export const industryContactsLevels = ["none", "few", "moderate", "extensive", "very_extensive"] as const;
export const targetMarketKnowledgeLevels = ["none", "basic", "good", "excellent", "expert"] as const;
export const riskToleranceLevels = ["very_low", "low", "moderate", "high", "very_high"] as const;
export const autonomyLevels = ["needs_guidance", "somewhat_autonomous", "autonomous", "very_autonomous", "fully_independent"] as const;
export const resilienceLevels = ["low", "moderate", "high", "very_high"] as const;
export const leadershipStyleLevels = ["follower", "collaborative", "situational", "visionary", "transformational"] as const;

// Schéma de validation complet
export const applicationSchema = z.object({
  // Step 1: Personal info
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
    .regex(PHONE_REGEX, "Format de téléphone invalide (ex: +216 XX XXX XXX)"),

  // Step 2: Location & sector
  country: z.string().min(1, "Le pays est requis"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères").max(100),
  sector: z.string().min(1, "Le secteur d'activité est requis"),
  currentRole: z.string().min(2, "Le poste doit contenir au moins 2 caractères").max(100),
  yearsExperience: z.number().min(0, "Les années d'expérience doivent être positives").max(50),

  // Step 3: Technical skills
  programmingLevel: z.enum(programmingLevels, { error: "Veuillez sélectionner votre niveau en programmation" }),
  aiKnowledge: z.enum(aiKnowledgeLevels, { error: "Veuillez sélectionner votre niveau en IA" }),
  cloudExperience: z.enum(cloudExperienceLevels, { error: "Veuillez sélectionner votre expérience Cloud" }),
  technicalTools: z.string().max(1000).optional().default(""),
  certifications: z.string().max(1000).optional().default(""),

  // Step 4: Business/métier skills
  sectorExpertise: z.enum(sectorExpertiseLevels, { error: "Veuillez sélectionner votre niveau d'expertise" }),
  clientNetwork: z.enum(clientNetworkLevels, { error: "Veuillez sélectionner la taille de votre réseau" }),
  businessDevelopment: z.enum(businessDevelopmentLevels, { error: "Veuillez sélectionner votre expérience commerciale" }),

  // Step 5: Distribution network (NEW)
  distributionNetwork: z.string().max(3000, "Ce champ ne doit pas dépasser 3000 caractères").optional().default(""),
  industryContacts: z.enum(industryContactsLevels, { error: "Veuillez sélectionner le niveau de vos contacts" }),
  existingPartnerships: z.string().max(2000).optional().default(""),
  targetMarketKnowledge: z.enum(targetMarketKnowledgeLevels, { error: "Veuillez sélectionner votre connaissance du marché" }),

  // Step 6: Entrepreneurial psychology (NEW)
  riskTolerance: z.enum(riskToleranceLevels, { error: "Veuillez sélectionner votre tolérance au risque" }),
  autonomyLevel: z.enum(autonomyLevels, { error: "Veuillez sélectionner votre niveau d'autonomie" }),
  resilienceLevel: z.enum(resilienceLevels, { error: "Veuillez sélectionner votre niveau de résilience" }),
  leadershipStyle: z.enum(leadershipStyleLevels, { error: "Veuillez sélectionner votre style de leadership" }),
  entrepreneurialExperience: z.string().max(3000).optional().default(""),

  // Step 7: AI Agent scenario (NEW)
  aiAgentScenario: z.string()
    .min(100, "Le scénario doit contenir au moins 100 caractères pour être évalué")
    .max(5000, "Le scénario ne doit pas dépasser 5000 caractères"),
  aiAgentSector: z.string().min(2, "Le secteur cible est requis").max(200),
  aiAgentImpact: z.string()
    .min(50, "L'impact attendu doit contenir au moins 50 caractères")
    .max(3000),

  // Step 8: Communication & motivation
  languages: z.string().max(500).optional().default(""),
  publicSpeaking: z.enum(publicSpeakingLevels, { error: "Veuillez sélectionner votre aisance en prise de parole" }),
  salesExperience: z.enum(salesExperienceLevels, { error: "Veuillez sélectionner votre expérience en vente" }),
  motivation: z.string()
    .min(50, "La motivation doit contenir au moins 50 caractères")
    .max(5000, "La motivation ne doit pas dépasser 5000 caractères"),

  // Step 9: Social links & files (NEW)
  linkedinUrl: z.string().max(500).optional().default(""),
  twitterUrl: z.string().max(500).optional().default(""),
  githubUrl: z.string().max(500).optional().default(""),
  websiteUrl: z.string().max(500).optional().default(""),
  otherSocialUrl: z.string().max(500).optional().default(""),
  // File uploads are handled separately via multipart, not in this schema
  cvFileUrl: z.string().max(500).optional().default(""),
  cvFileKey: z.string().max(500).optional().default(""),
  photoFileUrl: z.string().max(500).optional().default(""),
  photoFileKey: z.string().max(500).optional().default(""),
  videoFileUrl: z.string().max(500).optional().default(""),
  videoFileKey: z.string().max(500).optional().default(""),
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

// NEW: Step 5 - Distribution network
export const step5Schema = z.object({
  distributionNetwork: applicationSchema.shape.distributionNetwork,
  industryContacts: applicationSchema.shape.industryContacts,
  existingPartnerships: applicationSchema.shape.existingPartnerships,
  targetMarketKnowledge: applicationSchema.shape.targetMarketKnowledge,
});

// NEW: Step 6 - Entrepreneurial psychology
export const step6Schema = z.object({
  riskTolerance: applicationSchema.shape.riskTolerance,
  autonomyLevel: applicationSchema.shape.autonomyLevel,
  resilienceLevel: applicationSchema.shape.resilienceLevel,
  leadershipStyle: applicationSchema.shape.leadershipStyle,
  entrepreneurialExperience: applicationSchema.shape.entrepreneurialExperience,
});

// NEW: Step 7 - AI Agent scenario
export const step7Schema = z.object({
  aiAgentScenario: applicationSchema.shape.aiAgentScenario,
  aiAgentSector: applicationSchema.shape.aiAgentSector,
  aiAgentImpact: applicationSchema.shape.aiAgentImpact,
});

// Step 8 - Communication & motivation (was step 5)
export const step8Schema = z.object({
  languages: applicationSchema.shape.languages,
  publicSpeaking: applicationSchema.shape.publicSpeaking,
  salesExperience: applicationSchema.shape.salesExperience,
  motivation: applicationSchema.shape.motivation,
});

// NEW: Step 9 - Social links & files
export const step9Schema = z.object({
  linkedinUrl: applicationSchema.shape.linkedinUrl,
  twitterUrl: applicationSchema.shape.twitterUrl,
  githubUrl: applicationSchema.shape.githubUrl,
  websiteUrl: applicationSchema.shape.websiteUrl,
  otherSocialUrl: applicationSchema.shape.otherSocialUrl,
});

// NEW: Step 10 - Video pitch (no validation needed, optional upload)
export const step10Schema = z.object({});

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
