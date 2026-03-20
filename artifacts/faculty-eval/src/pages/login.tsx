import { BarChart3, ClipboardList, ShieldCheck } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { AuthPanel } from "@/components/auth-panel";

export default function Login() {
  const {
    allowLocalRegistration,
    selfServiceRoles,
    login,
    loginWithCredentials,
    registerLocalAccount,
  } = useAuthContext();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
            Faculty Evaluation System
          </span>
          <h1 className="mt-5 text-4xl font-display font-bold tracking-tight text-foreground sm:text-5xl">
            Simple sign in for students, peers, and admin
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Students and peers can access evaluation criteria and evaluation
            stats. Admin accounts can also manage faculty, departments,
            criteria, and student logins.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <FeatureChip icon={<ClipboardList className="h-4 w-4" />} label="Evaluation Criteria" />
            <FeatureChip icon={<BarChart3 className="h-4 w-4" />} label="Evaluation Stats" />
            <FeatureChip icon={<ShieldCheck className="h-4 w-4" />} label="Admin Tools" />
          </div>
        </div>

        <AuthPanel
          className="mt-8 w-full max-w-xl"
          allowLocalRegistration={allowLocalRegistration}
          selfServiceRoles={selfServiceRoles}
          onLocalLogin={loginWithCredentials}
          onLocalRegister={registerLocalAccount}
          onAdminAccess={login}
        />
      </div>
    </div>
  );
}

function FeatureChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 shadow-sm">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
