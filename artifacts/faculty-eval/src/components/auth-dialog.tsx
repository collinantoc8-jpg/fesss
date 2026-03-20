import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Shield } from "lucide-react";
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

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowStudentRegistration: boolean;
  onStudentLogin: (email: string, password: string) => Promise<void>;
  onStudentRegister: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  onAdminAccess: () => void;
}

type AuthTab = "sign-in" | "create-account";

export function AuthDialog({
  open,
  onOpenChange,
  allowStudentRegistration,
  onStudentLogin,
  onStudentRegister,
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

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onStudentLogin(loginEmail, loginPassword);
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
      await onStudentRegister({
        firstName: registerFirstName,
        lastName: registerLastName,
        email: registerEmail,
        password: registerPassword,
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
            Student accounts are available in local mode for evaluation access.
            These local accounts reset when the app restarts.
          </DialogDescription>
        </DialogHeader>

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
          <TabsList className={`grid w-full ${allowStudentRegistration ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="sign-in">Student Sign In</TabsTrigger>
            {allowStudentRegistration ? (
              <TabsTrigger value="create-account">Create Account</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="sign-in">
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <Label htmlFor="student-login-email">Email</Label>
                <Input
                  id="student-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-login-password">Password</Label>
                <Input
                  id="student-login-password"
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

          {allowStudentRegistration ? (
            <TabsContent value="create-account">
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student-first-name">First Name</Label>
                    <Input
                      id="student-first-name"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={registerFirstName}
                      onChange={(event) => setRegisterFirstName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-last-name">Last Name</Label>
                    <Input
                      id="student-last-name"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={registerLastName}
                      onChange={(event) => setRegisterLastName(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-register-email">Email</Label>
                  <Input
                    id="student-register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="student@example.com"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-register-password">Password</Label>
                  <Input
                    id="student-register-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Student Account"}
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
