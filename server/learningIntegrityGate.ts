import { and, desc, eq } from "drizzle-orm";
import { learningEvents } from "../drizzle/schema";
import { getDb, recordLearningEvent } from "./db";
import { getLearnerIntegrityReview } from "./integrityService";
import { TRPCError } from "@trpc/server";

export type IntegrityGateStatus = "allow" | "challenge_required" | "temporarily_suspended";

type IntegrityReviewStatus = "review_required" | "confirmed" | "dismissed" | "temporary_hold" | null | undefined;

export type LearningIntegrityGateDecision = {
  status: IntegrityGateStatus;
  riskScore: number;
  signalIds: string[];
  verificationExpiresAt: Date | null;
  message: string;
};

const PRESENCE_EVENT = "integrity_presence_verified";
const PRESENCE_WINDOW_MS = 15 * 60 * 1000;

export function resolveLearningIntegrityGate(input: {
  riskScore: number;
  signalIds: string[];
  reviewStatus?: IntegrityReviewStatus;
  presenceVerifiedAt?: Date | null;
  now?: Date;
}): LearningIntegrityGateDecision {
  const now = input.now || new Date();
  const verificationExpiresAt = input.presenceVerifiedAt
    ? new Date(input.presenceVerifiedAt.getTime() + PRESENCE_WINDOW_MS)
    : null;
  const hasValidPresenceVerification = Boolean(verificationExpiresAt && verificationExpiresAt > now);

  if (input.reviewStatus === "temporary_hold" || input.riskScore >= 60) {
    return {
      status: "temporarily_suspended",
      riskScore: input.riskScore,
      signalIds: input.signalIds,
      verificationExpiresAt,
      message: "Les validations et examens sont temporairement suspendus afin qu’un administrateur vérifie des signaux d’activité atypique. La lecture des cours et les progrès déjà acquis restent disponibles.",
    };
  }
  if (input.riskScore >= 35 && !hasValidPresenceVerification) {
    return {
      status: "challenge_required",
      riskScore: input.riskScore,
      signalIds: input.signalIds,
      verificationExpiresAt,
      message: "Une courte vérification de présence est requise avant de poursuivre les validations ou un examen. Elle protège l’équité des parcours et ne modifie pas vos progrès acquis.",
    };
  }
  return {
    status: "allow",
    riskScore: input.riskScore,
    signalIds: input.signalIds,
    verificationExpiresAt,
    message: "Les validations pédagogiques peuvent se poursuivre.",
  };
}

async function getLastPresenceVerification(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [event] = await db.select({ createdAt: learningEvents.createdAt })
    .from(learningEvents)
    .where(and(eq(learningEvents.userId, userId), eq(learningEvents.eventType, PRESENCE_EVENT)))
    .orderBy(desc(learningEvents.createdAt))
    .limit(1);
  return event?.createdAt ? new Date(event.createdAt) : null;
}

export async function getLearningIntegrityGateDecision(userId: number, role?: string | null) {
  if (role === "admin") {
    return resolveLearningIntegrityGate({ riskScore: 0, signalIds: [] });
  }
  const [{ assessment, review }, presenceVerifiedAt] = await Promise.all([
    getLearnerIntegrityReview(userId),
    getLastPresenceVerification(userId),
  ]);
  return resolveLearningIntegrityGate({
    riskScore: assessment.riskScore,
    signalIds: assessment.signals.map((signal) => signal.id),
    reviewStatus: review?.status,
    presenceVerifiedAt,
  });
}

export async function requireLearningIntegrityClearance(input: { userId: number; role?: string | null }) {
  const decision = await getLearningIntegrityGateDecision(input.userId, input.role);
  if (decision.status === "allow") return decision;
  throw new TRPCError({
    code: decision.status === "challenge_required" ? "PRECONDITION_FAILED" : "FORBIDDEN",
    message: decision.message,
    cause: { integrityGate: decision },
  });
}

export async function verifyLearningIntegrityPresence(input: { userId: number; token: string; hostname: string }) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("La vérification de présence n’est pas configurée.");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret, response: input.token, idempotency_key: crypto.randomUUID() }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string; "error-codes"?: string[] };
  if (!response.ok || !result.success || result.hostname !== input.hostname || result.action !== "learning_integrity") {
    throw new Error("La vérification de présence n’a pas pu être validée. Veuillez réessayer.");
  }
  await recordLearningEvent({ userId: input.userId, eventType: PRESENCE_EVENT, success: 1, metadata: { action: result.action } });
  return getLearningIntegrityGateDecision(input.userId);
}
