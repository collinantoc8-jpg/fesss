import crypto from "crypto";
import type { Request } from "express";
import type { AuthUser } from "@workspace/api-zod";

export const isLocalAuthMode = !process.env.DATABASE_URL;
export const LOCAL_AUTH_COOKIE = "local_dev_auth";

type StoredLocalUser = AuthUser & {
  passwordHash: string | null;
};

const localUsers = new Map<string, StoredLocalUser>();
const localSessions = new Map<string, string>();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, expected] = passwordHash.split(":", 2);
  if (!salt || !expected) {
    return false;
  }

  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createStoredUser(
  user: Omit<AuthUser, "profileImageUrl"> & { profileImageUrl?: string | null },
  passwordHash: string | null,
): StoredLocalUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl ?? null,
    role: user.role,
    passwordHash,
  };
}

export const LOCAL_ADMIN_USER: AuthUser = {
  id: "local-admin",
  email: "admin@faculty-eval.local",
  firstName: "Local",
  lastName: "Admin",
  profileImageUrl: null,
  role: "admin",
};

localUsers.set(
  LOCAL_ADMIN_USER.id,
  createStoredUser(LOCAL_ADMIN_USER, null),
);

function toAuthUser(user: StoredLocalUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
  };
}

function findUserByEmail(email: string): StoredLocalUser | undefined {
  const normalizedEmail = normalizeEmail(email);
  return Array.from(localUsers.values()).find(
    (user) => normalizeEmail(user.email ?? "") === normalizedEmail,
  );
}

function getLocalSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (headerValue?.startsWith("Bearer ")) {
    return headerValue.slice(7);
  }

  return req.cookies?.[LOCAL_AUTH_COOKIE] ?? null;
}

export function getLocalUserFromRequest(req: Request): AuthUser | null {
  const sessionToken = getLocalSessionToken(req);
  if (!sessionToken) {
    return null;
  }

  const userId = localSessions.get(sessionToken);
  if (!userId) {
    return null;
  }

  const user = localUsers.get(userId);
  return user ? toAuthUser(user) : null;
}

export function createLocalSession(userId: string): string | null {
  if (!localUsers.has(userId)) {
    return null;
  }

  const sessionToken = crypto.randomUUID();
  localSessions.set(sessionToken, userId);
  return sessionToken;
}

export function clearLocalSession(sessionToken?: string | null): void {
  if (!sessionToken) {
    return;
  }

  localSessions.delete(sessionToken);
}

export function getLocalSessionTokenFromRequest(req: Request): string | null {
  return getLocalSessionToken(req);
}

export function registerLocalStudentAccount(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): { user: AuthUser } | { error: string } {
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const password = input.password;

  if (!email || !firstName || !lastName || password.length < 6) {
    return { error: "Please provide a valid name, email, and password." };
  }

  if (findUserByEmail(email)) {
    return { error: "An account with that email already exists." };
  }

  const id = crypto.randomUUID();
  const user = createStoredUser(
    {
      id,
      email,
      firstName,
      lastName,
      profileImageUrl: null,
      role: "student",
    },
    hashPassword(password),
  );

  localUsers.set(id, user);
  return { user: toAuthUser(user) };
}

export function loginLocalAccount(input: {
  email: string;
  password: string;
}): { user: AuthUser } | { error: string } {
  const user = findUserByEmail(input.email);

  if (!user || !user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  return { user: toAuthUser(user) };
}
