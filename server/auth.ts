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

  // POST /api/auth/register - Create a new account
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      res.status(400).json({ error: "Nom, email et mot de passe requis" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if email already exists
      const existingUser = await db.getUserByEmail(normalizedEmail);
      if (existingUser) {
        res.status(409).json({ error: "Un compte avec cet email existe déjà" });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Generate a unique openId for this user
      const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Create user
      await db.upsertUser({
        openId,
        name: name.trim(),
        email: normalizedEmail,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Set password hash separately (upsertUser doesn't handle it)
      await db.setUserPasswordHash(openId, passwordHash);

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name.trim(),
        expiresInMs: SESSION_DURATION_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.json({ success: true, name: name.trim() });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });
}
