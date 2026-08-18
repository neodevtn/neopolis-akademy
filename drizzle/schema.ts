import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar, decimal, json } from "drizzle-orm/mysql-core";

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
 * Learner credentials issued from verified course completions or passing exam attempts.
 * The composite key keeps awards idempotent even if a client retries a completion request.
 */
export const learnerAchievements = mysqlTable("learner_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["skill_badge", "certification"]).notNull(),
  achievementKey: varchar("achievementKey", { length: 255 }).notNull(),
  certificationId: varchar("certificationId", { length: 200 }),
  courseId: varchar("courseId", { length: 200 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 80 }).notNull().default("award"),
  credentialCode: varchar("credentialCode", { length: 120 }).notNull().unique(),
  evidence: json("evidence"),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  emailedAt: timestamp("emailedAt"),
}, (table) => [
  uniqueIndex("learner_achievement_once").on(table.userId, table.kind, table.achievementKey),
  index("learner_achievement_user_idx").on(table.userId),
  index("learner_achievement_certification_idx").on(table.certificationId),
]);

export type LearnerAchievement = typeof learnerAchievements.$inferSelect;
export type InsertLearnerAchievement = typeof learnerAchievements.$inferInsert;

/**
 * Competency framework. Definitions and contribution rules are administrable;
 * the ledger below keeps every awarded point independently auditable.
 */
export const competencyDefinitions = mysqlTable("competency_definitions", {
  id: varchar("id", { length: 80 }).primaryKey(),
  title: json("title").notNull(),
  description: json("description"),
  category: varchar("category", { length: 100 }).notNull().default("ai"),
  icon: varchar("icon", { length: 80 }).notNull().default("sparkles"),
  color: varchar("color", { length: 40 }).notNull().default("blue"),
  maxPoints: decimal("maxPoints", { precision: 6, scale: 2 }).notNull().default("100.00"),
  sortOrder: int("sortOrder").notNull().default(0),
  active: int("active").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CompetencyDefinition = typeof competencyDefinitions.$inferSelect;

export const competencyContributionRules = mysqlTable("competency_contribution_rules", {
  id: int("id").autoincrement().primaryKey(),
  competencyId: varchar("competencyId", { length: 80 }).notNull(),
  sourceType: varchar("sourceType", { length: 80 }).notNull(),
  sourceKey: varchar("sourceKey", { length: 255 }).notNull().default("*"),
  label: varchar("label", { length: 255 }).notNull(),
  points: decimal("points", { precision: 6, scale: 2 }).notNull(),
  minScore: decimal("minScore", { precision: 5, scale: 2 }),
  active: int("active").notNull().default(1),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("competency_rule_competency_idx").on(table.competencyId),
  index("competency_rule_source_idx").on(table.sourceType, table.sourceKey),
]);
export type CompetencyContributionRule = typeof competencyContributionRules.$inferSelect;

export const learnerCompetencyContributions = mysqlTable("learner_competency_contributions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  competencyId: varchar("competencyId", { length: 80 }).notNull(),
  ruleId: int("ruleId").notNull(),
  sourceType: varchar("sourceType", { length: 80 }).notNull(),
  sourceKey: varchar("sourceKey", { length: 255 }).notNull(),
  eventKey: varchar("eventKey", { length: 255 }).notNull(),
  points: decimal("points", { precision: 6, scale: 2 }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  evidence: json("evidence"),
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("learner_competency_once").on(table.userId, table.ruleId, table.eventKey),
  index("learner_competency_user_idx").on(table.userId),
  index("learner_competency_skill_idx").on(table.competencyId),
]);
export type LearnerCompetencyContribution = typeof learnerCompetencyContributions.$inferSelect;

/** Rangs de gamification configurables selon les niveaux de compétence. */
export const gamificationRanks = mysqlTable("gamification_ranks", {
  id: varchar("id", { length: 40 }).primaryKey(),
  label: varchar("label", { length: 80 }).notNull(),
  minPoints: decimal("minPoints", { precision: 6, scale: 2 }).notNull(),
  color: varchar("color", { length: 40 }).notNull().default("slate"),
  icon: varchar("icon", { length: 80 }).notNull().default("award"),
  sortOrder: int("sortOrder").notNull().default(0),
  active: int("active").notNull().default(1),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GamificationRank = typeof gamificationRanks.$inferSelect;

/** Paramètres globaux de gamification, maintenus sur une ligne par défaut. */
export const gamificationSettings = mysqlTable("gamification_settings", {
  id: varchar("id", { length: 40 }).primaryKey().default("default"),
  weeklyGoalPoints: decimal("weeklyGoalPoints", { precision: 6, scale: 2 }).notNull().default("5.00"),
  pointsLabel: varchar("pointsLabel", { length: 120 }).notNull().default("Points de progression Neopolis Akademy"),
  rewardNotice: text("rewardNotice").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GamificationSettings = typeof gamificationSettings.$inferSelect;

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
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "failed", "cancelled"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("communications_schedule_task_idx").on(table.scheduleCronTaskUid),
  index("communications_scheduled_at_idx").on(table.scheduledAt),
]);

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;

/** Named, reusable recipient definitions controlled by administrators. */
export const communicationSegments = mysqlTable("communication_segments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  recipientFilter: json("recipientFilter").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("communication_segments_creator_idx").on(table.createdBy),
]);

export type CommunicationSegment = typeof communicationSegments.$inferSelect;
export type InsertCommunicationSegment = typeof communicationSegments.$inferInsert;

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
  source: mysqlEnum("source", ["window", "promise", "boundary", "manual", "react_critical"]).notNull(),
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

/**
 * Exercise results - stores numeric answer exercise submissions
 */
export const exerciseResults = mysqlTable("exercise_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  courseId: varchar("courseId", { length: 128 }).notNull(),
  moduleId: varchar("moduleId", { length: 128 }).notNull(),
  score: int("score").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  answers: text("answers"), // JSON string of individual answers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExerciseResult = typeof exerciseResults.$inferSelect;
export type InsertExerciseResult = typeof exerciseResults.$inferInsert;

/**
 * Learning events - durable timeline for learner engagement and outcomes.
 * It complements completion tables with time spent and first-attempt analysis.
 */
export const learningEvents = mysqlTable("learning_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  certificationId: varchar("certificationId", { length: 200 }),
  courseId: varchar("courseId", { length: 200 }),
  lessonIndex: int("lessonIndex"),
  chapterIndex: int("chapterIndex"),
  exerciseId: varchar("exerciseId", { length: 255 }),
  durationSeconds: int("durationSeconds").notNull().default(0),
  success: int("success"),
  score: int("score"),
  attemptNumber: int("attemptNumber"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LearningEvent = typeof learningEvents.$inferSelect;
export type InsertLearningEvent = typeof learningEvents.$inferInsert;
