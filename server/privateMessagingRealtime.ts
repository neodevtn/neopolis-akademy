import type { IncomingMessage, Server } from "http";
import type { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";
import { isAdministrativeRole } from "../shared/roles";
import { sdk } from "./_core/sdk";

export type PrivateMessagingRealtimeEvent = {
  type: "conversation.created" | "message.created" | "conversation.status.changed" | "conversation.read";
  conversationId: number;
  learnerId: number;
  audience: "learner" | "admins" | "both";
  recipientUserIds?: number[];
};

type AuthenticatedSocket = WebSocket & { neopolisUserId?: number; neopolisRole?: string };

let webSocketServer: WebSocketServer | null = null;

function requestHostHeader(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",")[0]?.trim().toLocaleLowerCase("en-US") || null;
}

export function isSameOriginUpgrade(request: IncomingMessage) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLocaleLowerCase("en-US");
    const candidateHosts = [
      requestHostHeader(request.headers.host),
      requestHostHeader(request.headers["x-forwarded-host"]),
      requestHostHeader(request.headers["x-original-host"]),
    ];
    return candidateHosts.includes(originHost);
  } catch {
    return false;
  }
}

function closeUpgrade(socket: Duplex, status = 401, message = "Unauthorized") {
  socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

export function shouldReceivePrivateMessagingEvent(socket: Pick<AuthenticatedSocket, "neopolisUserId" | "neopolisRole">, event: PrivateMessagingRealtimeEvent) {
  if (event.recipientUserIds && (!socket.neopolisUserId || !event.recipientUserIds.includes(socket.neopolisUserId))) return false;
  const isAdmin = isAdministrativeRole(socket.neopolisRole);
  if (event.audience === "admins") return isAdmin;
  if (event.audience === "learner") return socket.neopolisUserId === event.learnerId;
  return isAdmin || socket.neopolisUserId === event.learnerId;
}

export function registerPrivateMessagingWebSocket(server: Server) {
  if (webSocketServer) return webSocketServer;
  const wss = new WebSocketServer({ noServer: true, clientTracking: true, maxPayload: 8_192 });
  webSocketServer = wss;
  server.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname !== "/api/realtime/private-messaging") return;
    if (!isSameOriginUpgrade(request)) return closeUpgrade(socket, 403, "Forbidden");
    try {
      const user = await sdk.authenticateRequest(request as never);
      wss.handleUpgrade(request, socket, head, (client) => {
        const authenticatedClient = client as AuthenticatedSocket;
        authenticatedClient.neopolisUserId = user.id;
        authenticatedClient.neopolisRole = user.role;
        wss.emit("connection", authenticatedClient, request);
      });
    } catch {
      closeUpgrade(socket);
    }
  });
  wss.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("message", (raw) => {
      // The socket is notification-only. Writes are rejected to ensure all messages
      // traverse the persisted, authorised tRPC mutation path.
      if (String(raw).length > 512) socket.close(1009, "Payload too large");
    });
    socket.send(JSON.stringify({ type: "private-messaging.ready" }));
  });
  return wss;
}

export function publishPrivateMessagingEvent(event: PrivateMessagingRealtimeEvent) {
  if (!webSocketServer) return;
  const payload = JSON.stringify(event);
  for (const socket of Array.from(webSocketServer.clients)) {
    const client = socket as AuthenticatedSocket;
    if (client.readyState === WebSocket.OPEN && shouldReceivePrivateMessagingEvent(client, event)) client.send(payload);
  }
}
