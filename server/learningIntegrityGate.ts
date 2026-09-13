import { and, desc, eq } from "drizzle-orm";
import { learnerIntegrityReviews, learningEvents } from "../drizzle/schema";
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
const EXAM_HONEYPOT_EVENT = "integrity_exam_honeypot_triggered";
const PRESENCE_WINDOW_MS = 15 * 60 * 1000;
const TURNSTILE_PUBLIC_HOSTNAMES = [
  "akademy.neodev.click",
  "neopacademy-6qa7lvjq.manus.space",
];

function normalizeHostname(value: string | undefined) {
  return String(value || "").trim().toLowerCase().replace(/\.$/, "").replace(/:\d+$/, "");
}

function firstForwardedHostname(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return normalizeHostname(raw?.split(",")[0]);
}

/** Selects a known public ingress host. `req.hostname` is commonly localhost behind the managed proxy. */
export function resolveTurnstileExpectedHostname(headers: Record<string, string | string[] | undefined>) {
  const candidates = [
    firstForwardedHostname(headers["x-forwarded-host"]),
    firstForwardedHostname(headers["x-original-host"]),
    firstForwardedHostname(headers.host),
  ];
  return candidates.find((candidate) => TURNSTILE_PUBLIC_HOSTNAMES.includes(candidate)) || TURNSTILE_PUBLIC_HOSTNAMES[0];
}

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
  let response: Response;
  let result: { success?: boolean; hostname?: string; action?: string; "error-codes"?: string[] };
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: input.token, idempotency_key: crypto.randomUUID() }),
      signal: AbortSignal.timeout(10_000),
    });
    result = await response.json() as typeof result;
  } catch {
    throw new Error("Le service de vérification ne répond pas. Relancez le contrôle ; vos progrès restent inchangés.");
  }
  const validation = inspectTurnstilePresenceResult({ responseOk: response.ok, result, expectedHostname: input.hostname });
  if (!validation.valid) {
    // Intentionally records only an opaque failure class, never the token, user data or provider payload.
    console.warn(`[Turnstile] Presence verification rejected: ${validation.reason}`);
    throw new Error(validation.reason === "provider_rejected"
      ? "Cloudflare a refusé ce contrôle. Relancez la vérification ; si le problème persiste, contactez l’équipe Neopolis."
      : "La vérification de présence n’a pas pu être validée. Veuillez relancer le contrôle.");
  }
  await recordLearningEvent({ userId: input.userId, eventType: PRESENCE_EVENT, success: 1, metadata: { action: result.action } });
  return getLearningIntegrityGateDecision(input.userId);
}

export function isValidTurnstilePresenceResult(input: {
  responseOk: boolean;
  result: { success?: boolean; hostname?: string; action?: string };
  expectedHostname: string;
}) {
  return inspectTurnstilePresenceResult(input).valid;
}

export function inspectTurnstilePresenceResult(input: {
  responseOk: boolean;
  result: { success?: boolean; hostname?: string; action?: string };
  expectedHostname: string;
}): { valid: boolean; reason: "provider_rejected" | "action_mismatch" | "hostname_mismatch" | "validated" } {
  if (!input.responseOk || input.result.success !== true) return { valid: false, reason: "provider_rejected" };
  if (input.result.action !== "learning_integrity") return { valid: false, reason: "action_mismatch" };
  if (normalizeHostname(input.result.hostname) !== normalizeHostname(input.expectedHostname)) return { valid: false, reason: "hostname_mismatch" };
  return { valid: true, reason: "validated" };
}

/**
 * Records only the existence of an automated honeypot trigger. The bait value
 * is intentionally never retained so it cannot leak through admin activity.
 */
export async function flagExamHoneypotTrigger(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const signals = [{
    id: "exam_honeypot_triggered",
    label: "Champ de contrôle d’examen renseigné",
    details: "Le champ de contrôle invisible aux apprenants a été renseigné lors d’une soumission. La valeur n’est pas conservée.",
    weight: 100,
    evidence: { surface: "exam_submission" },
  }];
  await db.insert(learnerIntegrityReviews).values({
    userId,
    status: "temporary_hold",
    riskScore: 100,
    signals,
    reviewerId: null,
    reviewerNotes: "Signal automatique : soumission d’examen interrompue pour revue humaine.",
    reviewedAt: now,
  }).onDuplicateKeyUpdate({
    set: {
      status: "temporary_hold",
      riskScore: 100,
      signals,
      reviewerId: null,
      reviewerNotes: "Signal automatique : soumission d’examen interrompue pour revue humaine.",
      reviewedAt: now,
    },
  });
  await recordLearningEvent({ userId, eventType: EXAM_HONEYPOT_EVENT, success: 0, metadata: { surface: "exam_submission" } });
}
