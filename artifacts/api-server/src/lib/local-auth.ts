import type { Request } from "express";
import type { AuthUser } from "@workspace/api-zod";

export const isLocalAuthMode = !process.env.DATABASE_URL;
export const LOCAL_AUTH_COOKIE = "local_dev_auth";
export const LOCAL_AUTH_TOKEN = "local-dev-session-token";

export const LOCAL_DEV_USER: AuthUser = {
  id: "local-admin",
  email: "local-admin@example.com",
  firstName: "Local",
  lastName: "Admin",
  profileImageUrl: null,
  role: "admin",
};

export function getLocalDevUserFromRequest(req: Request): AuthUser | null {
  const authHeader = req.headers["authorization"];
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (headerValue === `Bearer ${LOCAL_AUTH_TOKEN}`) {
    return LOCAL_DEV_USER;
  }

  if (req.cookies?.[LOCAL_AUTH_COOKIE] === "1") {
    return LOCAL_DEV_USER;
  }

  return null;
}
