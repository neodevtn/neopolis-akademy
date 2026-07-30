import type { Express, Request, Response } from "express";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@shared/const";
import bcrypt from "bcryptjs";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const SALT_ROUNDS = 10;

export function registerAuthRoutes(app: Express) {
  // POST /api/auth/login - Authenticate with email/password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
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
    res.status(403).json({ error: "L'inscription libre est d\u00e9sactiv\u00e9e. Vous devez recevoir une invitation pour cr\u00e9er un compte." });
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
