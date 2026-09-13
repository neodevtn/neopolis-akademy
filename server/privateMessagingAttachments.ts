import { asc, eq, inArray } from "drizzle-orm";
import { privateMessageAttachments } from "../drizzle/schema";
import {
  PRIVATE_MESSAGE_ATTACHMENT_LIMITS,
  PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES,
  type PrivateMessageAttachmentMimeType,
} from "../shared/privateMessaging";
import { getDb } from "./db";
import { storagePut } from "./storage";

export type PrivateMessageAttachmentUpload = {
  filename: string;
  mimeType: PrivateMessageAttachmentMimeType;
  base64: string;
};

export type PrivateMessageAttachmentView = {
  id: number;
  originalName: string;
  mimeType: PrivateMessageAttachmentMimeType;
  sizeBytes: number;
  url: string;
};

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function detectMimeType(bytes: Uint8Array): PrivateMessageAttachmentMimeType | null {
  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) return "image/gif";
  if (startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) && Buffer.from(bytes.slice(8, 12)).toString("ascii") === "WEBP") return "image/webp";
  if (startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  return null;
}

function extensionFor(mimeType: PrivateMessageAttachmentMimeType) {
  switch (mimeType) {
    case "image/jpeg": return ".jpg";
    case "image/png": return ".png";
    case "image/gif": return ".gif";
    case "image/webp": return ".webp";
    default: return ".pdf";
  }
}

function sanitizeFilename(filename: string, mimeType: PrivateMessageAttachmentMimeType) {
  const cleaned = filename.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^[_\.]+|[_\.]+$/g, "").slice(0, 120) || "piece-jointe";
  const base = cleaned.replace(/\.[a-z0-9]{1,8}$/i, "") || "piece-jointe";
  return `${base}${extensionFor(mimeType)}`;
}

export function preparePrivateMessageAttachmentUpload(input: PrivateMessageAttachmentUpload) {
  if (!PRIVATE_MESSAGE_ATTACHMENT_MIME_TYPES.includes(input.mimeType)) throw new Error("Seules les images et les PDF sont autorisés.");
  if (input.base64.length > PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxBase64Chars || !/^[a-zA-Z0-9+/]+={0,2}$/.test(input.base64)) throw new Error("La pièce jointe est invalide.");
  const bytes = Buffer.from(input.base64, "base64");
  if (!bytes.byteLength || bytes.byteLength > PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxBytes) throw new Error("Chaque pièce jointe doit peser au maximum 10 Mo.");
  const detectedMimeType = detectMimeType(bytes);
  if (!detectedMimeType || detectedMimeType !== input.mimeType) throw new Error("Le contenu du fichier ne correspond pas au type déclaré.");
  return { bytes, mimeType: detectedMimeType, filename: sanitizeFilename(input.filename, detectedMimeType) };
}

export async function storePrivateMessageAttachments(input: { conversationId: number; messageId: number; uploadedByUserId: number; attachments: PrivateMessageAttachmentUpload[] }) {
  if (!input.attachments.length) return [] as PrivateMessageAttachmentView[];
  if (input.attachments.length > PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage) throw new Error(`Vous pouvez joindre au maximum ${PRIVATE_MESSAGE_ATTACHMENT_LIMITS.maxFilesPerMessage} fichiers.`);
  const db = await requireDb();
  const stored: PrivateMessageAttachmentView[] = [];
  for (const attachment of input.attachments) {
    const prepared = preparePrivateMessageAttachmentUpload(attachment);
    const uploaded = await storagePut(`private-messaging/${input.conversationId}/${input.messageId}/${prepared.filename}`, prepared.bytes, prepared.mimeType);
    const [result] = await db.insert(privateMessageAttachments).values({
      conversationId: input.conversationId,
      messageId: input.messageId,
      storageKey: uploaded.key,
      originalName: prepared.filename,
      mimeType: prepared.mimeType,
      sizeBytes: prepared.bytes.byteLength,
      uploadedByUserId: input.uploadedByUserId,
    }).$returningId();
    const id = result?.id;
    if (!id) throw new Error("Impossible d’enregistrer la pièce jointe.");
    stored.push({ id, originalName: prepared.filename, mimeType: prepared.mimeType, sizeBytes: prepared.bytes.byteLength, url: `/api/assets/${uploaded.key}` });
  }
  return stored;
}

export async function listPrivateMessageAttachments(messageIds: number[]) {
  if (!messageIds.length) return new Map<number, PrivateMessageAttachmentView[]>();
  const db = await requireDb();
  const rows = await db.select().from(privateMessageAttachments).where(inArray(privateMessageAttachments.messageId, messageIds)).orderBy(asc(privateMessageAttachments.createdAt), asc(privateMessageAttachments.id));
  const byMessage = new Map<number, PrivateMessageAttachmentView[]>();
  for (const row of rows) {
    const values = byMessage.get(row.messageId) || [];
    values.push({ id: row.id, originalName: row.originalName, mimeType: row.mimeType as PrivateMessageAttachmentMimeType, sizeBytes: row.sizeBytes, url: `/api/assets/${row.storageKey}` });
    byMessage.set(row.messageId, values);
  }
  return byMessage;
}

export async function getPrivateMessageAttachmentByStorageKey(storageKey: string) {
  const db = await requireDb();
  const [row] = await db.select({ conversationId: privateMessageAttachments.conversationId }).from(privateMessageAttachments).where(eq(privateMessageAttachments.storageKey, storageKey)).limit(1);
  return row ?? null;
}
