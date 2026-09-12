import { describe, expect, it } from "vitest";
import { isSameOriginUpgrade, shouldReceivePrivateMessagingEvent } from "./privateMessagingRealtime";

const event = {
  type: "message.created" as const,
  conversationId: 42,
  learnerId: 7,
  audience: "learner" as const,
};

describe("diffusion WebSocket de messagerie privée", () => {
  it("accepte l’origine publique quand un proxy transmet un hôte interne", () => {
    expect(isSameOriginUpgrade({ headers: { origin: "https://akademy.neodev.click", host: "internal.service", "x-forwarded-host": "akademy.neodev.click" } } as any)).toBe(true);
    expect(isSameOriginUpgrade({ headers: { origin: "https://akademy.neodev.click", host: "internal.service", "x-forwarded-host": "another.example" } } as any)).toBe(false);
  });

  it("ne transmet un événement apprenant qu’au propriétaire du fil", () => {
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "user" }, event)).toBe(true);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 8, neopolisRole: "user" }, event)).toBe(false);
  });

  it("transmet les événements d’administration aux seuls rôles autorisés", () => {
    const adminEvent = { ...event, audience: "admins" as const };
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "admin" }, adminEvent)).toBe(true);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "admin_learner" }, adminEvent)).toBe(true);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "user" }, adminEvent)).toBe(false);
  });

  it("diffuse une mise à jour de statut aux admins et au propriétaire, sans élargir l’audience", () => {
    const sharedEvent = { ...event, type: "conversation.status.changed" as const, audience: "both" as const };
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "user" }, sharedEvent)).toBe(true);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 8, neopolisRole: "user" }, sharedEvent)).toBe(false);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 8, neopolisRole: "admin" }, sharedEvent)).toBe(true);
  });

  it("respecte une liste explicite de destinataires web sans affaiblir les droits d’audience", () => {
    const limitedEvent = { ...event, audience: "both" as const, recipientUserIds: [7] };
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 7, neopolisRole: "user" }, limitedEvent)).toBe(true);
    expect(shouldReceivePrivateMessagingEvent({ neopolisUserId: 8, neopolisRole: "admin" }, limitedEvent)).toBe(false);
  });
});
