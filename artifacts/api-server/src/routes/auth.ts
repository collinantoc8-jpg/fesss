import { Router, type IRouter, type Request, type Response } from "express";
import {
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  GetCurrentAuthUserResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import {
  getLocalDevUserFromRequest,
  isLocalAuthMode,
  LOCAL_AUTH_COOKIE,
  LOCAL_AUTH_TOKEN,
} from "../lib/local-auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const LOCAL_AUTH_TTL = 30 * 24 * 60 * 60 * 1000;

const router: IRouter = Router();

function isSecureRequest(req: Request): boolean {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(",")[0]?.trim();

  return (proto ?? req.protocol) === "https";
}

function getOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];

  const proto =
    (Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto?.split(",")[0]?.trim()) ??
    req.protocol ??
    "http";
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ??
    req.headers["host"] ??
    "localhost:3001";

  return `${proto}://${host}`;
}

function setSessionCookie(
  req: Request,
  res: Response,
  cookieName: string,
  value: string,
  maxAge: number,
) {
  res.cookie(cookieName, value, {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

function setOidcCookie(req: Request, res: Response, name: string, value: string) {
  setSessionCookie(req, res, name, value, OIDC_COOKIE_TTL);
}

function getSafeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }

  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const { db, usersTable } = await import("@workspace/db");

  const userData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url || claims.picture) as
      | string
      | null,
  };

  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user:
        getLocalDevUserFromRequest(req) ??
        (req.isAuthenticated() ? req.user : null),
    }),
  );
});

router.get("/login", async (req: Request, res: Response) => {
  const returnTo = getSafeReturnTo(req.query.returnTo);

  if (isLocalAuthMode) {
    setSessionCookie(req, res, LOCAL_AUTH_COOKIE, "1", LOCAL_AUTH_TTL);
    res.redirect(returnTo);
    return;
  }

  const oidc = await import("openid-client");
  const { getOidcConfig } = await import("../lib/auth");
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(req, res, "code_verifier", codeVerifier);
  setOidcCookie(req, res, "nonce", nonce);
  setOidcCookie(req, res, "state", state);
  setOidcCookie(req, res, "return_to", returnTo);

  res.redirect(redirectTo.href);
});

router.get("/callback", async (req: Request, res: Response) => {
  if (isLocalAuthMode) {
    res.redirect("/");
    return;
  }

  const oidc = await import("openid-client");
  const {
    SESSION_COOKIE,
    SESSION_TTL,
    createSession,
    getOidcConfig,
  } = await import("../lib/auth");
  const config = await getOidcConfig();

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(req.originalUrl ?? req.url, getOrigin(req));

  let tokens: Awaited<ReturnType<typeof oidc.authorizationCodeGrant>>;

  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();

  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);
  const now = Math.floor(Date.now() / 1000);
  const sid = await createSession({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
      role: dbUser.role,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  });

  setSessionCookie(req, res, SESSION_COOKIE, sid, SESSION_TTL);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  if (isLocalAuthMode) {
    res.clearCookie(LOCAL_AUTH_COOKIE, { path: "/" });
    res.redirect("/");
    return;
  }

  const oidc = await import("openid-client");
  const { clearSession, getOidcConfig, getSessionId } = await import(
    "../lib/auth"
  );
  const config = await getOidcConfig();
  const origin = getOrigin(req);

  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});

router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    const parsed = ExchangeMobileAuthorizationCodeBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid required parameters" });
      return;
    }

    const { code, code_verifier, redirect_uri, state, nonce } = parsed.data;

    if (isLocalAuthMode) {
      res.json(
        ExchangeMobileAuthorizationCodeResponse.parse({
          token: LOCAL_AUTH_TOKEN,
        }),
      );
      return;
    }

    try {
      const oidc = await import("openid-client");
      const {
        ISSUER_URL,
        createSession,
        getOidcConfig,
      } = await import("../lib/auth");
      const config = await getOidcConfig();

      const callbackUrl = new URL(redirect_uri);
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("state", state);
      callbackUrl.searchParams.set("iss", ISSUER_URL);

      const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: code_verifier,
        expectedNonce: nonce ?? undefined,
        expectedState: state,
        idTokenExpected: true,
      });

      const claims = tokens.claims();

      if (!claims) {
        res.status(401).json({ error: "No claims in ID token" });
        return;
      }

      const dbUser = await upsertUser(
        claims as unknown as Record<string, unknown>,
      );
      const now = Math.floor(Date.now() / 1000);
      const sid = await createSession({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          profileImageUrl: dbUser.profileImageUrl,
          role: dbUser.role,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
      });

      res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
    } catch (error) {
      console.error("Mobile token exchange error:", error);
      res.status(500).json({ error: "Token exchange failed" });
    }
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  if (isLocalAuthMode) {
    res.json(LogoutMobileSessionResponse.parse({ success: true }));
    return;
  }

  const { deleteSession, getSessionId } = await import("../lib/auth");
  const sid = getSessionId(req);

  if (sid) {
    await deleteSession(sid);
  }

  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
