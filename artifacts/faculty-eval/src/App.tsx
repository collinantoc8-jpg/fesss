import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { useAuthContext } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui-patterns";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import FacultyList from "@/pages/faculty-list";
import FacultyDetail from "@/pages/faculty-detail";
import Evaluate from "@/pages/evaluate";
import Results from "@/pages/results";
import Admin from "@/pages/admin";
import Login from "@/pages/login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);

  return null;
}

function AuthenticatedRoutes() {
  const { user } = useAuthContext();
  const isLimitedUser = user?.role !== "admin";

  return (
    <AppLayout>
      <Switch>
        {isLimitedUser ? (
          <>
            <Route path="/" component={() => <Redirect to="/evaluate" />} />
            <Route path="/login" component={() => <Redirect to="/evaluate" />} />
            <Route path="/evaluate" component={Evaluate} />
            <Route path="/results" component={Results} />
            <Route path="/faculty/:id" component={FacultyDetail} />
            <Route component={() => <Redirect to="/evaluate" />} />
          </>
        ) : (
          <>
            <Route path="/login" component={() => <Redirect to="/" />} />
            <Route path="/" component={Home} />
            <Route path="/faculty" component={FacultyList} />
            <Route path="/faculty/:id" component={FacultyDetail} />
            <Route path="/evaluate" component={Evaluate} />
            <Route path="/results" component={Results} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </>
        )}
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    );
  }

  return (
    <AuthenticatedRoutes />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
