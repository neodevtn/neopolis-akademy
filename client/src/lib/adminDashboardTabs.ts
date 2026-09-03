export const ADMIN_DASHBOARD_TABS = [
  "candidatures",
  "communications",
  "invitations",
  "analytics",
  "activity",
  "referrals",
] as const;

export type AdminDashboardTab = (typeof ADMIN_DASHBOARD_TABS)[number];

export function resolveAdminDashboardTab(value: string | null | undefined): AdminDashboardTab {
  return ADMIN_DASHBOARD_TABS.includes(value as AdminDashboardTab)
    ? value as AdminDashboardTab
    : "candidatures";
}
