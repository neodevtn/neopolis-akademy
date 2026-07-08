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
  
  // Technical skills (JSON stored)
  programmingLevel: mysqlEnum("programmingLevel", ["none", "beginner", "intermediate", "advanced", "expert"]).notNull(),
  aiKnowledge: mysqlEnum("aiKnowledge", ["none", "basic", "intermediate", "advanced", "expert"]).notNull(),
  cloudExperience: mysqlEnum("cloudExperience", ["none", "basic", "intermediate", "advanced", "expert"]).notNull(),
  technicalTools: text("technicalTools"), // JSON array of tools known
  certifications: text("certifications"), // existing certifications
  
  // Business/métier skills
  sectorExpertise: mysqlEnum("sectorExpertise", ["junior", "intermediate", "senior", "expert"]).notNull(),
  clientNetwork: mysqlEnum("clientNetwork", ["none", "small", "medium", "large"]).notNull(),
  businessDevelopment: mysqlEnum("businessDevelopment", ["none", "basic", "intermediate", "advanced"]).notNull(),
  
  // Communication skills
  languages: text("languages"), // JSON array: [{lang, level}]
  publicSpeaking: mysqlEnum("publicSpeaking", ["none", "basic", "intermediate", "advanced"]).notNull(),
  salesExperience: mysqlEnum("salesExperience", ["none", "less_1y", "1_3y", "3_5y", "more_5y"]).notNull(),
  motivation: text("motivation").notNull(), // free text motivation letter
  
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
