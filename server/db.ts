import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

/**
 * Shared in-flight promise so that many concurrent callers during reconnect
 * all wait for the SAME new pool instead of each trying to create their own.
 */
let _connectingPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;

/**
 * Timestamp of the last successful resetDb().  We enforce a 10-second
 * cooldown so that a burst of simultaneous errors (one per concurrent query)
 * only destroys the pool once — the second caller skips the reset and waits
 * for the first reset/reconnect cycle to complete.
 */
let _lastResetAt = 0;
const RESET_COOLDOWN_MS = 10_000;

/**
 * Force-close the current DB client and clear the cached instance.
 * Rate-limited to once per 10 s to prevent concurrent error handlers from
 * racing and destroying a freshly-created pool.
 */
export async function resetDb() {
  const now = Date.now();
  if (now - _lastResetAt < RESET_COOLDOWN_MS) {
    console.warn("[Database] Reset skipped — cooldown active, waiting for reconnect");
    return;
  }
  _lastResetAt = now;
  console.warn("[Database] Resetting stale connection pool...");
  const old = _client;
  _db = null;
  _client = null;
  if (old) {
    try {
      await old.end({ timeout: 1 });
    } catch {
      // Best-effort close; ignore if already dead.
    }
  }

  // Clear connecting promise AFTER old connection is destroyed to prevent
  // concurrent callers from spawning dozens of new pools in parallel.
  _connectingPromise = null;
}

async function _doConnect(): Promise<ReturnType<typeof drizzle> | null> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[Database] DATABASE_URL not set");
    return null;
  }
  try {
    _client = postgres(dbUrl, {
      ssl: "require",
      prepare: false,
      // Root cause of "admin dashboard sometimes hangs/loads blank",
      // reproduced locally with a load test: Admin.tsx fires ~7 concurrent
      // queries on mount. With max: 5 (and max: 2/3 in earlier attempts),
      // the pool couldn't serve them all at once - one or more connections
      // got killed (CONNECTION_DESTROYED) under the concurrent load, which
      // triggered this file's resetDb() and threw away the WHOLE pool,
      // including connections other in-flight queries were using. Every
      // affected query then paid a full reconnect+reverify cost (15-18s
      // measured) before finally succeeding. Raising max so the pool can
      // actually serve 7+ concurrent queries at once (Supabase's Supavisor
      // transaction-mode pooler multiplexes this comfortably - it's not
      // 20 real Postgres connections) took the same load test from
      // 17-18s down to under 1s, reproduced consistently across runs.
      fetch_types: false,
      max: 20,
      // Supabase shared pooler drops idle connections after ~5 min.
      // Keep max_lifetime well under that so the pool self-refreshes.
      max_lifetime: 60 * 4,  // 4 minutes
      idle_timeout: 20,      // release idle connections quickly
      connect_timeout: 15,   // allow up to 15s for new TCP connections
    });
    _db = drizzle(_client);

    // Verify the pool actually works before handing it to callers.
    await _client`SELECT 1`;
    console.log("[Database] Connected and verified successfully");
    return _db;
  } catch (error: any) {
    console.error("[Database] Failed to connect/verify:", error.message || error);
    _db = null;
    if (_client) {
      try { await (_client as any).end({ timeout: 1 }); } catch {}
      _client = null;
    }
    return null;
  } finally {
    // Clear the in-flight promise so the NEXT getDb() call after a failure
    // can try again from scratch.
    _connectingPromise = null;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
// Concurrent callers share the in-flight promise — only ONE new pool is
// ever created at a time.
export async function getDb() {
  if (_db) return _db;
  if (_connectingPromise) return _connectingPromise;
  _connectingPromise = _doConnect();
  return _connectingPromise;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = [
      "name",
      "email",
      "phone",
      "loginMethod",
      "passwordHash",
      "avatarUrl",
    ] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserResetToken(
  userId: number,
  token: string | null,
  expiry: Date | null
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      resetToken: token,
      resetTokenExpiry: expiry,
    })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    })
    .where(eq(users.id, userId));
}
