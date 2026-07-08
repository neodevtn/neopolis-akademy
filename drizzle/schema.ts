import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Applications table - stores all candidatures with scoring
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Personal info
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  
  // Location & sector
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  currentRole: varchar("currentRole", { length: 200 }).notNull(),
  yearsExperience: int("yearsExperience").notNull(),
  
  // Technical skills
  programmingLevel: mysqlEnum("programmingLevel", ["none", "beginner", "intermediate", "advanced", "expert"]).notNull(),
  aiKnowledge: mysqlEnum("aiKnowledge", ["none", "basic", "intermediate", "advanced", "expert"]).notNull(),
  cloudExperience: mysqlEnum("cloudExperience", ["none", "basic", "intermediate", "advanced", "expert"]).notNull(),
  technicalTools: text("technicalTools"),
  certifications: text("certifications"),
  
  // Business/métier skills
  sectorExpertise: mysqlEnum("sectorExpertise", ["junior", "intermediate", "senior", "expert"]).notNull(),
  clientNetwork: mysqlEnum("clientNetwork", ["none", "small", "medium", "large"]).notNull(),
  businessDevelopment: mysqlEnum("businessDevelopment", ["none", "basic", "intermediate", "advanced"]).notNull(),
  
  // Communication skills
  languages: text("languages"),
  publicSpeaking: mysqlEnum("publicSpeaking", ["none", "basic", "intermediate", "advanced"]).notNull(),
  salesExperience: mysqlEnum("salesExperience", ["none", "less_1y", "1_3y", "3_5y", "more_5y"]).notNull(),
  motivation: text("motivation").notNull(),
  
  // === NEW FIELDS ===
  
  // Distribution network
  distributionNetwork: text("distributionNetwork"), // Description of B2B contacts, partners, channels
  industryContacts: mysqlEnum("industryContacts", ["none", "few", "moderate", "extensive", "very_extensive"]),
  existingPartnerships: text("existingPartnerships"), // Current business partnerships
  targetMarketKnowledge: mysqlEnum("targetMarketKnowledge", ["none", "basic", "good", "excellent", "expert"]),
  
  // Entrepreneurial psychology profile
  riskTolerance: mysqlEnum("riskTolerance", ["very_low", "low", "moderate", "high", "very_high"]),
  autonomyLevel: mysqlEnum("autonomyLevel", ["needs_guidance", "somewhat_autonomous", "autonomous", "very_autonomous", "fully_independent"]),
  resilienceLevel: mysqlEnum("resilienceLevel", ["low", "moderate", "high", "very_high"]),
  leadershipStyle: mysqlEnum("leadershipStyle", ["follower", "collaborative", "situational", "visionary", "transformational"]),
  entrepreneurialExperience: text("entrepreneurialExperience"), // Free text about past ventures
  
  // AI Agent scenario
  aiAgentScenario: text("aiAgentScenario"), // Concrete scenario where AI agent replaces human
  aiAgentSector: varchar("aiAgentSector", { length: 200 }), // Target sector for the scenario
  aiAgentImpact: text("aiAgentImpact"), // Expected impact and distribution potential
  
  // Social links & profile
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  githubUrl: varchar("githubUrl", { length: 500 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  otherSocialUrl: varchar("otherSocialUrl", { length: 500 }),
  
  // File uploads (S3 keys)
  cvFileKey: varchar("cvFileKey", { length: 500 }),
  cvFileUrl: varchar("cvFileUrl", { length: 500 }),
  photoFileKey: varchar("photoFileKey", { length: 500 }),
  photoFileUrl: varchar("photoFileUrl", { length: 500 }),
  
  // Scoring
  scoreTechnique: decimal("scoreTechnique", { precision: 5, scale: 2 }).notNull(),
  scoreMetier: decimal("scoreMetier", { precision: 5, scale: 2 }).notNull(),
  scoreCommunication: decimal("scoreCommunication", { precision: 5, scale: 2 }).notNull(),
  scoreTotal: decimal("scoreTotal", { precision: 5, scale: 2 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["en_attente", "selectionne", "refuse"]).default("en_attente").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
