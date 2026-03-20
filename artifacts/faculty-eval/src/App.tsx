import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import FacultyList from "@/pages/faculty-list";
import FacultyDetail from "@/pages/faculty-detail";
import Evaluate from "@/pages/evaluate";
import Results from "@/pages/results";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/faculty" component={FacultyList} />
      <Route path="/faculty/:id" component={FacultyDetail} />
      <Route path="/evaluate" component={Evaluate} />
      <Route path="/results" component={Results} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppLayout>
              <Router />
            </AppLayout>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
