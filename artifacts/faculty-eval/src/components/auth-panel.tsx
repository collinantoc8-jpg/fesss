import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type SelfServiceRole = "student" | "peer";

interface AuthPanelProps {
  allowLocalRegistration: boolean;
  selfServiceRoles: SelfServiceRole[];
  onLocalLogin: (email: string, password: string) => Promise<void>;
  onLocalRegister: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: SelfServiceRole;
  }) => Promise<void>;
  onAdminAccess: () => void;
  className?: string;
}

type AuthTab = "sign-in" | "create-account";

export function AuthPanel({
  allowLocalRegistration,
  selfServiceRoles,
  onLocalLogin,
  onLocalRegister,
  onAdminAccess,
  className,
}: AuthPanelProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<SelfServiceRole>("student");

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  useEffect(() => {
    if (!selfServiceRoles.includes(registerRole)) {
      setRegisterRole(selfServiceRoles[0] ?? "student");
    }
  }, [registerRole, selfServiceRoles]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onLocalLogin(loginEmail, loginPassword);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onLocalRegister({
        firstName: registerFirstName,
        lastName: registerLastName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create your account right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("rounded-[2rem] border border-border bg-card p-6 shadow-lg", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold text-foreground">
          Login
        </h2>
        <p className="text-sm text-muted-foreground">
          Use your account to continue. Students and peers get evaluation access.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RolePill label="Student" accent="bg-primary/8 text-primary" />
        <RolePill label="Peer" accent="bg-accent/15 text-accent-foreground" />
        <RolePill label="Admin" accent="bg-amber-500/12 text-amber-700" />
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AuthTab)}
        className="mt-6 space-y-4"
      >
        <TabsList className={`grid w-full ${allowLocalRegistration ? "grid-cols-2" : "grid-cols-1"}`}>
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          {allowLocalRegistration ? (
            <TabsTrigger value="create-account">Create Account</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="sign-in">
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <p className="text-sm text-muted-foreground">
              Sign in with the role already attached to your account.
            </p>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        {allowLocalRegistration ? (
          <TabsContent value="create-account">
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="space-y-2">
                <Label>Choose Role</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selfServiceRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRegisterRole(role)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        registerRole === role
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="block font-semibold">
                        {formatRoleLabel(role)}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {role === "student"
                          ? "Can evaluate and view statistics."
                          : "Can review and view statistics."}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={registerFirstName}
                    onChange={(event) => setRegisterFirstName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={registerLastName}
                    onChange={(event) => setRegisterLastName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Creating account..."
                  : `Create ${formatRoleLabel(registerRole)} Account`}
              </Button>
            </form>
          </TabsContent>
        ) : null}
      </Tabs>

      <div className="mt-6 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onAdminAccess}
        >
          <Shield className="h-4 w-4" />
          Admin Access
        </Button>
      </div>
    </div>
  );
}

function RolePill({ label, accent }: { label: string; accent: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", accent)}>
      {label}
    </span>
  );
}

function formatRoleLabel(role: SelfServiceRole): string {
  return role === "student" ? "Student" : "Peer";
}
