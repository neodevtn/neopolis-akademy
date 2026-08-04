import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // bcrypt hash, null for OAuth-only users
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  blocked: int("blocked").default(0).notNull(), // 0=active, 1=blocked
  invitedAt: timestamp("invitedAt"),
  invitedBy: int("invitedBy"), // admin userId who invited
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
  videoFileKey: varchar("videoFileKey", { length: 500 }),
  videoFileUrl: varchar("videoFileUrl", { length: 500 }),
  
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

/**
 * Training progress - tracks which lessons a user has completed
 */
export const trainingProgress = mysqlTable("training_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  certificationId: varchar("certificationId", { length: 200 }).notNull(),
  courseId: varchar("courseId", { length: 200 }).notNull(),
  lessonIndex: int("lessonIndex").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type InsertTrainingProgress = typeof trainingProgress.$inferInsert;

/**
 * Exam attempts - stores each mock exam attempt with score and answers
 */
export const examAttempts = mysqlTable("exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  certificationId: varchar("certificationId", { length: 200 }).notNull(),
  score: int("score").notNull(), // 100-1000 scale
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  passed: int("passed").notNull().default(0), // 0 or 1
  domainScores: json("domainScores"), // JSON object with per-domain scores
  startedAt: timestamp("startedAt").notNull(),
  finishedAt: timestamp("finishedAt").defaultNow().notNull(),
});

export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = typeof examAttempts.$inferInsert;

/**
 * Video progress - tracks which videos a user has watched
 */
export const videoProgress = mysqlTable("video_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: varchar("courseId", { length: 200 }).notNull(),
  youtubeId: varchar("youtubeId", { length: 50 }).notNull(),
  watchedAt: timestamp("watchedAt").defaultNow().notNull(),
});

export type VideoProgress = typeof videoProgress.$inferSelect;
export type InsertVideoProgress = typeof videoProgress.$inferInsert;

/**
 * Chapter progress - tracks the current chapter position within a lesson
 */
export const chapterProgress = mysqlTable("chapter_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: varchar("courseId", { length: 200 }).notNull(),
  lessonIndex: int("lessonIndex").notNull(),
  chapterIndex: int("chapterIndex").notNull(), // last completed chapter index
  totalChapters: int("totalChapters").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChapterProgress = typeof chapterProgress.$inferSelect;
export type InsertChapterProgress = typeof chapterProgress.$inferInsert;

/**
 * User invitations - tracks pending invitations sent by admins
 */
export const userInvitations = mysqlTable("user_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 200 }),
  invitedBy: int("invitedBy").notNull(), // admin userId
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  emailDeliveryStatus: mysqlEnum("emailDeliveryStatus", ["sent", "delivered", "bounced", "complained", "suppressed"]).default("sent"),
  resendMessageId: varchar("resendMessageId", { length: 100 }), // Resend email ID for tracking
  applicationId: int("applicationId"), // link to the original application if any
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
});

export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = typeof userInvitations.$inferInsert;

/**
 * Admin notes - private notes attached to users or applications
 */
export const adminNotes = mysqlTable("admin_notes", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("targetType", ["user", "application"]).notNull(),
  targetId: int("targetId").notNull(), // userId or applicationId
  authorId: int("authorId").notNull(), // admin who wrote the note
  content: text("content").notNull(),
  category: mysqlEnum("category", ["general", "evaluation", "follow_up", "alert", "decision"]).default("general").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminNote = typeof adminNotes.$inferSelect;
export type InsertAdminNote = typeof adminNotes.$inferInsert;

/**
 * Admin tags - custom labels for segmenting learners
 */
export const adminTags = mysqlTable("admin_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 20 }).default("#6b7280").notNull(), // hex color
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminTag = typeof adminTags.$inferSelect;
export type InsertAdminTag = typeof adminTags.$inferInsert;

/**
 * User-tag assignments - many-to-many relationship
 */
export const userTags = mysqlTable("user_tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tagId: int("tagId").notNull(),
  assignedBy: int("assignedBy").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type UserTag = typeof userTags.$inferSelect;
export type InsertUserTag = typeof userTags.$inferInsert;

/**
 * Communications - tracks mass emails and announcements sent by admins
 */
export const communications = mysqlTable("communications", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(), // HTML email body
  type: mysqlEnum("type", ["invitation", "announcement", "reminder", "welcome", "custom"]).notNull(),
  recipientFilter: json("recipientFilter"), // JSON: { tags: [], status: [], role: [] }
  recipientCount: int("recipientCount").notNull().default(0),
  sentBy: int("sentBy").notNull(), // admin userId
  status: mysqlEnum("status", ["draft", "sending", "sent", "failed"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;

/**
 * Admin activity log - audit trail of admin actions
 */
export const adminActivityLog = mysqlTable("admin_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g. "accept_application", "block_user", "send_communication"
  targetType: varchar("targetType", { length: 50 }).notNull(), // "user", "application", "communication"
  targetId: int("targetId"),
  details: json("details"), // additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLog.$inferInsert;

/**
 * Admin notifications - alerts for new applications, inactive learners, etc.
 */
export const adminNotifications = mysqlTable("admin_notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // "new_application", "inactive_learner", "quiz_failure", "system"
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  targetType: varchar("targetType", { length: 50 }), // "application", "user"
  targetId: int("targetId"),
  isRead: int("isRead").default(0).notNull(), // 0=unread, 1=read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;


/**
 * Video recommendation feedback - tracks user reports of irrelevant/obsolete videos
 */
export const videoFeedback = mysqlTable("video_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // references users.id
  videoId: varchar("videoId", { length: 32 }).notNull(), // YouTube video ID
  lessonId: varchar("lessonId", { length: 255 }).notNull(), // lesson identifier
  certId: varchar("certId", { length: 255 }).notNull(), // certification identifier
  reason: mysqlEnum("reason", ["not_relevant", "obsolete", "broken_link", "other"]).notNull(),
  comment: text("comment"), // optional user comment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VideoFeedback = typeof videoFeedback.$inferSelect;
export type InsertVideoFeedback = typeof videoFeedback.$inferInsert;

/**
 * Client errors - persisted error reports from the frontend
 */
export const clientErrors = mysqlTable("client_errors", {
  id: int("id").autoincrement().primaryKey(),
  message: varchar("message", { length: 500 }).notNull(),
  stack: text("stack"),
  source: mysqlEnum("source", ["window", "promise", "boundary", "manual"]).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  componentStack: text("componentStack"),
  clientTimestamp: timestamp("clientTimestamp").notNull(),
  ip: varchar("ip", { length: 45 }), // IPv4 or IPv6
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ClientError = typeof clientErrors.$inferSelect;
export type InsertClientError = typeof clientErrors.$inferInsert;

/**
 * Password reset tokens - for email/password auth recovery
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Email events - webhook events from Resend for delivery tracking
 */
export const emailEvents = mysqlTable("email_events", {
  id: int("id").autoincrement().primaryKey(),
  resendMessageId: varchar("resendMessageId", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["sent", "delivered", "bounced", "complained", "opened", "clicked"]).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  reason: text("reason"), // bounce reason if applicable
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = typeof emailEvents.$inferInsert;
