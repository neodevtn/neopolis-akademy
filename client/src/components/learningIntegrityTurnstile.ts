export const TURNSTILE_WIDGET_TIMEOUT_MS = 20_000;
export const TURNSTILE_VERIFICATION_TIMEOUT_MS = 15_000;

export type PresenceChallengeState = {
  phase: "loading_widget" | "awaiting_challenge" | "verifying" | "verified" | "error";
  error: string;
};

export type PresenceChallengeEvent =
  | { type: "widget_ready" }
  | { type: "verification_started" }
  | { type: "verification_succeeded" }
  | { type: "failed"; message: string }
  | { type: "retry" };

export const initialPresenceChallengeState: PresenceChallengeState = {
  phase: "loading_widget",
  error: "",
};

export function reducePresenceChallenge(
  state: PresenceChallengeState,
  event: PresenceChallengeEvent,
): PresenceChallengeState {
  switch (event.type) {
    case "widget_ready":
      return { phase: "awaiting_challenge", error: "" };
    case "verification_started":
      return { phase: "verifying", error: "" };
    case "verification_succeeded":
      return { phase: "verified", error: "" };
    case "failed":
      return { phase: "error", error: event.message };
    case "retry":
      return { phase: "loading_widget", error: "" };
    default:
      return state;
  }
}

