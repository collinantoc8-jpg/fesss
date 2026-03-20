import { createContext, useContext, type ReactNode } from "react";
import { useAuth, type AuthUser } from "@workspace/replit-auth-web";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authMode: "local" | "oidc";
  isLocalAuth: boolean;
  allowStudentRegistration: boolean;
  login: () => void;
  logout: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerStudent: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const value: AuthContextValue = {
    ...auth,
    isAdmin: auth.user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
