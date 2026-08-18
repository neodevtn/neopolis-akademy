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

export const COURSE_PROGRESS_STATUSES = ["started", "completed"] as const;
export type CourseProgressStatus = (typeof COURSE_PROGRESS_STATUSES)[number];

export const COURSE_PROGRESS_STATUS_LABELS: Record<CourseProgressStatus, string> = {
  started: "Cours entamé",
  completed: "Cours terminé",
};

export type CommunicationRecipientFilterInput = {
  audience?: CommunicationAudience;
  tags?: number[];
  status?: string[];
  role?: string[];
  competencyId?: string;
  minCompetencyLevel?: number;
  courseId?: string;
  courseProgressStatus?: CourseProgressStatus;
  activityWithinDays?: number;
  manualEmails?: string[];
};
