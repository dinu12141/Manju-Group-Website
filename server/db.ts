import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;
let _connectAttempts = 0;
const MAX_CONNECT_RETRIES = 3;

function resetConnection() {
  _db = null;
  if (_client) {
    try { _client.end({ timeout: 2 }); } catch { /* ignore */ }
  }
  _client = null;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) return null;

  if (_connectAttempts >= MAX_CONNECT_RETRIES) {
    // Reset after 30 seconds to allow retry
    setTimeout(() => { _connectAttempts = 0; }, 30_000);
    return null;
  }

  try {
    _connectAttempts++;
    _client = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      prepare: false,
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
      max_lifetime: 60 * 5,
      onclose: () => {
        console.warn("[Database] Connection closed, will reconnect on next request");
        resetConnection();
      },
    });
    _db = drizzle(_client);
    _connectAttempts = 0; // reset on success
    console.log("[Database] Connected successfully");
  } catch (error: any) {
    console.warn("[Database] Failed to connect:", error.message || error);
    resetConnection();
  }
  return _db;
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

export async function updateUserResetToken(userId: number, token: string | null, expiry: Date | null) {
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
