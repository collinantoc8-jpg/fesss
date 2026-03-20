import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

type AuthMode = "local" | "oidc";
type LocalRegistrationRole = "student" | "peer";

interface AuthModeResponse {
  mode: AuthMode;
  allowLocalRegistration: boolean;
  selfServiceRoles: LocalRegistrationRole[];
}

interface AuthUserResponse {
  user: AuthUser | null;
}

interface LocalRegistrationInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: LocalRegistrationRole;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authMode: AuthMode;
  isLocalAuth: boolean;
  allowLocalRegistration: boolean;
  selfServiceRoles: LocalRegistrationRole[];
  login: () => void;
  logout: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerLocalAccount: (input: LocalRegistrationInput) => Promise<void>;
  refresh: () => Promise<void>;
}

async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  });
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as T;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("oidc");
  const [allowLocalRegistration, setAllowLocalRegistration] = useState(false);
  const [selfServiceRoles, setSelfServiceRoles] = useState<LocalRegistrationRole[]>([
    "student",
    "peer",
  ]);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const [modeData, userData] = await Promise.all([
        getJson<AuthModeResponse>("/api/auth/mode"),
        getJson<AuthUserResponse>("/api/auth/user"),
      ]);
      setAuthMode(modeData.mode);
      setAllowLocalRegistration(modeData.allowLocalRegistration);
      setSelfServiceRoles(modeData.selfServiceRoles);
      setUser(userData.user ?? null);
    } catch {
      setAuthMode("oidc");
      setAllowLocalRegistration(false);
      setSelfServiceRoles(["student", "peer"]);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(() => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const data = await getJson<{ user: AuthUser }>("/api/auth/login-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      setAuthMode("local");
      setAllowLocalRegistration(true);
      setUser(data.user);
    },
    [],
  );

  const registerLocalAccount = useCallback(
    async (input: LocalRegistrationInput) => {
      const data = await getJson<{ user: AuthUser }>("/api/auth/register-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      setAuthMode("local");
      setAllowLocalRegistration(true);
      setUser(data.user);
    },
    [],
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authMode,
    isLocalAuth: authMode === "local",
    allowLocalRegistration,
    selfServiceRoles,
    login,
    logout,
    loginWithCredentials,
    registerLocalAccount,
    refresh,
  };
}
