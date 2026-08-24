import { createHmac, timingSafeEqual } from "crypto";
import { ENV } from "./env";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload: string): string {
  return createHmac("sha256", ENV.cookieSecret).update(payload).digest("hex");
}

export function verifyAdminPasscode(passcode: string): boolean {
  if (!ENV.adminPasscode) return false;
  const a = Buffer.from(passcode);
  const b = Buffer.from(ENV.adminPasscode);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function issueAdminToken(): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `admin:${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [label, expiresAtStr, signature] = parts;
    if (label !== "admin") return false;

    const expiresAt = Number(expiresAtStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = sign(`${label}:${expiresAtStr}`);
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
