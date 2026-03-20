import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

type AuthMode = "local" | "oidc";

interface AuthModeResponse {
  mode: AuthMode;
  allowStudentRegistration: boolean;
}

interface AuthUserResponse {
  user: AuthUser | null;
}

interface StudentRegistrationInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authMode: AuthMode;
  isLocalAuth: boolean;
  allowStudentRegistration: boolean;
  login: () => void;
  logout: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerStudent: (input: StudentRegistrationInput) => Promise<void>;
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
  const [allowStudentRegistration, setAllowStudentRegistration] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const [modeData, userData] = await Promise.all([
        getJson<AuthModeResponse>("/api/auth/mode"),
        getJson<AuthUserResponse>("/api/auth/user"),
      ]);
      setAuthMode(modeData.mode);
      setAllowStudentRegistration(modeData.allowStudentRegistration);
      setUser(userData.user ?? null);
    } catch {
      setAuthMode("oidc");
      setAllowStudentRegistration(false);
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
      setAllowStudentRegistration(true);
      setUser(data.user);
    },
    [],
  );

  const registerStudent = useCallback(
    async (input: StudentRegistrationInput) => {
      const data = await getJson<{ user: AuthUser }>("/api/auth/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      setAuthMode("local");
      setAllowStudentRegistration(true);
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
    allowStudentRegistration,
    login,
    logout,
    loginWithCredentials,
    registerStudent,
    refresh,
  };
}
