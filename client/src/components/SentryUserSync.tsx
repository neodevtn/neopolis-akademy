import * as Sentry from "@sentry/react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

/**
 * Invisible component that synchronizes the authenticated user's identity
 * with Sentry so that errors, performance traces, and feedback submissions
 * are automatically associated with the current user.
 *
 * Place this inside the provider tree (after trpc/QueryClient) so useAuth works.
 */
export function SentryUserSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      Sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.name ?? undefined,
      });
      // Add role as a tag for filtering in Sentry
      Sentry.setTag("user.role", user.role ?? "user");
    } else {
      // Clear user context on logout
      Sentry.setUser(null);
      Sentry.setTag("user.role", undefined);
    }
  }, [isAuthenticated, user]);

  return null;
}
