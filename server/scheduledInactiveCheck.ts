import { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { users, trainingProgress, videoProgress, adminNotifications } from "../drizzle/schema";
import { eq, and, lt, sql, notInArray, count } from "drizzle-orm";
import { createAdminNotification } from "./notificationsDb";

/**
 * Heartbeat handler: checks for learners inactive > 7 days
 * and creates admin notifications for each one.
 * 
 * Runs daily at 08:00 UTC via Heartbeat cron.
 * Path: POST /api/scheduled/inactive-learner-check
 */
export async function inactiveLearnerCheckHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find users who are NOT admin, NOT blocked, and whose lastSignedIn is > 7 days ago
    // Also check that they have at least some training progress (i.e. they are actual learners)
    const inactiveUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "user"),
          eq(users.blocked, 0),
          lt(users.lastSignedIn, sevenDaysAgo)
        )
      );

    // Filter to only those who have at least one training progress entry (actual learners)
    const learnerIds: number[] = [];
    if (inactiveUsers.length > 0) {
      const userIds = inactiveUsers.map(u => u.id);
      const learnersWithProgress = await db
        .select({ userId: trainingProgress.userId })
        .from(trainingProgress)
        .where(sql`${trainingProgress.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(trainingProgress.userId);
      
      learnersWithProgress.forEach(lp => learnerIds.push(lp.userId));
    }

    // Also check video progress for learners who watched videos but haven't completed lessons
    if (inactiveUsers.length > 0) {
      const userIds = inactiveUsers.map(u => u.id);
      const learnersWithVideo = await db
        .select({ userId: videoProgress.userId })
        .from(videoProgress)
        .where(sql`${videoProgress.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(videoProgress.userId);
      
      learnersWithVideo.forEach(lv => {
        if (!learnerIds.includes(lv.userId)) learnerIds.push(lv.userId);
      });
    }

    // Check which inactive learners already have a recent notification (avoid spam)
    const recentNotifs = await db
      .select({ targetId: adminNotifications.targetId })
      .from(adminNotifications)
      .where(
        and(
          eq(adminNotifications.type, "inactive_learner"),
          sql`${adminNotifications.createdAt} > ${sevenDaysAgo}`
        )
      );
    const recentlyNotifiedIds = new Set(recentNotifs.map(n => n.targetId));

    // Create notifications for inactive learners not already notified
    let createdCount = 0;
    for (const userId of learnerIds) {
      if (recentlyNotifiedIds.has(userId)) continue;
      
      const userInfo = inactiveUsers.find(u => u.id === userId);
      if (!userInfo) continue;

      const daysSinceLogin = Math.floor((Date.now() - new Date(userInfo.lastSignedIn).getTime()) / (1000 * 60 * 60 * 24));

      await createAdminNotification({
        type: "inactive_learner",
        title: `Apprenant inactif : ${userInfo.name || userInfo.email || "Utilisateur #" + userId}`,
        message: `Dernière connexion il y a ${daysSinceLogin} jours. Aucune activité de formation détectée.`,
        targetType: "user",
        targetId: userId,
      });
      createdCount++;
    }

    return res.json({
      ok: true,
      checked: inactiveUsers.length,
      learners: learnerIds.length,
      notificationsCreated: createdCount,
      skippedAlreadyNotified: learnerIds.length - createdCount,
    });
  } catch (error: any) {
    console.error("Inactive learner check failed:", error);
    return res.status(500).json({
      error: error.message || "Unknown error",
      stack: error.stack,
      context: { url: req.url, taskUid: (error as any).taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}
