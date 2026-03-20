import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Shield, UserRound, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type SelfServiceRole = "student" | "peer";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}

type AuthTab = "sign-in" | "create-account";

export function AuthDialog({
  open,
  onOpenChange,
  allowLocalRegistration,
  selfServiceRoles,
  onLocalLogin,
  onLocalRegister,
  onAdminAccess,
}: AuthDialogProps) {
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
    if (!open) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

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
      onOpenChange(false);
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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Choose the role you want to use. Student and peer accounts can be
            created here, while admin keeps a separate access path.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <RoleCard
            icon={<UserRound className="h-5 w-5" />}
            title="Student"
            description="Standard evaluation account"
            accent="border-primary/30 bg-primary/5 text-primary"
          />
          <RoleCard
            icon={<Users className="h-5 w-5" />}
            title="Peer"
            description="Colleague reviewer account"
            accent="border-accent/40 bg-accent/10 text-accent-foreground"
          />
          <RoleCard
            icon={<Shield className="h-5 w-5" />}
            title="Admin"
            description="Use the admin access button"
            accent="border-amber-500/30 bg-amber-500/10 text-amber-700"
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AuthTab)}
          className="space-y-4"
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
                Sign in with the role already attached to your account. Admin
                access uses the separate button below.
              </p>
              <div className="space-y-2">
                <Label htmlFor="local-login-email">Email</Label>
                <Input
                  id="local-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local-login-password">Password</Label>
                <Input
                  id="local-login-password"
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
                            ? "Submit evaluations as a student."
                            : "Submit evaluations as a peer reviewer."}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="local-first-name">First Name</Label>
                    <Input
                      id="local-first-name"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={registerFirstName}
                      onChange={(event) => setRegisterFirstName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local-last-name">Last Name</Label>
                    <Input
                      id="local-last-name"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={registerLastName}
                      onChange={(event) => setRegisterLastName(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local-register-email">Email</Label>
                  <Input
                    id="local-register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local-register-password">Password</Label>
                  <Input
                    id="local-register-password"
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

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onAdminAccess}
          >
            <Shield className="h-4 w-4" />
            Admin Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-4", accent)}>
      <div className="mb-3 inline-flex rounded-xl bg-white/50 p-2">{icon}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm opacity-80">{description}</p>
    </div>
  );
}

function formatRoleLabel(role: SelfServiceRole): string {
  return role === "student" ? "Student" : "Peer";
}
