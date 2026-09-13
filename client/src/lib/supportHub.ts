export type SupportHubAction = "open-conversations" | "new-conversation" | "report-technical-issue" | "open-tektek" | "open-conversation";

export type SupportHubEventDetail = {
  action: SupportHubAction;
  conversationId?: number;
};

export const SUPPORT_HUB_EVENT = "neopolis:open-support-action";

/** Opens an existing assistance surface without coupling global UI components together. */
export function dispatchSupportHubAction(detail: SupportHubEventDetail, target: EventTarget = window) {
  target.dispatchEvent(new CustomEvent<SupportHubEventDetail>(SUPPORT_HUB_EVENT, { detail }));
}
