import { getDb } from "./db";
import { adminNotifications } from "../drizzle/schema";
import { desc, eq, count, and, sql } from "drizzle-orm";

export async function getAdminNotifications(page: number = 1, pageSize: number = 20, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const offset = (page - 1) * pageSize;
  const conditions = unreadOnly ? eq(adminNotifications.isRead, 0) : undefined;
  const items = conditions
    ? await db.select().from(adminNotifications).where(conditions).orderBy(desc(adminNotifications.createdAt)).limit(pageSize).offset(offset)
    : await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(pageSize).offset(offset);
  const countResult = conditions
    ? await db.select({ total: count() }).from(adminNotifications).where(conditions)
    : await db.select({ total: count() }).from(adminNotifications);
  return { items, total: countResult[0]?.total || 0, page, pageSize };
}

export async function getUnreadNotificationCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.select({ count: count() }).from(adminNotifications).where(eq(adminNotifications.isRead, 0));
  return { count: result?.count || 0 };
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.id, id));
}

export async function markAllNotificationsRead() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.isRead, 0));
}

export async function createAdminNotification(data: {
  type: string;
  title: string;
  message?: string;
  targetType?: string;
  targetId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminNotifications).values({
    type: data.type,
    title: data.title,
    message: data.message || null,
    targetType: data.targetType || null,
    targetId: data.targetId || null,
  });
}
