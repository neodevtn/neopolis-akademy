export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Redirect to the local login page instead of Manus OAuth
export const getLoginUrl = () => {
  return "/login";
};
