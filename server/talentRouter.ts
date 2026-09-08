import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { isAdministrativeRole } from "../shared/roles";
import { logAdminActivity } from "./adminDb";
import { getUserById } from "./db";
import { sendTalentEventEmail } from "./email";
import {
  changeTalentStage,
  createTalentAssignment,
  createTalentEvaluation,
  createTalentEvent,
  createTalentTask,
  ensureTalentStages,
  getMyTalentJourney,
  getTalentOverview,
  getTalentProfileDetail,
  listTalentPortfolio,
  markTalentEventNotification,
  respondToTalentEvent,
  saveTalentStage,
  updateTalentAssignmentStatus,
  updateTalentEventStatus,
  updateTalentProfile,
  updateTalentTaskStatus,
} from "./talentService";

function assertTalentAdmin(ctx: { user: { role: string } }) {
  if (!isAdministrativeRole(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs." });
}

const nullableDate = z.coerce.date().nullable().optional();

export const talentAdminRouter = router({
  stages: protectedProcedure.query(async ({ ctx }) => {
    assertTalentAdmin(ctx);
    return ensureTalentStages();
  }),
  saveStage: protectedProcedure.input(z.object({
    id: z.number().int().positive().optional(),
    key: z.string().trim().min(2).max(80).regex(/^[a-zA-Z0-9_-]+$/),
    label: z.object({
      fr: z.string().trim().min(2).max(120),
      en: z.string().trim().max(120).optional(),
      ar: z.string().trim().max(120).optional(),
    }),
    description: z.object({
      fr: z.string().trim().max(500).optional(),
      en: z.string().trim().max(500).optional(),
      ar: z.string().trim().max(500).optional(),
    }).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    icon: z.string().trim().max(80).optional(),
    sortOrder: z.number().int().min(0).max(1000),
    active: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const stage = await saveTalentStage(input, ctx.user.id);
    await logAdminActivity({
      adminId: ctx.user.id,
      action: input.id ? "update_talent_stage_definition" : "create_talent_stage_definition",
      targetType: "talent_stage",
      targetId: stage.id,
      details: { key: stage.key, active: stage.active },
    });
    return stage;
  }),
  overview: protectedProcedure.query(async ({ ctx }) => {
    assertTalentAdmin(ctx);
    return getTalentOverview(ctx.user.id);
  }),
  portfolio: protectedProcedure.input(z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(160).optional(),
    stageId: z.number().int().positive().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  })).query(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    return listTalentPortfolio(input, ctx.user.id);
  }),
  detail: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    return getTalentProfileDetail(input.userId, ctx.user.id);
  }),
  updateProfile: protectedProcedure.input(z.object({
    userId: z.number().int().positive(),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    availability: z.enum(["unknown", "available", "busy", "unavailable"]),
    headline: z.string().trim().max(300).optional(),
    summary: z.string().trim().max(5000).optional(),
    ownerId: z.number().int().positive().nullable().optional(),
    nextReviewAt: nullableDate,
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const result = await updateTalentProfile(input, ctx.user.id);
    await logAdminActivity({ adminId: ctx.user.id, action: "update_talent_profile", targetType: "user", targetId: input.userId, details: { priority: input.priority, availability: input.availability, nextReviewAt: input.nextReviewAt || null } });
    return result;
  }),
  changeStage: protectedProcedure.input(z.object({ userId: z.number().int().positive(), stageId: z.number().int().positive(), reason: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const result = await changeTalentStage(input, ctx.user.id);
    await logAdminActivity({ adminId: ctx.user.id, action: "change_talent_stage", targetType: "user", targetId: input.userId, details: { stageId: input.stageId, reason: input.reason || null } });
    return result;
  }),
  createEvent: protectedProcedure.input(z.object({
    userId: z.number().int().positive(),
    type: z.enum(["interview", "evaluation", "certification_test", "certification_review", "onboarding", "follow_up", "other"]),
    title: z.string().trim().min(3).max(300),
    description: z.string().trim().max(5000).optional(),
    modality: z.enum(["video", "in_person", "phone", "platform", "external", "other"]),
    startsAt: nullableDate,
    endsAt: nullableDate,
    timezone: z.string().trim().min(1).max(80).default("UTC"),
    location: z.string().trim().max(500).optional(),
    meetingUrl: z.string().url().max(1000).optional().or(z.literal("")),
    certificationId: z.string().trim().max(200).optional(),
    learnerInstructions: z.string().trim().max(5000).optional(),
    privateNotes: z.string().trim().max(5000).optional(),
    visibleToLearner: z.boolean().default(true),
    notifyLearner: z.boolean().default(true),
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const { notifyLearner, ...eventInput } = input;
    const event = await createTalentEvent(eventInput, ctx.user.id);
    if (notifyLearner && input.visibleToLearner) {
      try {
        const learner = await getUserById(input.userId);
        if (!learner?.email) throw new Error("Aucune adresse e-mail disponible pour ce membre.");
        const sent = await sendTalentEventEmail({ to: learner.email, name: learner.name || "", title: event.title, description: event.description, modality: event.modality, startsAt: event.startsAt, timezone: event.timezone, location: event.location, meetingUrl: event.meetingUrl, instructions: event.learnerInstructions });
        if (!sent) throw new Error("Service e-mail indisponible.");
        await markTalentEventNotification(event.id, "sent");
      } catch (error) {
        await markTalentEventNotification(event.id, "failed", error instanceof Error ? error.message : "Notification impossible");
      }
    }
    await logAdminActivity({ adminId: ctx.user.id, action: "create_talent_event", targetType: "user", targetId: input.userId, details: { eventId: event.id, type: event.type, modality: event.modality, visibleToLearner: input.visibleToLearner } });
    return event;
  }),
  updateEventStatus: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), status: z.enum(["requested", "scheduled", "completed", "cancelled", "missed"]) })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const event = await updateTalentEventStatus(input, ctx.user.id);
    if (!event) throw new TRPCError({ code: "NOT_FOUND" });
    await logAdminActivity({ adminId: ctx.user.id, action: "update_talent_event", targetType: "user", targetId: event.userId, details: { eventId: event.id, status: event.status } });
    return event;
  }),
  createAssignment: protectedProcedure.input(z.object({
    userId: z.number().int().positive(),
    kind: z.enum(["workgroup", "mission", "opportunity", "recruitment", "ambassador", "partnership"]),
    title: z.string().trim().min(3).max(300),
    description: z.string().trim().max(5000).optional(),
    status: z.enum(["proposed", "active", "paused", "completed", "declined", "withdrawn"]).default("proposed"),
    startsAt: nullableDate,
    endsAt: nullableDate,
    visibleToLearner: z.boolean().default(true),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const assignment = await createTalentAssignment(input, ctx.user.id);
    await logAdminActivity({ adminId: ctx.user.id, action: "create_talent_assignment", targetType: "user", targetId: input.userId, details: { assignmentId: assignment.id, kind: assignment.kind, status: assignment.status } });
    return assignment;
  }),
  updateAssignmentStatus: protectedProcedure.input(z.object({ assignmentId: z.number().int().positive(), status: z.enum(["proposed", "active", "paused", "completed", "declined", "withdrawn"]) })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const assignment = await updateTalentAssignmentStatus(input);
    if (!assignment) throw new TRPCError({ code: "NOT_FOUND" });
    await logAdminActivity({ adminId: ctx.user.id, action: "update_talent_assignment", targetType: "user", targetId: assignment.userId, details: { assignmentId: assignment.id, status: assignment.status } });
    return assignment;
  }),
  createTask: protectedProcedure.input(z.object({
    userId: z.number().int().positive(), title: z.string().trim().min(3).max(300), description: z.string().trim().max(5000).optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), dueAt: nullableDate, ownerId: z.number().int().positive().nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const task = await createTalentTask(input, ctx.user.id);
    await logAdminActivity({ adminId: ctx.user.id, action: "create_talent_task", targetType: "user", targetId: input.userId, details: { taskId: task.id, priority: task.priority, dueAt: task.dueAt } });
    return task;
  }),
  updateTaskStatus: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), status: z.enum(["open", "in_progress", "completed", "cancelled"]) })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    const task = await updateTalentTaskStatus(input);
    if (!task) throw new TRPCError({ code: "NOT_FOUND" });
    await logAdminActivity({ adminId: ctx.user.id, action: "update_talent_task", targetType: "user", targetId: task.userId, details: { taskId: task.id, status: task.status } });
    return task;
  }),
  createEvaluation: protectedProcedure.input(z.object({
    userId: z.number().int().positive(), eventId: z.number().int().positive().nullable().optional(), evaluationType: z.string().trim().min(2).max(120),
    score: z.number().min(0).max(100000).nullable().optional(), maxScore: z.number().positive().max(100000).nullable().optional(),
    recommendation: z.enum(["continue", "develop", "certify", "assign", "recruit", "ambassador", "hold", "decline"]),
    rubric: z.unknown().optional(), strengths: z.string().trim().max(5000).optional(), improvements: z.string().trim().max(5000).optional(),
    learnerFeedback: z.string().trim().max(5000).optional(), privateNotes: z.string().trim().max(5000).optional(), visibleToLearner: z.boolean().default(false),
  })).mutation(async ({ ctx, input }) => {
    assertTalentAdmin(ctx);
    if (input.score != null && input.maxScore != null && input.score > input.maxScore) throw new TRPCError({ code: "BAD_REQUEST", message: "Le score ne peut pas dépasser le maximum." });
    const evaluation = await createTalentEvaluation(input, ctx.user.id);
    await logAdminActivity({ adminId: ctx.user.id, action: "create_talent_evaluation", targetType: "user", targetId: input.userId, details: { evaluationId: evaluation.id, recommendation: evaluation.recommendation, visibleToLearner: input.visibleToLearner } });
    return evaluation;
  }),
});

export const talentLearnerRouter = router({
  getMine: protectedProcedure.query(async ({ ctx }) => getMyTalentJourney(ctx.user.id)),
  respondToEvent: protectedProcedure.input(z.object({ eventId: z.number().int().positive(), responseStatus: z.enum(["accepted", "declined", "reschedule_requested"]), note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
    try {
      return await respondToTalentEvent(input, ctx.user.id);
    } catch (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Réponse impossible" });
    }
  }),
});
