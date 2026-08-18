import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { adminTags, exerciseResults, learnerIntegrityReviews, learningEvents, userTags, users, videoProgress } from "../drizzle/schema";
import { assessLearningIntegrity, type IntegrityAssessment } from "../shared/integritySignals";

const INTEGRITY_TAG_NAME = "Suspicion d’intégrité · à vérifier";
const INTEGRITY_TAG_COLOR = "#d97706";

type ReviewStatus = "review_required" | "confirmed" | "dismissed";

async function assessmentForUser(userId: number): Promise<IntegrityAssessment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [events, videos, exercises] = await Promise.all([
    db.select().from(learningEvents).where(eq(learningEvents.userId, userId)).orderBy(learningEvents.createdAt),
    db.select().from(videoProgress).where(eq(videoProgress.userId, userId)),
    db.select().from(exerciseResults).where(eq(exerciseResults.userId, String(userId))),
  ]);
  return assessLearningIntegrity({ events, watchedVideoCount: videos.length, exerciseResults: exercises });
}

async function getIntegrityTagId(createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db.select().from(adminTags).where(eq(adminTags.name, INTEGRITY_TAG_NAME)).limit(1);
  if (existing) return existing.id;
  const result = await db.insert(adminTags).values({ name: INTEGRITY_TAG_NAME, color: INTEGRITY_TAG_COLOR, description: "Signal de revue humaine pour comportement d’apprentissage atypique ; ce tag ne constitue pas une preuve ni une sanction.", createdBy });
  return Number(result[0].insertId);
}

async function setIntegrityTag(userId: number, reviewerId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const tagId = await getIntegrityTagId(reviewerId);
  if (!enabled) {
    await db.delete(userTags).where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId)));
    return;
  }
  const [existing] = await db.select().from(userTags).where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId))).limit(1);
  if (!existing) await db.insert(userTags).values({ userId, tagId, assignedBy: reviewerId });
}

export async function getLearnerIntegrityReview(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [assessment, reviews] = await Promise.all([
    assessmentForUser(userId),
    db.select().from(learnerIntegrityReviews).where(eq(learnerIntegrityReviews.userId, userId)).limit(1),
  ]);
  return { assessment, review: reviews[0] || null };
}

export async function getIntegrityReviewQueue() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [learners, reviews] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, blocked: users.blocked, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.role, "user")),
    db.select().from(learnerIntegrityReviews).orderBy(desc(learnerIntegrityReviews.updatedAt)),
  ]);
  const reviewByUser = new Map(reviews.map((review) => [review.userId, review]));
  const rows = await Promise.all(learners.map(async (learner) => {
    const assessment = await assessmentForUser(learner.id);
    return { ...learner, assessment, review: reviewByUser.get(learner.id) || null };
  }));
  return rows
    .filter((row) => row.assessment.riskScore >= 20 || row.review)
    .sort((a, b) => b.assessment.riskScore - a.assessment.riskScore || Number(b.review?.updatedAt || 0) - Number(a.review?.updatedAt || 0));
}

export async function reviewLearnerIntegrity(input: { userId: number; reviewerId: number; status: ReviewStatus; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const assessment = await assessmentForUser(input.userId);
  const now = new Date();
  await db.insert(learnerIntegrityReviews).values({
    userId: input.userId,
    status: input.status,
    riskScore: assessment.riskScore,
    signals: assessment.signals,
    reviewerId: input.reviewerId,
    reviewerNotes: input.notes?.trim() || null,
    reviewedAt: now,
  }).onDuplicateKeyUpdate({
    set: {
      status: input.status,
      riskScore: assessment.riskScore,
      signals: assessment.signals,
      reviewerId: input.reviewerId,
      reviewerNotes: input.notes?.trim() || null,
      reviewedAt: now,
    },
  });
  await setIntegrityTag(input.userId, input.reviewerId, input.status !== "dismissed");
  const [review] = await db.select().from(learnerIntegrityReviews).where(eq(learnerIntegrityReviews.userId, input.userId)).limit(1);
  return { assessment, review };
}
