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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(30,58,138,0.18),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <section className="flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm">
              Faculty Evaluation System
            </span>
            <h1 className="mt-6 text-4xl font-display font-bold leading-tight text-foreground sm:text-6xl">
              Sign in before entering the evaluation workspace.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Student accounts are limited to evaluation and evaluation stats.
              Admin accounts unlock department, faculty, and criteria management.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="Evaluate"
              description="Submit faculty evaluations from your own account role."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="View Stats"
              description="See evaluation results and detailed performance stats."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Admin"
              description="Management tools stay available only to admin accounts."
            />
          </div>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <AuthPanel
            className="w-full max-w-xl"
            allowLocalRegistration={allowLocalRegistration}
            selfServiceRoles={selfServiceRoles}
            onLocalLogin={loginWithCredentials}
            onLocalRegister={registerLocalAccount}
            onAdminAccess={login}
          />
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
