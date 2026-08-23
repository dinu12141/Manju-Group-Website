import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { OAuth2Client } from "google-auth-library";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const DEFAULT_REDIRECT = "/account";

function getCallbackUrl(req: Request): string {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  const protocol =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    req.get("host") ||
    "localhost:3000";
  return `${protocol}://${host}/api/oauth/google/callback`;
}

function encodeState(redirect: string): string {
  return Buffer.from(JSON.stringify({ redirect }), "utf-8").toString("base64");
}

function decodeState(state: string | undefined): string {
  if (!state) return DEFAULT_REDIRECT;
  try {
    const parsed = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8")
    ) as { redirect?: unknown };
    if (
      typeof parsed.redirect === "string" &&
      parsed.redirect.startsWith("/")
    ) {
      return parsed.redirect;
    }
    return DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

function isGoogleConfigured(): boolean {
  return Boolean(ENV.googleClientId && ENV.googleClientSecret);
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGoogleOAuthRoutes(app: Express) {
  app.get("/api/oauth/google/start", (req: Request, res: Response) => {
    if (!isGoogleConfigured()) {
      res.redirect(302, "/account?error=google_not_configured");
      return;
    }

    const redirectParam = getQueryParam(req, "redirect") || DEFAULT_REDIRECT;
    const redirectUri = getCallbackUrl(req);

    const client = new OAuth2Client({
      clientId: ENV.googleClientId,
      clientSecret: ENV.googleClientSecret,
      redirectUri,
    });

    const authUrl = client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state: encodeState(redirectParam),
      prompt: "select_account",
    });

    res.redirect(302, authUrl);
  });

  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    if (!isGoogleConfigured()) {
      res.redirect(302, "/account?error=google_not_configured");
      return;
    }

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const errorParam = getQueryParam(req, "error");
    const redirectPath = decodeState(state);

    if (errorParam) {
      console.warn(
        "[GoogleOAuth] Callback returned error from Google:",
        errorParam
      );
      res.redirect(
        302,
        `/account?error=google_auth_failed&reason=${encodeURIComponent(errorParam)}`
      );
      return;
    }

    if (!code) {
      res.redirect(
        302,
        "/account?error=google_auth_failed&reason=Missing+authorization+code"
      );
      return;
    }

    try {
      const redirectUri = getCallbackUrl(req);
      const client = new OAuth2Client({
        clientId: ENV.googleClientId,
        clientSecret: ENV.googleClientSecret,
        redirectUri,
      });

      const { tokens } = await client.getToken(code);
      if (!tokens.id_token) {
        throw new Error("No id_token returned from Google");
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: ENV.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new Error("Invalid Google ID token payload");
      }

      let openId = `google_${payload.sub}`;
      const existingUserByOpenId = await db.getUserByOpenId(openId);

      if (existingUserByOpenId) {
        await db.upsertUser({
          openId,
          name: payload.name || existingUserByOpenId.name || null,
          email: payload.email ?? existingUserByOpenId.email ?? null,
          avatarUrl: payload.picture || existingUserByOpenId.avatarUrl || null,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
      } else if (payload.email) {
        const existingUserByEmail = await db.getUserByEmail(payload.email);
        if (existingUserByEmail) {
          openId = existingUserByEmail.openId;
          await db.upsertUser({
            openId,
            name: payload.name || existingUserByEmail.name || null,
            avatarUrl: payload.picture || existingUserByEmail.avatarUrl || null,
            lastSignedIn: new Date(),
          });
        } else {
          await db.upsertUser({
            openId,
            name: payload.name || null,
            email: payload.email ?? null,
            avatarUrl: payload.picture || null,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
        }
      } else {
        await db.upsertUser({
          openId,
          name: payload.name || null,
          email: payload.email ?? null,
          avatarUrl: payload.picture || null,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: payload.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, redirectPath);
    } catch (error: any) {
      const details =
        error?.response?.data?.error_description ||
        error?.response?.data?.error ||
        error?.message ||
        String(error);
      console.error("[GoogleOAuth] Callback failed:", details, error);
      res.redirect(
        302,
        `/account?error=google_auth_failed&reason=${encodeURIComponent(details)}`
      );
    }
  });
}
