import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@shared/const";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const SALT_ROUNDS = 10;

export function registerAuthRoutes(app: Express) {
  // Rate limiter for login: max 5 attempts per IP per 15 minutes
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes." },
  });

  // Rate limiter for forgot-password: max 3 requests per IP per 15 minutes
  const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de demandes de réinitialisation. Veuillez réessayer dans 15 minutes." },
  });

  // POST /api/auth/login - Authenticate with email/password
  app.post("/api/auth/login", loginLimiter, async (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    try {
      // Find user by email
      const user = await db.getUserByEmail(email.toLowerCase().trim());

      if (!user) {
        res.status(401).json({ error: "Identifiants incorrects" });
        return;
      }

      if (user.blocked === 1) {
        res.status(403).json({ error: "Votre compte a été désactivé. Contactez l'administrateur." });
        return;
      }

      if (!user.passwordHash) {
        res.status(401).json({ error: "Ce compte n'a pas de mot de passe configuré. Contactez l'administrateur." });
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Identifiants incorrects" });
        return;
      }

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || email,
        expiresInMs: SESSION_DURATION_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.json({ success: true, name: user.name, role: user.role });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Erreur lors de la connexion" });
    }
  });

  // POST /api/auth/register - DISABLED: registration only via invitation
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    res.status(403).json({ error: "L'inscription libre est désactivée. Vous devez recevoir une invitation pour créer un compte." });
  });

  // POST /api/auth/forgot-password - Request password reset email
  app.post("/api/auth/forgot-password", forgotPasswordLimiter, async (req: Request, res: Response) => {
    const { email } = req.body || {};

    if (!email) {
      res.status(400).json({ error: "Email requis" });
      return;
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.getUserByEmail(normalizedEmail);

      // If no user account exists, check if they are an accepted candidate without an account
      if (!user) {
        try {
          // Check if this email belongs to an accepted candidate
          const { getDb } = await import("./db");
          const { applications, userInvitations } = await import("../drizzle/schema");
          const { eq, and } = await import("drizzle-orm");
          const dbConn = await getDb();
          if (dbConn) {
            const [candidate] = await dbConn.select().from(applications)
              .where(and(eq(applications.email, normalizedEmail), eq(applications.status, "selectionne")));
            
            if (candidate) {
              // Accepted candidate without account - send them an invitation
              const { createInvitation } = await import("./db");
              const { sendInvitationEmail } = await import("./email");
              const invitation = await createInvitation(normalizedEmail, `${candidate.firstName} ${candidate.lastName}`.trim(), 1);
              const baseUrl = `${req.protocol}://${req.get('host')}`;
              const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;
              await sendInvitationEmail({
                to: normalizedEmail,
                name: `${candidate.firstName} ${candidate.lastName}`.trim(),
                language: "fr",
                invitedBy: "Neopolis Akademy",
                invitationLink,
              });
              console.log(`[Auth] Sent invitation to accepted candidate without account: ${normalizedEmail}`);
            }
          }
        } catch (invErr) {
          console.error("[Auth] Error checking/sending invitation for candidate:", invErr);
        }
        // Always return same success message to prevent email enumeration
        res.json({ success: true, message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
        return;
      }

      // Generate secure token
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.createPasswordResetToken(user.id, token, expiresAt);

      // Build reset link
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      // Send email
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail({
        to: normalizedEmail,
        name: user.name || normalizedEmail,
        resetLink,
      });

      res.json({ success: true, message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
    } catch (error) {
      console.error("[Auth] Forgot password failed", error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
  });

  // POST /api/auth/reset-password - Reset password with token
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, password } = req.body || {};

    if (!token || !password) {
      res.status(400).json({ error: "Token et nouveau mot de passe requis" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    try {
      // Validate token
      const resetToken = await db.getValidPasswordResetToken(token);
      if (!resetToken) {
        res.status(400).json({ error: "Lien de réinitialisation invalide ou expiré. Veuillez refaire une demande." });
        return;
      }

      // Get user
      const user = await db.getUserById(resetToken.userId);
      if (!user) {
        res.status(400).json({ error: "Utilisateur introuvable" });
        return;
      }

      // Hash new password and update
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await db.setUserPasswordHash(user.openId, passwordHash);

      // Mark token as used
      await db.markPasswordResetTokenUsed(token);

      // Auto-login: create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "",
        expiresInMs: SESSION_DURATION_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.json({ success: true, message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      console.error("[Auth] Reset password failed", error);
      res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe" });
    }
  });

  // GET /api/auth/validate-reset-token?token=xxx - Validate a reset token
  app.get("/api/auth/validate-reset-token", async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      res.status(400).json({ valid: false, error: "Token manquant" });
      return;
    }
    try {
      const resetToken = await db.getValidPasswordResetToken(token);
      if (!resetToken) {
        res.status(400).json({ valid: false, error: "Lien invalide ou expiré" });
        return;
      }
      res.json({ valid: true });
    } catch (error) {
      console.error("[Auth] Validate reset token failed", error);
      res.status(500).json({ valid: false, error: "Erreur de validation" });
    }
  });

  // GET /api/auth/validate-invitation?token=xxx - Validate an invitation token
  app.get("/api/auth/validate-invitation", async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token d'invitation manquant" });
      return;
    }
    try {
      const invitation = await db.getInvitationByToken(token);
      if (!invitation) {
        res.status(404).json({ error: "Invitation introuvable ou invalide" });
        return;
      }
      if (invitation.status === "accepted") {
        res.status(410).json({ error: "Cette invitation a d\u00e9j\u00e0 \u00e9t\u00e9 utilis\u00e9e" });
        return;
      }
      if (invitation.status === "expired" || new Date(invitation.expiresAt) < new Date()) {
        res.status(410).json({ error: "Cette invitation a expir\u00e9" });
        return;
      }
      res.json({ valid: true, email: invitation.email, name: invitation.name });
    } catch (error) {
      console.error("[Auth] Validate invitation failed", error);
      res.status(500).json({ error: "Erreur lors de la validation" });
    }
  });

  // POST /api/auth/accept-invitation - Create account from invitation token
  app.post("/api/auth/accept-invitation", async (req: Request, res: Response) => {
    const { token, password, name } = req.body || {};

    if (!token || !password) {
      res.status(400).json({ error: "Token et mot de passe requis" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caract\u00e8res" });
      return;
    }

    try {
      const invitation = await db.getInvitationByToken(token);
      if (!invitation) {
        res.status(404).json({ error: "Invitation introuvable ou invalide" });
        return;
      }
      if (invitation.status === "accepted") {
        res.status(410).json({ error: "Cette invitation a d\u00e9j\u00e0 \u00e9t\u00e9 utilis\u00e9e" });
        return;
      }
      if (invitation.status === "expired" || new Date(invitation.expiresAt) < new Date()) {
        res.status(410).json({ error: "Cette invitation a expir\u00e9" });
        return;
      }

      const normalizedEmail = invitation.email.toLowerCase().trim();
      const finalName = (name || invitation.name || "Apprenant").trim();

      // Check if email already exists
      const existingUser = await db.getUserByEmail(normalizedEmail);
      if (existingUser) {
        // User already exists - just set password and mark invitation accepted
        await db.setUserPasswordHash(existingUser.openId, await bcrypt.hash(password, SALT_ROUNDS));
        await db.markInvitationAccepted(token);

        const sessionToken = await sdk.createSessionToken(existingUser.openId, {
          name: existingUser.name || finalName,
          expiresInMs: SESSION_DURATION_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });
        res.json({ success: true, name: existingUser.name || finalName });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Generate a unique openId for this user
      const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Create user
      await db.upsertUser({
        openId,
        name: finalName,
        email: normalizedEmail,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Set password hash
      await db.setUserPasswordHash(openId, passwordHash);

      // Mark invitation as accepted
      await db.markInvitationAccepted(token);

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: finalName,
        expiresInMs: SESSION_DURATION_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.json({ success: true, name: finalName });
    } catch (error) {
      console.error("[Auth] Accept invitation failed", error);
      res.status(500).json({ error: "Erreur lors de la cr\u00e9ation du compte" });
    }
  });
}
