/**
 * Authentication Providers
 * 
 * This module provides authentication adapters for different providers:
 * - Auth0
 * - Clerk
 * - Manus OAuth (development only)
 * - Custom email/password (future)
 */

import { ENV } from "./env";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./sdk";

export interface UserInfo {
  openId: string;
  email?: string;
  name?: string;
  loginMethod?: string;
}

/**
 * Register authentication routes based on configured provider
 */
export function registerAuthRoutes(app: Express) {
  // Determine which auth provider to use
  const hasAuth0 = ENV.auth0Domain && ENV.auth0ClientId && ENV.auth0ClientSecret;
  const hasClerk = ENV.clerkSecretKey;
  const hasManus = ENV.oAuthServerUrl && ENV.appId;

  if (hasAuth0) {
    console.log("[Auth] Using Auth0 provider");
    registerAuth0Routes(app);
  } else if (hasClerk) {
    console.log("[Auth] Using Clerk provider");
    registerClerkRoutes(app);
  } else if (hasManus) {
    console.log("[Auth] Using Manus OAuth (development only)");
    registerManusRoutes(app);
  } else {
    console.warn("[Auth] No authentication provider configured!");
    console.warn("[Auth] Configure Auth0, Clerk, or Manus OAuth in environment variables");

    // Register fallback route to prevent 404s
    app.get("/api/oauth/login", (req, res) => {
      res.status(400).json({
        error: "No authentication provider configured",
        message: "Please configure Auth0, Clerk, or Manus OAuth variables in your backend environment.",
        details: "See .env.example for required variables"
      });
    });
  }
}

/**
 * Auth0 OAuth implementation
 */
function registerAuth0Routes(app: Express) {
  // Login: Redirect to Auth0
  app.get("/api/oauth/login", (req, res) => {
    const redirectUri = `${ENV.backendUrl}/api/oauth/callback`;
    const authUrl = new URL(`https://${ENV.auth0Domain}/authorize`);

    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", ENV.auth0ClientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "openid profile email");
    authUrl.searchParams.set("state", Buffer.from(redirectUri).toString("base64"));

    res.redirect(authUrl.toString());
  });

  // Callback: Exchange code for token
  app.get("/api/oauth/callback", async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    try {
      const redirectUri = `${ENV.backendUrl}/api/oauth/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch(`https://${ENV.auth0Domain}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: ENV.auth0ClientId,
          client_secret: ENV.auth0ClientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange code for token");
      }

      const tokens = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch(`https://${ENV.auth0Domain}/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error("Failed to get user info");
      }

      const userInfo = await userInfoResponse.json();

      // Use Auth0 sub as openId
      const openId = userInfo.sub;

      // Create or update user in database
      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email || null,
        loginMethod: "auth0",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to frontend
      res.redirect(ENV.frontendUrl || "/");
    } catch (error) {
      console.error("[Auth0] Callback failed:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
}

/**
 * Clerk implementation
 * Note: Clerk primarily uses client-side SDK, this is a minimal server setup
 */
function registerClerkRoutes(app: Express) {
  // Clerk handles most auth on the client side
  // We just need to validate sessions on the backend

  app.post("/api/auth/clerk-callback", async (req, res) => {
    const { userId, email, firstName, lastName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      // Create or update user
      await db.upsertUser({
        openId: userId,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || null,
        email: email || null,
        loginMethod: "clerk",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(userId, {
        name: firstName || "",
        expiresInMs: ONE_YEAR_MS,
      });

      res.json({ success: true, sessionToken });
    } catch (error) {
      console.error("[Clerk] Callback failed:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
}

/**
 * Manus OAuth implementation (original, for development)
 */
function registerManusRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, ENV.frontendUrl || "/");
    } catch (error) {
      console.error("[Manus OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
