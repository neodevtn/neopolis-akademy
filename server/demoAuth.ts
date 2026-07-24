import type { Express, Request, Response } from "express";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@shared/const";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

// Demo credentials
const DEMO_EMAIL = "apprenant@neopolis.demo";
const DEMO_PASSWORD = "NeoDemo2026!";
const DEMO_OPEN_ID = "demo_learner_001";
const DEMO_NAME = "Apprenant Démo";

export function registerDemoAuthRoutes(app: Express) {
  // POST /api/demo-login - Authenticate with demo credentials
  app.post("/api/demo-login", async (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }

    try {
      // Upsert the demo user in the database
      await db.upsertUser({
        openId: DEMO_OPEN_ID,
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        loginMethod: "demo",
        lastSignedIn: new Date(),
      });

      // Create a session token
      const sessionToken = await sdk.createSessionToken(DEMO_OPEN_ID, {
        name: DEMO_NAME,
        expiresInMs: SESSION_DURATION_MS,
      });

      // Set the session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.json({ success: true, name: DEMO_NAME });
    } catch (error) {
      console.error("[DemoAuth] Login failed", error);
      res.status(500).json({ error: "Erreur lors de la connexion démo" });
    }
  });
}
