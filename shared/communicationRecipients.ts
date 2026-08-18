export const COMMUNICATION_AUDIENCES = [
  "all",
  "invited",
  "registered_invitees",
  "learners_inactive",
  "learners_started",
  "diploma_holders",
  "competency_level",
] as const;

export type CommunicationAudience = (typeof COMMUNICATION_AUDIENCES)[number];

export const COMMUNICATION_AUDIENCE_LABELS: Record<CommunicationAudience, string> = {
  all: "Tout le monde",
  invited: "Tous les invités",
  registered_invitees: "Invités inscrits",
  learners_inactive: "Apprenants inactifs",
  learners_started: "Apprenants ayant commencé",
  diploma_holders: "Diplômés certifiés",
  competency_level: "Compétence acquise à un niveau donné",
};
